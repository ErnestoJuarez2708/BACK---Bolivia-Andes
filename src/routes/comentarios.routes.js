const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwt-auth');
const comentariosController = require('../controllers/comentarios.controller');

router.get('/:leyenda_id', comentariosController.getByLeyenda);
router.post('/', authMiddleware, comentariosController.create);

module.exports = router;