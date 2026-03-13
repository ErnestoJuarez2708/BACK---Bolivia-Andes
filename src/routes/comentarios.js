const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/jwt-auth');
const prisma = require('../lib/prisma');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { leyenda_id, texto, rating } = req.body;

    if (!leyenda_id || !texto || !rating) {
      return res.status(400).json({ error: 'Faltan campos requeridos: leyenda_id, texto, rating' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'El rating debe ser un entero entre 1 y 5' });
    }

    const comentario = await prisma.comentarios.create({
      data: {
        usuario_id: req.userId,
        leyenda_id: Number(leyenda_id),
        texto,
        rating: Number(rating),
      },
    });

    res.status(201).json(comentario);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error interno al crear el comentario' });
  }
});

module.exports = router;