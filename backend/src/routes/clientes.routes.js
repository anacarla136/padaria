const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientes.controller');

router.get('/', ctrl.listarClientes);
router.get('/:id', ctrl.buscarClientePorId);
router.post('/', ctrl.criarCliente);
router.put('/:id', ctrl.atualizarCliente);

module.exports = router;
