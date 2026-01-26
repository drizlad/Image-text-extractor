// Popup script for Image Text Extractor Chrome Extension

class PopupController {
  constructor() {
    this.extractionMode = false;
    this.stats = { today: 0, total: 0 };
    
    this.init();
  }

  async init() {
    // Load current state and stats
    await this.loadState();
    await this.loadStats();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI
    this.updateUI();
  }

  async loadState() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['extractionMode'], (result) => {
        this.extractionMode = result.extractionMode || false;
        resolve();
      });
    });
  }

  async loadStats() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['stats'], (result) => {
        this.stats = result.stats || { today: 0, total: 0 };
        resolve();
      });
    });
  }

  setupEventListeners() {
    // Toggle button
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.addEventListener('click', () => {
      this.toggleExtractionMode();
    });

    // Language selector
    const languageSelect = document.getElementById('language');
    languageSelect.addEventListener('change', (e) => {
      this.updateLanguage(e.target.value);
    });

    // Help and feedback links
    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showHelp();
    });

    document.getElementById('feedbackLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showFeedback();
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'modeChanged':
        this.extractionMode = request.extractionMode;
        this.updateUI();
        sendResponse({ success: true });
        break;
      
      case 'textExtracted':
        this.incrementStats();
        sendResponse({ success: true });
        break;
      
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  async toggleExtractionMode() {
    try {
      // Send message to background script
      const response = await this.sendMessage({
        action: 'toggleExtractionMode'
      });

      if (response.success) {
        this.extractionMode = response.extractionMode;
        this.updateUI();
        
        // Close popup after activation (Chrome extension behavior)
        if (this.extractionMode) {
          setTimeout(() => {
            window.close();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to toggle extraction mode:', error);
      this.showError('Failed to toggle extraction mode');
    }
  }

  updateUI() {
    const toggleButton = document.getElementById('toggleButton');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const buttonIcon = toggleButton.querySelector('.button-icon');
    const buttonText = toggleButton.querySelector('.button-text');

    if (this.extractionMode) {
      // Active state
      toggleButton.classList.add('active');
      statusIndicator.classList.add('active');
      statusText.textContent = 'Extraction Mode Active';
      buttonIcon.textContent = '⏹️';
      buttonText.textContent = 'Stop Extraction';
      
      // Update instructions
      document.getElementById('instructions').innerHTML = 
        '<p><strong>Extraction mode is active!</strong> Click on any image on the webpage to extract its text.</p>';
    } else {
      // Inactive state
      toggleButton.classList.remove('active');
      statusIndicator.classList.remove('active');
      statusText.textContent = 'Ready';
      buttonIcon.textContent = '▶️';
      buttonText.textContent = 'Start Extraction';
      
      // Update instructions
      document.getElementById('instructions').innerHTML = 
        '<p>Click the button below to activate text extraction mode, then click on any image on the webpage to extract its text.</p>';
    }

    // Update stats
    document.getElementById('todayCount').textContent = this.stats.today;
    document.getElementById('totalCount').textContent = this.stats.total;
  }

  async updateLanguage(language) {
    try {
      await this.setStorage({ ocrLanguage: language });
      console.log('Language updated to:', language);
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  }

  async incrementStats() {
    this.stats.today += 1;
    this.stats.total += 1;
    
    try {
      await this.setStorage({ stats: this.stats });
      this.updateUI();
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  showHelp() {
    const helpContent = `
      <div style="padding: 20px; max-width: 400px;">
        <h2>How to Use Image Text Extractor</h2>
        <ol style="margin: 16px 0; padding-left: 20px;">
          <li>Click "Start Extraction" to activate extraction mode</li>
          <li>Navigate to any webpage with images</li>
          <li>Click on any image to extract its text</li>
          <li>Review and edit the extracted text in the popup</li>
          <li>Click "Copy to Clipboard" to copy the text</li>
        </ol>
        
        <h3>Tips for Better Results:</h3>
        <ul style="margin: 16px 0; padding-left: 20px;">
          <li>Works best with clear, high-contrast text</li>
          <li>Larger images generally produce better results</li>
          <li>English text is currently supported</li>
        </ul>
        
        <h3>Troubleshooting:</h3>
        <ul style="margin: 16px 0; padding-left: 20px;">
          <li>If extraction fails, try refreshing the page</li>
          <li>Some websites may block the extension</li>
          <li>Very small or blurry text may not be recognized</li>
        </ul>
      </div>
    `;
    
    this.showModal('Help', helpContent);
  }

  showFeedback() {
    const feedbackContent = `
      <div style="padding: 20px; max-width: 400px;">
        <h2>Feedback & Support</h2>
        <p style="margin: 16px 0;">We'd love to hear from you! Your feedback helps us improve the extension.</p>
        
        <h3>Report Issues:</h3>
        <ul style="margin: 16px 0; padding-left: 20px;">
          <li>OCR accuracy problems</li>
          <li>Website compatibility issues</li>
          <li>Feature requests</li>
        </ul>
        
        <h3>Contact:</h3>
        <p style="margin: 16px 0;">
          Email: support@imageextractor.com<br>
          GitHub: github.com/yourrepo/image-text-extractor
        </p>
        
        <p style="margin: 16px 0; font-size: 12px; color: #666;">
          Version 1.0.0 - Thank you for using Image Text Extractor!
        </p>
      </div>
    `;
    
    this.showModal('Feedback', feedbackContent);
  }

  showModal(title, content) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        ">
          <h2 style="margin: 0; font-size: 18px;">${title}</h2>
          <button style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
          ">&times;</button>
        </div>
        <div>${content}</div>
      </div>
    `;
    
    // Add close functionality
    const closeBtn = modal.querySelector('button');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    document.body.appendChild(modal);
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: #f44336;
      color: white;
      padding: 12px;
      border-radius: 4px;
      z-index: 1001;
      font-size: 13px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 5000);
  }

  // Utility methods
  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  setStorage(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, resolve);
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});