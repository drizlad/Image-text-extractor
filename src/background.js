// Background script for Image Text Extractor Chrome Extension
// Handles toolbar icon clicks and coordinates screen capture

// Extension installation and startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Image Text Extractor installed:', details.reason);
});

// Handle toolbar icon clicks - this is the ONLY way to activate capture mode
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if we can access this tab
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
      // Show error for restricted pages
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Cannot Capture This Page',
        message: 'Text extraction is not allowed on browser internal pages. Please try on a regular webpage.',
        priority: 2
      });
      return;
    }

    // Try to send message to content script
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'activateCaptureMode'
      });
    } catch (error) {
      // Content script not loaded, inject it
      console.log('Content script not found, injecting...');
      
      try {
        // Inject CSS first
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['styles.css']
        });
        
        // Then inject JavaScript
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Wait a bit for script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try activating again
        await chrome.tabs.sendMessage(tab.id, {
          action: 'activateCaptureMode'
        });
      } catch (injectionError) {
        console.error('Failed to inject content script:', injectionError);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Extension Error',
          message: 'Failed to activate on this page. Please refresh and try again.',
          priority: 2
        });
      }
    }
  } catch (error) {
    console.error('Failed to activate capture mode:', error);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'captureVisibleTab':
      handleCaptureVisibleTab(request, sender, sendResponse);
      break;
      
    case 'copyToClipboard':
      handleClipboardCopy(request, sendResponse);
      break;
    
    case 'captureModeActivated':
      console.log('Capture mode activated in tab:', sender.tab?.id);
      sendResponse({ success: true });
      break;
    
    case 'captureModeDeactivated':
      console.log('Capture mode deactivated in tab:', sender.tab?.id);
      sendResponse({ success: true });
      break;
    
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

// Capture visible tab and return full screenshot
async function handleCaptureVisibleTab(request, sender, sendResponse) {
  try {
    // Capture the entire visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    });
    
    // Send the full screenshot back to content script for cropping
    sendResponse({ success: true, imageData: dataUrl, selection: request.selection });
  } catch (error) {
    console.error('Failed to capture tab:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Copy text to clipboard using offscreen document approach
async function handleClipboardCopy(request, sendResponse) {
  try {
    if (!request.text) {
      throw new Error('No text provided');
    }
    
    // For Manifest V3, we need to use a different approach
    // Send back to content script to handle clipboard
    sendResponse({ success: true, useContentScript: true });
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    sendResponse({ success: false, error: error.message });
  }
}