const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwt-auth');
const pagosController = require('../controllers/pagos.controller');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/crear-intent', authMiddleware, pagosController.crearIntent);

router.post(
  '/webhook-stripe',
  express.raw({ type: 'application/json' }),
  pagosController.webhook
);

router.get('/descargar-full', pagosController.descargarFull);
router.get('/descargar-demo/:id', pagosController.descargarDemo);

module.exports = router;