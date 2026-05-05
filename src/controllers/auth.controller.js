const authService = require('../services/auth.service');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      const status = err.message.includes('registrado') ? 409 : 400;
      res.status(status).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      console.error(err);
      const status = err.message.includes('inválidas') ? 401 : 400;
      res.status(status).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();