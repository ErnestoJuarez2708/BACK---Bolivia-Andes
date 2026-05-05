const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');

const STORAGE_BASE = path.join(process.cwd(), 'storage');

class PagosService {

  async crearPaymentIntent(microjuego_id, userId) {
    if (!microjuego_id) throw new Error('microjuego_id es requerido');

    const minijuego = await prisma.Minijuegos.findUnique({
      where: { id: Number(microjuego_id) }
    });

    if (!minijuego) throw new Error('Minijuego no encontrado');
    if (!minijuego.activo) throw new Error('Este minijuego no está diisponible');

    const amount = Math.round(Number(minijuego.precio) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId, microjuegoId: microjuego_id }
    });

    return { clientSecret: paymentIntent.client_secret };
  }

    async handleWebhook(event) {
    if (event.type !== 'payment_intent.succeeded') return;

    const paymentIntent = event.data.object;
    const { userId, microjuegoId } = paymentIntent.metadata;

    if (!userId || !microjuegoId) {
      console.error('Faltan datos en metadata');
      return;
    }

    const userIdNum = Number(userId);
    const microIdNum = Number(microjuegoId);
    const token = uuidv4();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Buscamos si ya existe una compra con ese stripe_payment_id
    let compra = await prisma.Compras.findFirst({
      where: { stripe_payment_id: paymentIntent.id }
    });

    if (compra) {
      // Actualizamos la compra existente
      await prisma.Compras.update({
        where: { id: compra.id },
        data: {
          estado: 'completado',
          download_token: token,
          expires_at: expires,
        }
      });
    } else {
      // Creamos una nueva compra
      await prisma.Compras.create({
        data: {
          usuario_id: userIdNum,
          minijuego_id: microIdNum,
          monto: paymentIntent.amount / 100,
          stripe_payment_id: paymentIntent.id,
          estado: 'completado',
          download_token: token,
          expires_at: expires,
        }
      });
    }

    console.log(`✅ Compra completada para microjuego ${microIdNum} (token: ${token})`);
  }

  async descargarFull(token) {
    if (!token) throw new Error('Token requerido');

    const compra = await prisma.Compras.findFirst({
      where: { download_token: token },
      include: { minijuego: true }
    });

    if (!compra || new Date() > compra.expires_at || compra.estado !== 'completado') {
      throw new Error('Token inválido o expirado');
    }

    const relativePath = compra.minijuego.full_apk_path;
    if (!relativePath) throw new Error('No hay APK full disponible');

    const fullPath = path.join(STORAGE_BASE, relativePath);

    if (!fs.existsSync(fullPath)) throw new Error('Archivo APK no encontrado');

    return { fullPath, fileName: path.basename(fullPath) };
  }

  async descargarDemo(id) {
    const minijuego = await prisma.Minijuegos.findUnique({
      where: { id: parseInt(id) }
    });

    if (!minijuego || !minijuego.demo_apk_path) {
      throw new Error('Demo no disponible para este minijuego');
    }

    // Incrementar contador de descargas
    await prisma.Minijuegos.update({
      where: { id: parseInt(id) },
      data: { descargas_demo: { increment: 1 } }
    });

    const fullPath = path.join(STORAGE_BASE, minijuego.demo_apk_path);

    if (!fs.existsSync(fullPath)) {
      throw new Error('Archivo demo no encontrado en el servidor');
    }

    return { fullPath, fileName: path.basename(fullPath) };
  }
}

module.exports = new PagosService();