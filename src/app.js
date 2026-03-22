require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const prisma = require('./lib/prisma');

const app = express();


app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.0.23:5173',     
    'http://localhost:3000',        
    '*'                             
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());


app.use('/api/auth',       require('./routes/auth'));
app.use('/api/leyendas',   require('./routes/leyendas'));
app.use('/api/comentarios', require('./routes/comentarios'));
app.use('/api/pagos',      require('./routes/pagos'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});