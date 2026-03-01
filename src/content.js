// Content script for Image Text Extractor Chrome Extension
// Implements area selection and screen capture functionality

import Tesseract from 'tesseract.js';

class ScreenCaptureExtractor {
  constructor() {
    this.isActive = false;
    this.isSelecting = false;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    
    // DOM elements
    this.overlay = null;
    this.selectionBox = null;
    this.resultPopup = null;
    
    this.init();
  }

  init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
    
    // Bind event handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'activateCaptureMode':
        this.activateCaptureMode();
        sendResponse({ success: true });
        break;
      
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  // Step 1: Activation - Create overlay and enter capture mode
  activateCaptureMode() {
    if (this.isActive) {
      this.deactivateCaptureMode();
      return;
    }

    this.isActive = true;
    this.createOverlay();
    this.addEventListeners();
    
    // Change cursor to crosshair
    document.body.style.cursor = 'crosshair';
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'captureModeActivated' });
  }

  createOverlay() {
    // Create full-page dark overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'text-extractor-overlay';
    
    // Create four overlay panels to create the "cutout" effect
    this.overlayTop = document.createElement('div');
    this.overlayTop.className = 'text-extractor-overlay-panel';
    this.overlayTop.id = 'text-extractor-overlay-top';
    
    this.overlayRight = document.createElement('div');
    this.overlayRight.className = 'text-extractor-overlay-panel';
    this.overlayRight.id = 'text-extractor-overlay-right';
    
    this.overlayBottom = document.createElement('div');
    this.overlayBottom.className = 'text-extractor-overlay-panel';
    this.overlayBottom.id = 'text-extractor-overlay-bottom';
    
    this.overlayLeft = document.createElement('div');
    this.overlayLeft.className = 'text-extractor-overlay-panel';
    this.overlayLeft.id = 'text-extractor-overlay-left';
    
    // Create selection box (initially hidden)
    this.selectionBox = document.createElement('div');
    this.selectionBox.id = 'text-extractor-selection';
    
    // Create dimensions display
    this.dimensionsDisplay = document.createElement('div');
    this.dimensionsDisplay.id = 'text-extractor-dimensions';
    
    // Append all elements
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.overlayTop);
    document.body.appendChild(this.overlayRight);
    document.body.appendChild(this.overlayBottom);
    document.body.appendChild(this.overlayLeft);
    document.body.appendChild(this.selectionBox);
    document.body.appendChild(this.dimensionsDisplay);
    
    // Show instruction
    this.showInstruction();
  }

  showInstruction() {
    const instruction = document.createElement('div');
    instruction.id = 'text-extractor-instruction';
    instruction.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000001;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    instruction.textContent = 'Click and drag to select area • Press ESC to cancel';
    
    document.body.appendChild(instruction);
    
    // Remove instruction after 3 seconds
    setTimeout(() => {
      if (instruction.parentNode) {
        instruction.parentNode.removeChild(instruction);
      }
    }, 3000);
  }

  addEventListeners() {
    this.overlay.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  removeEventListeners() {
    if (this.overlay) {
      this.overlay.removeEventListener('mousedown', this.handleMouseDown);
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  // Step 2: Area Selection - Handle drag to select
  handleMouseDown(event) {
    if (!this.isActive || this.isSelecting) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isSelecting = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.endX = event.clientX;
    this.endY = event.clientY;
    
    // Show selection box
    this.selectionBox.style.display = 'block';
    this.updateSelectionBox();
  }

  handleMouseMove(event) {
    if (!this.isActive || !this.isSelecting) return;
    
    event.preventDefault();
    
    this.endX = event.clientX;
    this.endY = event.clientY;
    
    this.updateSelectionBox();
  }

  handleMouseUp(event) {
    if (!this.isActive || !this.isSelecting) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isSelecting = false;
    
    // Check if selection is large enough (minimum 10x10 pixels)
    const width = Math.abs(this.endX - this.startX);
    const height = Math.abs(this.endY - this.startY);
    
    if (width < 10 || height < 10) {
      this.showError('Selection too small. Please select a larger area.');
      return;
    }
    
    // Proceed with capture
    this.captureSelectedArea();
  }

  handleKeyDown(event) {
    if (!this.isActive) return;
    
    if (event.key === 'Escape') {
      event.preventDefault();
      this.deactivateCaptureMode();
    }
  }

  updateSelectionBox() {
    const left = Math.min(this.startX, this.endX);
    const top = Math.min(this.startY, this.endY);
    const width = Math.abs(this.endX - this.startX);
    const height = Math.abs(this.endY - this.startY);
    
    // Update selection box
    this.selectionBox.style.left = left + 'px';
    this.selectionBox.style.top = top + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';
    
    // Update overlay panels to create cutout effect
    // Top panel: from top of screen to top of selection
    this.overlayTop.style.left = '0';
    this.overlayTop.style.top = '0';
    this.overlayTop.style.width = '100vw';
    this.overlayTop.style.height = top + 'px';
    
    // Right panel: from right of selection to right of screen
    this.overlayRight.style.left = (left + width) + 'px';
    this.overlayRight.style.top = top + 'px';
    this.overlayRight.style.width = 'calc(100vw - ' + (left + width) + 'px)';
    this.overlayRight.style.height = height + 'px';
    
    // Bottom panel: from bottom of selection to bottom of screen
    this.overlayBottom.style.left = '0';
    this.overlayBottom.style.top = (top + height) + 'px';
    this.overlayBottom.style.width = '100vw';
    this.overlayBottom.style.height = 'calc(100vh - ' + (top + height) + 'px)';
    
    // Left panel: from left of screen to left of selection
    this.overlayLeft.style.left = '0';
    this.overlayLeft.style.top = top + 'px';
    this.overlayLeft.style.width = left + 'px';
    this.overlayLeft.style.height = height + 'px';
    
    // Update dimensions display
    if (width > 0 && height > 0) {
      this.dimensionsDisplay.textContent = `${Math.round(width)} × ${Math.round(height)}`;
      this.dimensionsDisplay.style.display = 'block';
      
      // Position dimensions display near cursor
      const displayX = this.endX + 10;
      const displayY = this.endY + 10;
      
      // Keep within viewport
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 30;
      
      this.dimensionsDisplay.style.left = Math.min(displayX, maxX) + 'px';
      this.dimensionsDisplay.style.top = Math.min(displayY, maxY) + 'px';
    }
  }

  // Step 3: Image Capture - Capture only the selected area
  async captureSelectedArea() {
    try {
      // Calculate selection bounds
      const left = Math.min(this.startX, this.endX);
      const top = Math.min(this.startY, this.endY);
      const width = Math.abs(this.endX - this.startX);
      const height = Math.abs(this.endY - this.startY);
      
      // Temporarily hide overlay and selection box for clean capture
      this.overlay.style.display = 'none';
      this.selectionBox.style.display = 'none';
      
      // Wait a frame for DOM to update
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Request screenshot from background script
      const response = await chrome.runtime.sendMessage({
        action: 'captureVisibleTab',
        selection: { left, top, width, height, devicePixelRatio: window.devicePixelRatio }
      });
      
      if (response.success && response.imageData) {
        // Crop the image in content script context
        const croppedImage = await this.cropImage(response.imageData, response.selection);
        
        // Step 4: OCR Processing
        await this.processImageWithOCR(croppedImage, left, top);
      } else {
        throw new Error(response.error || 'Failed to capture screenshot');
      }
      
    } catch (error) {
      console.error('Capture failed:', error);
      this.showError('Failed to capture area: ' + error.message);
      this.deactivateCaptureMode();
    }
  }

  // Crop image to selection bounds (runs in content script context)
  async cropImage(dataUrl, selection) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = selection.width * selection.devicePixelRatio;
        canvas.height = selection.height * selection.devicePixelRatio;
        const ctx = canvas.getContext('2d');
        
        // Draw the cropped portion
        ctx.drawImage(
          img,
          selection.left * selection.devicePixelRatio,
          selection.top * selection.devicePixelRatio,
          selection.width * selection.devicePixelRatio,
          selection.height * selection.devicePixelRatio,
          0,
          0,
          selection.width * selection.devicePixelRatio,
          selection.height * selection.devicePixelRatio
        );
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load screenshot'));
      img.src = dataUrl;
    });
  }

  async captureAreaToCanvas(left, top, width, height) {
    // Create canvas for the selected area
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Use html2canvas approach - render DOM elements in the selected area
    const elements = document.elementsFromPoint(left + width/2, top + height/2);
    
    // For now, use a simpler approach with canvas API
    // This captures the visible content in the selected area
    try {
      // Create a temporary div to hold the content
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: fixed;
        left: ${left}px;
        top: ${top}px;
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        z-index: -1;
        background: white;
      `;
      
      // Clone the body content
      const bodyClone = document.body.cloneNode(true);
      
      // Remove our extension elements from the clone
      const extensionElements = bodyClone.querySelectorAll('[id^="text-extractor"]');
      extensionElements.forEach(el => el.remove());
      
      tempDiv.appendChild(bodyClone);
      document.body.appendChild(tempDiv);
      
      // Use foreign object to render HTML to canvas
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: ${width}px;
              height: ${height}px;
              transform: translate(-${left}px, -${top}px);
              overflow: hidden;
            ">
              ${document.documentElement.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;
      
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          tempDiv.remove();
          resolve(canvas);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          tempDiv.remove();
          
          // Fallback: create a simple canvas with background color
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#333333';
          ctx.font = '16px Arial';
          ctx.fillText('Screen capture not available', 10, 30);
          ctx.fillText('Please try selecting text directly', 10, 50);
          
          resolve(canvas);
        };
        
        img.src = url;
      });
      
    } catch (error) {
      console.error('Canvas capture failed:', error);
      
      // Ultimate fallback - create a placeholder canvas
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Screen capture unavailable', width/2, height/2 - 10);
      ctx.fillText('Browser security restrictions', width/2, height/2 + 10);
      
      return canvas;
    }
  }

  // Step 4: OCR Processing - Simplified with better error handling
  async processImageWithOCR(imageData, popupX, popupY) {
    try {
      this.showLoadingIndicator();
      this.updateLoadingIndicator('Initializing OCR engine...');
      
      // Store popup position
      this.popupX = popupX;
      this.popupY = popupY;
      
      // Create Tesseract worker with local paths (required for Chrome extensions)
      const workerPath = chrome.runtime.getURL('worker.min.js');
      const corePath = chrome.runtime.getURL('tesseract-core-simd.wasm.js');
      const worker = await Tesseract.createWorker({
        workerPath: workerPath,
        corePath: corePath,
        logger: (m) => {
          console.log('Tesseract:', m);
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            this.updateLoadingIndicator(`Extracting text... ${progress}%`);
          } else if (m.status === 'loading tesseract core') {
            this.updateLoadingIndicator('Loading OCR engine...');
          } else if (m.status === 'initializing tesseract') {
            this.updateLoadingIndicator('Initializing...');
          } else if (m.status === 'loading language traineddata') {
            this.updateLoadingIndicator('Loading language data...');
          } else if (m.status === 'initializing api') {
            this.updateLoadingIndicator('Starting OCR...');
          }
        },
        errorHandler: (err) => {
          console.error('Tesseract error:', err);
        }
      });
      
      this.updateLoadingIndicator('Loading English language...');
      await worker.loadLanguage('eng');
      
      this.updateLoadingIndicator('Initializing language...');
      await worker.initialize('eng');
      
      this.updateLoadingIndicator('Processing image...');
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(imageData);
      
      // Clean up worker
      await worker.terminate();
      
      this.hideLoadingIndicator();
      
      // Step 5: Show result popup
      this.showResultPopup(text.trim() || 'No text found in selected area');
      
    } catch (error) {
      console.error('OCR processing error:', error);
      this.hideLoadingIndicator();
      this.showError('OCR failed: ' + (error.message || 'Unknown error. Please try again.'));
      this.deactivateCaptureMode();
    }
  }

  showResultPopup(text) {
    // Remove overlay and selection box
    this.deactivateCaptureMode();
    
    // Create result popup near the selection area
    this.resultPopup = document.createElement('div');
    this.resultPopup.id = 'text-extractor-result';
    this.resultPopup.style.cssText = `
      position: fixed;
      left: ${Math.min(this.popupX, window.innerWidth - 420)}px;
      top: ${Math.min(this.popupY + 20, window.innerHeight - 300)}px;
      width: 400px;
      max-height: 300px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 1000002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    `;
    
    this.resultPopup.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
      ">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #333;">
          Extracted Text
        </h3>
        <button id="close-result" style="
          background: none;
          border: none;
          font-size: 20px;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        ">&times;</button>
      </div>
      <div style="padding: 20px;">
        <textarea id="extracted-text" style="
          width: 100%;
          height: 120px;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          margin-bottom: 16px;
          box-sizing: border-box;
        " placeholder="No text found...">${text}</textarea>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="copy-text" style="
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          ">Copy Text</button>
          <button id="close-popup" style="
            background: #f5f5f5;
            color: #666;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          ">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.resultPopup);
    
    // Add event listeners
    const closeBtn = this.resultPopup.querySelector('#close-result');
    const copyBtn = this.resultPopup.querySelector('#copy-text');
    const closePopupBtn = this.resultPopup.querySelector('#close-popup');
    const textarea = this.resultPopup.querySelector('#extracted-text');
    
    closeBtn.addEventListener('click', () => this.closeResultPopup());
    closePopupBtn.addEventListener('click', () => this.closeResultPopup());
    
    copyBtn.addEventListener('click', () => {
      const textToCopy = textarea.value;
      if (textToCopy.trim()) {
        // Copy directly using navigator.clipboard in content script context
        this.copyToClipboard(textToCopy, copyBtn);
      }
    });
    
    // Focus the textarea
    textarea.focus();
    textarea.select();
  }

  showCopyConfirmation(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied ✓';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    }, 2000);
  }

  async copyToClipboard(text, button) {
    try {
      // Method 1: Try modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showCopyConfirmation(button);
        return;
      }
      
      // Method 2: Fallback to execCommand
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        this.showCopyConfirmation(button);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showError('Failed to copy text. Please select and copy manually.');
    }
  }

  closeResultPopup() {
    if (this.resultPopup) {
      this.resultPopup.remove();
      this.resultPopup = null;
    }
  }

  showLoadingIndicator() {
    const loading = document.createElement('div');
    loading.id = 'text-extractor-loading';
    loading.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 30px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000001;
      text-align: center;
    `;
    
    loading.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      "></div>
      <div id="loading-text">Processing selected area...</div>
    `;
    
    document.body.appendChild(loading);
  }

  updateLoadingIndicator(message) {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
      loadingText.textContent = message;
    }
  }

  hideLoadingIndicator() {
    const loading = document.getElementById('text-extractor-loading');
    if (loading) {
      loading.remove();
    }
  }

  showError(message) {
    const error = document.createElement('div');
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000003;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    error.textContent = message;
    
    document.body.appendChild(error);
    
    setTimeout(() => {
      if (error.parentNode) {
        error.parentNode.removeChild(error);
      }
    }, 5000);
  }

  deactivateCaptureMode() {
    this.isActive = false;
    this.isSelecting = false;
    
    // Remove event listeners
    this.removeEventListeners();
    
    // Remove DOM elements
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    if (this.overlayTop) {
      this.overlayTop.remove();
      this.overlayTop = null;
    }
    
    if (this.overlayRight) {
      this.overlayRight.remove();
      this.overlayRight = null;
    }
    
    if (this.overlayBottom) {
      this.overlayBottom.remove();
      this.overlayBottom = null;
    }
    
    if (this.overlayLeft) {
      this.overlayLeft.remove();
      this.overlayLeft = null;
    }
    
    if (this.selectionBox) {
      this.selectionBox.remove();
      this.selectionBox = null;
    }
    
    if (this.dimensionsDisplay) {
      this.dimensionsDisplay.remove();
      this.dimensionsDisplay = null;
    }
    
    // Remove instruction if present
    const instruction = document.getElementById('text-extractor-instruction');
    if (instruction) {
      instruction.remove();
    }
    
    // Remove loading indicator if present
    this.hideLoadingIndicator();
    
    // Restore cursor
    document.body.style.cursor = '';
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'captureModeDeactivated' });
  }
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ScreenCaptureExtractor();
  });
} else {
  new ScreenCaptureExtractor();
}