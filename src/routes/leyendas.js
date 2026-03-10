const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const leyendas = await prisma.leyendas.findMany();
  res.json(leyendas);
});

module.exports = router;