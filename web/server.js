const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

const app = express();

// Path ke folder dist
const publicPath = path.join(__dirname, 'dist');
const port = 3003;

// Gunakan serve-static untuk menyajikan file dari dist
app.use(serveStatic(publicPath));

// Fallback untuk Vue Router History Mode (sangat penting)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
