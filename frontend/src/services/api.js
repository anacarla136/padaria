// src/services/api.js
// Camada de serviços que faz a comunicação com os microsserviços do backend

import axios from 'axios';

// URLs dos dois microsserviços
const API_PRODUTOS = process.env.REACT_APP_API_PRODUTOS || 'http://localhost:3001/api';
const API_PEDIDOS = process.env.REACT_APP_API_PEDIDOS || 'http://localhost:3002/api';

// Instâncias do axios para cada microsserviço
const apiProdutos = axios.create({ baseURL: API_PRODUTOS });
const apiPedidos = axios.create({ baseURL: API_PEDIDOS });

// ==================== PRODUTOS ====================
export const produtosService = {
  listar: (params) => apiProdutos.get('/produtos', { params }),
  buscarPorId: (id) => apiProdutos.get(`/produtos/${id}`),
  criar: (dados) => apiProdutos.post('/produtos', dados),
  atualizar: (id, dados) => apiProdutos.put(`/produtos/${id}`, dados),
  deletar: (id) => apiProdutos.delete(`/produtos/${id}`),
};

// ==================== CATEGORIAS ====================
export const categoriasService = {
  listar: () => apiProdutos.get('/categorias'),
  criar: (dados) => apiProdutos.post('/categorias', dados),
};

// ==================== CLIENTES ====================
export const clientesService = {
  listar: () => apiPedidos.get('/clientes'),
  buscarPorId: (id) => apiPedidos.get(`/clientes/${id}`),
  criar: (dados) => apiPedidos.post('/clientes', dados),
  atualizar: (id, dados) => apiPedidos.put(`/clientes/${id}`, dados),
};

// ==================== PEDIDOS ====================
export const pedidosService = {
  listar: (params) => apiPedidos.get('/pedidos', { params }),
  buscarPorId: (id) => apiPedidos.get(`/pedidos/${id}`),
  criar: (dados) => apiPedidos.post('/pedidos', dados),
  atualizarStatus: (id, status) => apiPedidos.patch(`/pedidos/${id}/status`, { status }),
};
