const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwt-auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');

const STORAGE_BASE = path.join(process.cwd(), 'storage');
const APK_MIME = 'application/vnd.android.package-archive';


router.post('/crear-intent', authMiddleware, async (req, res) => {
  try {
    const { microjuego_id } = req.body;
    if (!microjuego_id) {
      return res.status(400).json({ error: 'microjuego_id requerido' });
    }

    const micro = await prisma.microjuegos.findUnique({
      where: { id: Number(microjuego_id) },
    });

    if (!micro) {
      return res.status(404).json({ error: 'Microjuego no encontrado' });
    }

    const amount = Math.round(micro.precio * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId: req.userId, microjuegoId: microjuego_id },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando PaymentIntent' });
  }
});

router.post(
  '/webhook-stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { userId, microjuegoId } = paymentIntent.metadata;

      const userIdNum = Number(userId);
      const microIdNum = Number(microjuegoId);

      let compra = await prisma.compras.findFirst({
        where: {
          usuario_id: userIdNum,
          microjuego_id: microIdNum,
          stripe_payment_id: paymentIntent.id,
        },
      });

      const token = uuidv4();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      if (compra) {
        await prisma.compras.update({
          where: { id: compra.id },
          data: {
            estado: 'completado',
            download_token: token,
            expires_at: expires,
          },
        });
      } else {
        await prisma.compras.create({
          data: {
            usuario_id: userIdNum,
            microjuego_id: microIdNum,
            monto: paymentIntent.amount / 100,
            stripe_payment_id: paymentIntent.id,
            estado: 'completado',
            download_token: token,
            expires_at: expires,
          },
        });
      }
    }

    res.json({ received: true });
  }
);


router.get('/descargar-full', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  try {
    const compra = await prisma.compras.findFirst({
      where: { download_token: token },
      include: { microjuego: true },
    });

    if (!compra) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    if (new Date() > compra.expires_at) {
      return res.status(403).json({ error: 'Link expirado' });
    }

    if (compra.estado !== 'completado') {
      return res.status(403).json({ error: 'Compra no completada' });
    }

    const relativePath = compra.microjuego.full_apk_path;

    if (!relativePath) {
      return res.status(404).json({ error: 'No hay APK full disponible' });
    }

    const fullPath = path.join(STORAGE_BASE, relativePath);


    if (!fullPath.startsWith(STORAGE_BASE)) {
      return res.status(403).json({ error: 'Acceso inválido' });
    }

    if (!fs.existsSync(fullPath)) {
      console.error('Archivo no encontrado:', fullPath);
      return res.status(404).json({ error: 'Archivo no encontrado en servidor' });
    }

    const fileName = path.basename(fullPath);

    res.setHeader('Content-Type', APK_MIME);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al servir el archivo' });
  }
});


router.get('/descargar-demo/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const micro = await prisma.microjuegos.findUnique({
      where: { id },
    });

    if (!micro || !micro.demo_apk_path) {
      return res.status(404).json({ error: 'Demo no disponible' });
    }

    await prisma.microjuegos.update({
      where: { id },
      data: { descargas_demo: { increment: 1 } },
    });

    const fullPath = path.join(STORAGE_BASE, micro.demo_apk_path);

    if (!fullPath.startsWith(STORAGE_BASE) || !fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const fileName = path.basename(fullPath);

    res.setHeader('Content-Type', APK_MIME);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al descargar demo' });
  }
});

module.exports = router;