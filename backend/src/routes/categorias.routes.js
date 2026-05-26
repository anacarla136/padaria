const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categorias.controller');

router.get('/', ctrl.listarCategorias);
router.post('/', ctrl.criarCategoria);

module.exports = router;
