require('dotenv').config();
const http = require('http');
const https = require('https');

// Prevent unexpected process exits from network hiccups or unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

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

// Active TCP Keep-Alive Watchdog to prevent network sleep & keep connection hot
const BOT_TOKEN = process.env.BOT_TOKEN || '9241388793:AAHvUswsGqRHaoW8LhZlND2TaOd_I8pBko0';
setInterval(() => {
  https.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`, (res) => {
    res.resume();
  }).on('error', (err) => {
    console.log(`⚠️ Heartbeat connection notice: ${err.message}`);
  });
}, 45000); // Ping every 45s to keep socket alive and active 24/7

require('./src/bot');
