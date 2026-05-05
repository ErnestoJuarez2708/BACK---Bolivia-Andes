const pagosService = require('../services/pagos.service');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../lib/prisma');

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
      console.error(err);                    
      res.status(404).json({ error: err.message });
    }
  }

  async testCompletarCompra(req, res) {
    try {
      const { microjuego_id } = req.body;
      if (!microjuego_id) {
        return res.status(400).json({ error: 'microjuego_id es requerido' });
      }

      console.log(`[testCompletarCompra] userId: ${req.userId}, microjuego_id: ${microjuego_id}`);

      const fakeEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_test_${Date.now()}`,
            metadata: {
              userId: req.userId.toString(),
              microjuegoId: microjuego_id.toString()
            },
            amount: 200
          }
        }
      };

      console.log(`[testCompletarCompra] Llamando handleWebhook con evento:`, fakeEvent);
      await pagosService.handleWebhook(fakeEvent);
      console.log(`[testCompletarCompra] handleWebhook completado`);

      const compra = await prisma.compras.findFirst({
        where: {
          minijuego_id: Number(microjuego_id),
          usuario_id: req.userId,
          estado: 'completado'
        },
        orderBy: { created_at: 'desc' }
      });

      if (!compra) {
        throw new Error('No se encontró la compra creada en la BD');
      }

      console.log(`[testCompletarCompra] Compra encontrada:`, compra);

      res.json({
        message: '✅ Compra simulada correctamente (webhook)',
        download_token: compra.download_token,
        expires_at: compra.expires_at,
        microjuego_id: compra.minijuego_id
      });
    } catch (err) {
      console.error('[testCompletarCompra] Error:', err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new PagosController();