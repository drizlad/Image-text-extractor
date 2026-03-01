const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    content: './src/content.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/styles.css', to: 'styles.css' },
        { from: 'src/icons', to: 'icons' },
        // Copy Tesseract.js worker files
        { from: 'node_modules/tesseract.js/dist/worker.min.js', to: 'worker.min.js' },
        { from: 'node_modules/tesseract.js/dist/worker.min.js.map', to: 'worker.min.js.map' },
        // Copy Tesseract.js core WASM files
        { from: 'node_modules/tesseract.js-core/tesseract-core.wasm.js', to: 'tesseract-core.wasm.js' },
        { from: 'node_modules/tesseract.js-core/tesseract-core-simd.wasm.js', to: 'tesseract-core-simd.wasm.js' }
      ]
    })
  ],
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false
    }
  }
};