# Image Text Extractor

A Chrome extension that extracts text from any area of your screen using OCR technology. Select any region and instantly copy the text to your clipboard.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Screen Area Selection** - Click and drag to select any area on the screen
- **OCR Text Extraction** - Powered by Tesseract.js for accurate text recognition
- **One-Click Copy** - Extracted text is ready to copy to clipboard
- **Works Offline** - All processing happens locally in your browser
- **Privacy First** - No data sent to external servers

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/image-text-extractor.git
   cd image-text-extractor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

1. Click the extension icon in your toolbar
2. Your cursor changes to a crosshair
3. Click and drag to select the area containing text
4. Release to capture and process the selection
5. View extracted text in the popup
6. Click "Copy" to copy text to clipboard

Press `Escape` at any time to cancel the selection.

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build with watch mode (for development)
npm run dev
```

## Project Structure

```
├── src/
│   ├── background.js    # Service worker
│   ├── content.js       # Content script with OCR logic
│   ├── styles.css       # Selection overlay styles
│   ├── manifest.json    # Extension manifest
│   └── icons/           # Extension icons
├── dist/                # Built extension (generated)
├── webpack.config.js    # Build configuration
└── package.json
```

## Tech Stack

- **Tesseract.js** - OCR engine
- **Webpack** - Module bundler
- **Chrome Extension Manifest V3**

## Privacy

This extension:
- Does NOT collect any user data
- Does NOT send data to external servers
- Processes all images locally in your browser
- Requires minimal permissions

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
