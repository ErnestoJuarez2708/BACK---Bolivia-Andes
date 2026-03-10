const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { email, password, nombre } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.usuarios.create({ data: { email, password_hash: hashed, nombre } });
    res.json({ message: 'Usuario creado' });
  } catch (err) { res.status(500).json({ error: 'Error al registrar' }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.usuarios.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;