const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', auth, async (req, res) => {
  const { leyenda_id, texto, rating } = req.body;
  const comentario = await prisma.comentarios.create({ data: { usuario_id: req.userId, leyenda_id, texto, rating } });
  res.json(comentario);
});

module.exports = router;