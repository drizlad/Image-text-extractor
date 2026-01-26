# Testing Guide for Image Text Extractor

## ✅ Fixed Issues

1. **CSP Violations** - Tesseract.js is now properly bundled
2. **Worker Errors** - Simplified Tesseract initialization
3. **Connection Errors** - Added automatic content script injection
4. **Chrome:// URL Errors** - Added proper error handling for restricted pages
5. **SetImageFile Errors** - Fixed Tesseract worker configuration

## 🚀 How to Install and Test

### Step 1: Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension should load without errors

### Step 2: Test on the Provided Test Page

1. Open the `test-page.html` file in Chrome (double-click it or drag to browser)
2. Click the extension icon in the toolbar
3. The page should dim with a crosshair cursor
4. Click and drag to select any text section
5. Wait for OCR processing (first time may take 10-15 seconds)
6. Review extracted text in the popup
7. Click "Copy Text" to test clipboard functionality

### Step 3: Test on Real Websites

Try these websites for testing:
- **Wikipedia**: https://en.wikipedia.org/wiki/Main_Page
- **News sites**: https://news.ycombinator.com
- **Any blog or article page**

### Step 4: Test Edge Cases

1. **Very small selection** - Should show "Selection too small" error
2. **ESC key** - Should cancel capture mode
3. **Multiple activations** - Click icon multiple times
4. **Different text sizes** - Select large and small text

## ⚠️ Known Limitations

### Pages Where Extension Won't Work:
- `chrome://` pages (browser internal pages)
- `chrome-extension://` pages (other extensions)
- Chrome Web Store pages
- Some heavily secured sites

**Expected Behavior**: You'll see a notification saying "Cannot Capture This Page"

### First-Time Use:
- **Slower processing** (10-15 seconds) - Downloads language data
- **Subsequent uses** - Much faster (2-5 seconds)
- **Works offline** - After first successful use

## 🐛 Troubleshooting

### Extension Not Loading
- **Check**: All files in `dist` folder
- **Fix**: Run `npm run build` again
- **Verify**: manifest.json exists in dist folder

### "Failed to activate capture mode"
- **Cause**: Content script not loaded
- **Fix**: Refresh the page and try again
- **Note**: Extension auto-injects script now

### "OCR processing failed"
- **First time**: Wait longer (downloading language data)
- **Subsequent**: Check browser console for errors
- **Fix**: Reload extension and try again

### Selection Not Showing
- **Check**: Cursor changed to crosshair?
- **Fix**: Click extension icon again
- **Note**: Press ESC to cancel and restart

### Text Not Copying
- **Check**: Browser clipboard permissions
- **Fix**: Click "Copy Text" button again
- **Test**: Try pasting in a text editor

## 📊 Testing Checklist

- [ ] Extension loads without errors
- [ ] Clicking icon activates capture mode
- [ ] Page dims with crosshair cursor
- [ ] Can drag to select area
- [ ] Selection box appears and resizes
- [ ] ESC key cancels capture
- [ ] Loading indicator shows during OCR
- [ ] Popup appears with extracted text
- [ ] Text is editable in textarea
- [ ] "Copy Text" button works
- [ ] "Copied ✓" confirmation shows
- [ ] Can close popup and try again
- [ ] Works on different websites
- [ ] Error handling for restricted pages

## 🎯 Expected Performance

### First Use (Per Session):
- **Activation**: Instant
- **Selection**: Instant
- **OCR Processing**: 10-15 seconds
- **Result Display**: Instant

### Subsequent Uses:
- **Activation**: Instant
- **Selection**: Instant
- **OCR Processing**: 2-5 seconds
- **Result Display**: Instant

## 💡 Tips for Best Results

1. **Select clear text** - Higher contrast = better accuracy
2. **Larger selections** - More context helps OCR
3. **Avoid tiny text** - May not be recognized accurately
4. **Wait for loading** - Don't interrupt OCR process
5. **First use patience** - Language data download takes time

## 🔧 Developer Console

To see detailed logs:
1. Right-click on page → "Inspect"
2. Go to "Console" tab
3. Look for Tesseract logs during OCR
4. Check for any error messages

## ✨ Success Indicators

You'll know it's working when:
- ✅ Page dims immediately after clicking icon
- ✅ Crosshair cursor appears
- ✅ Green selection box follows your drag
- ✅ Loading indicator shows progress
- ✅ Popup appears with actual text from selection
- ✅ "Copied ✓" appears after clicking copy button
- ✅ Text pastes correctly in other applications

---

**If you encounter any issues not covered here, check the browser console for error messages and report them.**