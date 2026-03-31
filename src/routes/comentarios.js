const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/jwt-auth');

console.log('✅ Router comentarios cargado correctamente');

router.get('/:leyenda_id', async (req, res) => {
  console.log(`→ Solicitud GET /api/comentarios/${req.params.leyenda_id}`);

  try {
    const { leyenda_id } = req.params;
    const id = parseInt(leyenda_id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de leyenda inválido' });
    }

    const leyendaExiste = await prisma.leyendas.findUnique({
      where: { id: id },
      select: { id: true, titulo: true }
    });

    if (!leyendaExiste) {
      return res.status(404).json({ 
        error: 'Leyenda no encontrada',
        leyenda_id: id 
      });
    }

    const comentarios = await prisma.comentarios.findMany({
      where: { leyenda_id: id },
      include: {
        usuario: {
          select: { nombre: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`→ Comentarios encontrados: ${comentarios.length} para leyenda ${id}`);
    
    res.json({
      leyenda: leyendaExiste,
      comentarios: comentarios,
      total: comentarios.length
    });

  } catch (err) {
    console.error('Error al obtener comentarios:', err);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { leyenda_id, texto, rating } = req.body;

    if (!leyenda_id || !texto || rating === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'El rating debe ser un entero entre 1 y 5' });
    }

    const leyendaExiste = await prisma.leyendas.findUnique({
      where: { id: Number(leyenda_id) }
    });

    if (!leyendaExiste) {
      return res.status(404).json({ error: 'La leyenda no existe' });
    }

    const comentario = await prisma.comentarios.create({
      data: {
        usuario_id: req.userId,
        leyenda_id: Number(leyenda_id),
        texto: texto.trim(),
        rating: Number(rating),
      },
      include: {
        usuario: { select: { nombre: true } }
      }
    });

    res.status(201).json(comentario);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error interno al crear el comentario' });
  }
});

module.exports = router;