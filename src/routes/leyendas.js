const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
  try {
    const leyendas = await prisma.leyendas.findMany();
    res.json(leyendas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener leyendas' });
  }
});

module.exports = router;