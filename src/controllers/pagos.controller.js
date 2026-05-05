const pagosService = require('../services/pagos.service');
const fs = require('fs');                    // ← FALTABA ESTO
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  // ← FALTABA ESTO

class PagosController {

  async crearIntent(req, res) {
    try {
      const { microjuego_id } = req.body;
      const result = await pagosService.crearPaymentIntent(microjuego_id, req.userId);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }

  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      await pagosService.handleWebhook(event);
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  async descargarFull(req, res) {
    try {
      const { fullPath, fileName } = await pagosService.descargarFull(req.query.token);
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
      console.error(err);
      res.status(403).json({ error: err.message });
    }
  }

  async descargarDemo(req, res) {
    try {
      const { fullPath, fileName } = await pagosService.descargarDemo(req.params.id);
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
      console.error(err);                    // ← esto te ayudará a ver el error real
      res.status(404).json({ error: err.message });
    }
  }
}

module.exports = new PagosController();