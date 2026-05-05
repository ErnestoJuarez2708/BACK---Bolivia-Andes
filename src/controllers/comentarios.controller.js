const comentariosService = require('../services/comentarios.service');

class ComentariosController {
  async getByLeyenda(req, res) {
    try {
      const result = await comentariosService.getByLeyenda(req.params.leyenda_id);
      res.json(result);
    } catch (err) {
      console.error(err);
      const status = err.message.includes('no encontrada') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const result = await comentariosService.create({
        ...req.body,
        userId: req.userId
      });
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      const status = err.message.includes('no existe') ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }
}

module.exports = new ComentariosController();