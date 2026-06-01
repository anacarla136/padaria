// src/routes/funcionarios.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/funcionarios.controller');

//  GET    /api/funcionarios       - Lista todos os funcionários (com paginação e filtros)
// GET    /api/funcionarios/:id   - Busca por ID do funcionário
// POST   /api/funcionarios       - Cria um novo funcionário
// PUT    /api/funcionarios/:id   - Atualiza um funcionário existente
// DELETE /api/funcionarios/:id   -  Desativa (soft delete) Remove um funcionário existente

router.get('/', ctrl.listarFuncionarios);
router.get('/:id', ctrl.buscarFuncionarioPorId);
router.post('/', ctrl.criarFuncionario);
router.put('/:id', ctrl.atualizarFuncionario);
router.delete('/:id', ctrl.deletarFuncionario);

module.exports = router;