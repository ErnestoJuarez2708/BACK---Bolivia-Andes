const prisma = require('../lib/prisma');

class ComentariosService {
  async getByLeyenda(leyenda_id) {
    const id = parseInt(leyenda_id);
    if (isNaN(id)) throw new Error('ID de leyenda inválido');

    const leyendaExiste = await prisma.leyendas.findUnique({
      where: { id },
      select: { id: true, titulo: true }
    });

    if (!leyendaExiste) throw new Error('Leyenda no encontrada');

    const comentarios = await prisma.comentarios.findMany({
      where: { leyenda_id: id },
      include: {
        usuario: { select: { nombre: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return { leyenda: leyendaExiste, comentarios, total: comentarios.length };
  }

  async create({ leyenda_id, texto, rating, userId }) {
    if (!leyenda_id || !texto || rating === undefined) {
      throw new Error('Faltan campos requeridos');
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('El rating debe ser un entero entre 1 y 5');
    }

    const leyendaExiste = await prisma.leyendas.findUnique({ where: { id: Number(leyenda_id) } });
    if (!leyendaExiste) throw new Error('La leyenda no existe');

    return await prisma.comentarios.create({
      data: {
        usuario_id: userId,
        leyenda_id: Number(leyenda_id),
        texto: texto.trim(),
        rating: Number(rating),
      },
      include: { usuario: { select: { nombre: true } } }
    });
  }
}

module.exports = new ComentariosService();