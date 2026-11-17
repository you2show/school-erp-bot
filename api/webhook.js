const { bot } = require('../src/bot');

module.exports = async (req, res) => {
  // If GET request, allow status check or webhook registration
  if (req.method === 'GET') {
    const q = req.query || {};
    const action = q.action || (q.set === '1' ? 'set' : (q.delete === '1' ? 'delete' : 'status'));
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const webhookUrl = `${protocol}://${host}/api/webhook`;

    if (action === 'set') {
      try {
        await bot.telegram.setWebhook(webhookUrl);
        return res.status(200).send(`
          <html>
            <head><meta charset="utf-8"><title>Webhook Connected</title></head>
            <body style="font-family:sans-serif;text-align:center;padding:50px;">
              <h2 style="color:green;">✅ Webhook Connected Successfully!</h2>
              <p>Telegram is now sending updates to: <code>${webhookUrl}</code></p>
              <p>Bot @SchoolERPSystemBot is now running 24/7 on Vercel Serverless.</p>
            </body>
          </html>
        `);
      } catch (err) {
        return res.status(500).send(`❌ Failed to set webhook: ${err.message}`);
      }
    }

    if (action === 'delete') {
      try {
        await bot.telegram.deleteWebhook();
        return res.status(200).send(`
          <html>
            <head><meta charset="utf-8"><title>Webhook Deleted</title></head>
            <body style="font-family:sans-serif;text-align:center;padding:50px;">
              <h2 style="color:#d97706;">⚠️ Webhook Disconnected!</h2>
              <p>Bot is now ready for Local PC Polling mode.</p>
            </body>
          </html>
        `);
      } catch (err) {
        return res.status(500).send(`❌ Failed to delete webhook: ${err.message}`);
      }
    }

    // Default status response
    let webhookInfo = {};
    try {
      webhookInfo = await bot.telegram.getWebhookInfo();
    } catch (e) {}

    return res.status(200).json({
      service: 'School ERP Telegram Bot (@SchoolERPSystemBot)',
      status: 'online',
      platform: 'Vercel Serverless Webhook',
      webhook: webhookInfo,
      actions: {
        connectWebhook: `${protocol}://${host}/api/webhook?action=set`,
        disconnectWebhook: `${protocol}://${host}/api/webhook?action=delete`
      }
    });
  }

  // Handle incoming Telegram webhook updates (POST)
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body, res);
      if (!res.headersSent) {
        res.status(200).json({ ok: true });
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
    return;
  }

  res.status(405).send('Method Not Allowed');
};
