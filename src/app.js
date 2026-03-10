require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

const prisma = require('./lib/prisma');

const app = express();
app.use(express.json());

// Rutas
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/leyendas',   require('./routes/leyendas'));
app.use('/api/comentarios', require('./routes/comentarios'));
app.use('/api/pagos',      require('./routes/pagos'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});

// Debug
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? `existe (${process.env.STRIPE_SECRET_KEY.length} caracteres)` : "NO EXISTE");
console.log("DATABASE_URL:     ", process.env.DATABASE_URL ? `existe (${process.env.DATABASE_URL.length} caracteres)` : "NO EXISTE");
console.log("JWT_SECRET:       ", process.env.JWT_SECRET ? "existe" : "NO EXISTE (necesario para login)");