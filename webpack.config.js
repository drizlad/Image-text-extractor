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
        { from: 'node_modules/tesseract.js/dist/worker.min.js.map', to: 'worker.min.js.map' }
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