const express = require('express');
const router = express.Router();
const leyendasController = require('../controllers/leyendas.controller');

router.get('/:id', leyendasController.getById);
router.get('/', leyendasController.getAll);

module.exports = router;