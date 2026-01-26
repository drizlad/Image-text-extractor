# Image Text Extractor Chrome Extension

A Chrome browser extension that allows users to extract text from any screen area using drag-to-select functionality and OCR (Optical Character Recognition) technology.

## Features

- 🎯 **Area Selection** - Click and drag to select any rectangular area on screen
- 🔍 **OCR Processing** - Extract text from the selected area using advanced OCR
- 📋 **Clipboard Integration** - Copy extracted text directly to clipboard
- ⚡ **Fast Processing** - Client-side OCR with visual feedback
- 🔒 **Privacy-Focused** - All processing happens locally in your browser
- 🌐 **Universal Compatibility** - Works on all websites

## How It Works

### Step 1: Activation
- Click the extension icon in Chrome toolbar
- Page dims with crosshair cursor indicating capture mode is active

### Step 2: Area Selection
- Click and drag to define a rectangular selection area
- Live preview shows your selection with a green bounding box
- Press ESC to cancel selection at any time

### Step 3: Text Extraction
- Release mouse to capture the selected area
- OCR processes the captured image automatically
- Loading indicator shows processing progress

### Step 4: Review & Copy
- Popup appears near your selection with extracted text
- Edit the text if needed in the text area
- Click "Copy Text" to copy to clipboard
- Confirmation shows "Copied ✓" when successful

## Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/image-text-extractor.git
   cd image-text-extractor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

### From Chrome Web Store

*Coming soon - extension will be available on the Chrome Web Store*

## Usage Instructions

1. **Activate Capture Mode**
   - Click the extension icon in Chrome toolbar
   - Page will dim and cursor changes to crosshair

2. **Select Area**
   - Click and drag to select the area containing text
   - Green selection box shows your current selection
   - Press ESC to cancel if needed

3. **Extract Text**
   - Release mouse button to capture the selected area
   - Wait for OCR processing to complete

4. **Copy Text**
   - Review extracted text in the popup
   - Edit if necessary
   - Click "Copy Text" to copy to clipboard

## Technical Details

### Architecture

- **Manifest V3** Chrome extension
- **Area Selection** with drag-to-select interface
- **Screen Capture** of selected rectangular areas
- **Client-side OCR** using Tesseract.js
- **Web Workers** for non-blocking text processing

### File Structure

```
src/
├── manifest.json       # Extension manifest (no popup)
├── background.js       # Background service worker
├── content.js         # Area selection and capture logic
├── styles.css         # Overlay and UI styles
├── ocr-worker.js      # OCR processing worker
└── icons/             # Extension icons
```

### Permissions

- `activeTab` - Access current tab content for screen capture
- `clipboardWrite` - Copy extracted text to clipboard
- `storage` - Store user preferences
- `scripting` - Inject content scripts when needed

## Interaction Flow

```
Toolbar Click → Overlay Injection → Area Selection → Screen Capture → OCR Processing → Result Popup
```

### Key Behaviors

- **Single activation method**: Only toolbar icon click activates capture
- **Visual feedback**: Dimmed overlay with crosshair cursor
- **Drag selection**: Click and drag to define capture area
- **ESC cancellation**: Press ESC to exit capture mode
- **In-context results**: Popup appears near selection area
- **No auto-capture**: User must explicitly select an area

## Development

### Prerequisites

- Node.js 16+ and npm
- Chrome browser for testing

### Setup

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build

# Run tests
npm test
```

### Testing the Refactored Flow

1. **Load Extension**: Load `dist` folder in Chrome extensions
2. **Click Icon**: Click toolbar icon to activate capture mode
3. **Verify Overlay**: Page should dim with crosshair cursor
4. **Test Selection**: Click and drag to select an area
5. **Check Capture**: Verify only selected area is processed
6. **Test ESC**: Press ESC to cancel capture mode
7. **Verify Popup**: Result popup should appear near selection
8. **Test Copy**: Click "Copy Text" and verify clipboard

### Self-Validation Checklist

- ✅ Clicking extension icon visibly enters capture mode
- ✅ Cursor changes to crosshair
- ✅ User can drag selection box anywhere on page
- ✅ ESC key cancels capture
- ✅ Only selected region is captured
- ✅ OCR does not run without selection
- ✅ Popup appears near selection
- ✅ Text can be edited and copied

## Browser Compatibility

- **Chrome 88+** (Manifest V3 support required)
- **Chromium-based browsers** (Edge, Brave, etc.)

## Privacy & Security

- **No data collection** - All processing happens locally
- **No external API calls** - OCR runs entirely in your browser
- **Minimal permissions** - Only requests necessary access
- **No persistent storage** of captured content

## Troubleshooting

### Extension Not Loading
- Ensure you've built the extension (`npm run build`)
- Load the `dist` folder, not the root project folder
- Check browser console for errors

### Capture Mode Not Activating
- Refresh the page and try again
- Check if content script loaded properly
- Verify extension permissions are granted

### OCR Not Working
- Ensure selected area contains visible text
- Try with higher contrast text
- Check browser console for OCR worker errors

### Selection Issues
- Make sure to click and drag (not just click)
- Selection must be at least 10x10 pixels
- Try on different areas of the page

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the interaction model exactly as specified
4. Test thoroughly with the validation checklist
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Maintain the exact interaction flow: Toolbar Click → Overlay → Drag Selection → Capture → OCR → Popup
- Do not add popup-based interactions
- Ensure ESC always cancels capture mode
- Keep all processing client-side
- Test on multiple websites and content types

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR functionality
- Chrome Extensions team for the platform

---

**Refactored for proper screen capture workflow - no popup interactions, drag-to-select only**