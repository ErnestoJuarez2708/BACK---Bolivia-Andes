const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/jwt-auth');

router.get('/', async (req, res) => {
  try {
    const leyendas = await prisma.leyendas.findMany();
    res.json(leyendas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener leyendas' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, descripcion, autor_referencia, imagen_url } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: 'Título y descripción son obligatorios' });
    }

    const nuevaLeyenda = await prisma.leyendas.create({
      data: {
        titulo,
        descripcion,
        autor_referencia: autor_referencia || null,
        imagen_url: imagen_url || null,
      },
    });

    res.status(201).json({
      message: 'Leyenda creada exitosamente',
      leyenda: nuevaLeyenda
    });
  } catch (error) {
    console.error('Error al crear leyenda:', error);
    res.status(500).json({ error: 'Error interno al crear la leyenda' });
  }
});

module.exports = router;