require('dotenv').config();
const http = require('http');

// Lightweight health check server for Cloud deployment (Render, Koyeb, Fly.io, etc.)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('School ERP Telegram Bot (@SchoolERPSystemBot) is Online & Healthy.\n');
});

server.on('error', (err) => {
  console.log(`Note: Health check port notice (${err.message}), continuing bot execution.`);
});

server.listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

require('./src/bot');

