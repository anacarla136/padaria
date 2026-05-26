const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pedidos.controller');

router.get('/', ctrl.listarPedidos);
router.get('/:id', ctrl.buscarPedidoPorId);
router.post('/', ctrl.criarPedido);
router.patch('/:id/status', ctrl.atualizarStatusPedido);

module.exports = router;
