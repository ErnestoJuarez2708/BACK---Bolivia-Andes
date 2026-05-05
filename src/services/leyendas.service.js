const prisma = require('../lib/prisma');

class LeyendasService {
  async getById(id) {
    return await prisma.leyendas.findUnique({ where: { id: parseInt(id) } });
  }

  async getAll() {
    return await prisma.leyendas.findMany({
      orderBy: { created_at: 'desc' }
    });
  }
}

module.exports = new LeyendasService();