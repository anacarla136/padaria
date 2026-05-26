// src/routes/produtos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/produtos.controller');

// GET    /api/produtos          - Lista todos
// GET    /api/produtos/:id      - Busca por ID
// POST   /api/produtos          - Cria novo
// PUT    /api/produtos/:id      - Atualiza
// DELETE /api/produtos/:id      - Desativa (soft delete)

router.get('/', ctrl.listarProdutos);
router.get('/:id', ctrl.buscarProdutoPorId);
router.post('/', ctrl.criarProduto);
router.put('/:id', ctrl.atualizarProduto);
router.delete('/:id', ctrl.deletarProduto);

module.exports = router;
