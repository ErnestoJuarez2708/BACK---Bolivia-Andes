const leyendasService = require('../services/leyendas.service');

class LeyendasController {
  async getById(req, res) {
    try {
      const leyenda = await leyendasService.getById(req.params.id);
      if (!leyenda) return res.status(404).json({ error: 'Leyenda no encontrada' });
      res.json(leyenda);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const leyendas = await leyendasService.getAll();
      res.json(leyendas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new LeyendasController();