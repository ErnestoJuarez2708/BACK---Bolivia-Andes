const express = require('express');
const { PrismaClient } = require('../generated/prisma/client.ts');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const path = require('path');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/leyendas', require('./routes/leyendas'));
app.use('/api/comentarios', require('./routes/comentarios'));
app.use('/api/pagos', require('./routes/pagos'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));

dotenv.config();

console.log("STRIPE_SECRET_KEY valor:", process.env.STRIPE_SECRET_KEY ? "existe (longitud:" + process.env.STRIPE_SECRET_KEY.length + ")" : "NO EXISTE O ESTÁ VACÍA");
console.log("Todas las env vars:", Object.keys(process.env).filter(k => k.includes("STRIPE")));