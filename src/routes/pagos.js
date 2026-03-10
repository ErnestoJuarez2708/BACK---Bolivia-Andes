const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


router.post('/crear-intent', auth, async (req, res) => {
  const { microjuego_id } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 200,
    currency: 'usd',
    metadata: { userId: req.userId, microjuegoId: microjuego_id }
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});


router.post('/webhook-stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, microjuegoId } = paymentIntent.metadata;
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600000);
    await prisma.compras.updateMany({
      where: { stripe_payment_id: paymentIntent.id },
      data: { estado: 'completado', download_token: token, expires_at: expires }
    });
  }
  res.json({ received: true });
});


router.get('/descargar-full', async (req, res) => {
  const { token } = req.query;
  const compra = await prisma.compras.findFirst({ where: { download_token: token } });
  if (!compra || new Date() > compra.expires_at) {
    return res.status(403).json({ error: 'Link inválido o expirado' });
  }
  const filePath = path.join(__dirname, '..', 'apks', 'full-titicaca.apk');
  res.download(filePath);
});


router.get('/descargar-demo/:id', async (req, res) => {
  await prisma.microjuegos.update({ where: { id: parseInt(req.params.id) }, data: { descargas_demo: { increment: 1 } } });
  const filePath = path.join(__dirname, '..', 'apks', 'demo-titicaca.apk');
  res.download(filePath);
});

module.exports = router;