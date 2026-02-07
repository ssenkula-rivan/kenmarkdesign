const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Developer: CRANICTECH
// Website: Kenmark Design
// Year: 2026

// Increase payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Developed by: CRANICTECH`);
  console.log(`Project: Kenmark Design - Professional Printing & Publishing Services`);
});
