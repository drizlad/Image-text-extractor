# Deployment Guide

## Chrome Web Store Submission

### Prerequisites
1. Chrome Web Store Developer account ($5 one-time fee)
2. Extension package (image-text-extractor-v1.0.0.zip)
3. Store assets (icons, screenshots, descriptions)
4. Privacy policy document

### Submission Steps

1. **Access Chrome Web Store Developer Dashboard**
   - Go to https://chrome.google.com/webstore/devconsole/
   - Sign in with your Google account

2. **Create New Item**
   - Click "Add new item"
   - Upload the extension zip file (image-text-extractor-v1.0.0.zip)

3. **Fill Store Listing**
   - **Product details**: Use content from store-assets/description.md
   - **Graphic assets**: Upload icons and screenshots
   - **Privacy practices**: Indicate no data collection
   - **Single purpose**: Text extraction from images

4. **Review and Submit**
   - Complete all required fields
   - Submit for review (typically takes 1-3 business days)

### Required Assets

#### Icons
- 128x128 px store icon (high quality PNG)
- 16x16, 48x48, 128x128 px extension icons

#### Screenshots
- 1280x800 px or 640x400 px
- Show extension in action
- Highlight key features

#### Promotional Images (Optional)
- 440x280 px promotional tile
- 920x680 px promotional image

### Post-Submission

1. **Monitor Review Status**
   - Check developer dashboard regularly
   - Respond to any reviewer feedback

2. **Handle Rejections**
   - Address any policy violations
   - Update and resubmit if necessary

3. **Launch**
   - Once approved, extension goes live
   - Monitor user feedback and ratings

### Maintenance

- Regular updates for bug fixes
- Monitor Chrome Web Store policies
- Respond to user reviews
- Update for new Chrome versions

## Local Testing

Before submission, test thoroughly:

1. **Load Extension Locally**
   ```bash
   # Build the extension
   npm run build
   
   # Load in Chrome
   # 1. Go to chrome://extensions/
   # 2. Enable Developer mode
   # 3. Click "Load unpacked"
   # 4. Select the 'dist' folder
   ```

2. **Test Scenarios**
   - Various websites and image types
   - Different text styles and languages
   - Error handling and edge cases
   - Performance with large images

3. **Verify Functionality**
   - Extension popup works correctly
   - OCR processing completes successfully
   - Clipboard integration functions
   - Visual feedback is appropriate

## Distribution Package Contents

The `image-text-extractor-v1.0.0.zip` contains:
- manifest.json (extension configuration)
- background.js (service worker)
- content.js (page interaction)
- popup.html/js/css (extension interface)
- ocr-worker.js (OCR processing)
- styles.css (content script styles)
- icons/ (extension icons)

All files are minified and optimized for production use.