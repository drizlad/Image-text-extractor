// OCR Web Worker for Image Text Extractor Chrome Extension
// This worker handles Tesseract.js processing to avoid blocking the main thread

importScripts('https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js');

let isInitialized = false;

// Initialize Tesseract when worker starts
async function initializeTesseract() {
  if (isInitialized) return;
  
  try {
    // Tesseract is already available via importScripts
    isInitialized = true;
    console.log('Tesseract OCR worker initialized');
  } catch (error) {
    console.error('Failed to initialize Tesseract:', error);
    throw error;
  }
}

// Handle messages from main thread
self.onmessage = async function(event) {
  const { action, imageData } = event.data;
  
  switch (action) {
    case 'extractText':
      await extractTextFromImage(imageData);
      break;
    
    default:
      self.postMessage({
        action: 'error',
        error: 'Unknown action: ' + action
      });
  }
};

// Extract text from image using Tesseract.js
async function extractTextFromImage(imageData) {
  try {
    // Initialize if not already done
    if (!isInitialized) {
      await initializeTesseract();
    }
    
    // Show progress updates
    self.postMessage({
      action: 'progress',
      message: 'Initializing OCR...'
    });
    
    // Create Tesseract worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        // Send progress updates to main thread
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100);
          self.postMessage({
            action: 'progress',
            message: `Processing... ${progress}%`
          });
        }
      }
    });
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(imageData);
    
    // Clean up worker
    await worker.terminate();
    
    // Send result back to main thread
    self.postMessage({
      action: 'textExtracted',
      text: text.trim()
    });
    
  } catch (error) {
    console.error('OCR processing error:', error);
    self.postMessage({
      action: 'textExtracted',
      text: '',
      error: 'Failed to extract text: ' + error.message
    });
  }
}

// Handle worker errors
self.onerror = function(error) {
  console.error('OCR Worker error:', error);
  self.postMessage({
    action: 'textExtracted',
    text: '',
    error: 'Worker error: ' + error.message
  });
};