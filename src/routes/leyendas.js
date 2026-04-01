const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const leyenda = await prisma.leyendas.findUnique({
      where: { id: id }
    });
    res.json(leyenda);
  } catch (err) {
    console.error('Error en /leyendas/:id:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/', async (req, res) => {
  try {
    const leyendas = await prisma.leyendas.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(leyendas);
  } catch (err) {
    console.error('Error al obtener todas las leyendas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;