// src/server.js
// Ponto de entrada do servidor Node.js
// Este arquivo inicializa o microsserviço conforme a variável SERVICE_NAME

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE_NAME = process.env.SERVICE_NAME || 'produtos';

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log de requisições (simples, educacional)
app.use((req, res, next) => {
  const agora = new Date().toISOString();
  console.log(`[${agora}] [${SERVICE_NAME.toUpperCase()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ROTAS DO MICROSSERVIÇO
// ============================================

// Rota de health check - essencial em microsserviços
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    servico: SERVICE_NAME,
    porta: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Carrega as rotas do microsserviço correto
if (SERVICE_NAME === 'produtos') {
  const produtosRoutes = require('./routes/produtos.routes');
  const categoriasRoutes = require('./routes/categorias.routes');
  const funcionariosRoutes = require('./routes/funcionarios.routes');
  app.use('/api/produtos', produtosRoutes);
  app.use('/api/categorias', categoriasRoutes);
  app.use('/api/funcionarios',  funcionariosRoutes);
}

if (SERVICE_NAME === 'pedidos') {
  const pedidosRoutes = require('./routes/pedidos.routes');
  const clientesRoutes = require('./routes/clientes.routes');
  app.use('/api/pedidos', pedidosRoutes);
  app.use('/api/clientes', clientesRoutes);
}

// ============================================
// MIDDLEWARE DE ERRO GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({
    erro: 'Erro interno do servidor',
    mensagem: err.message,
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// ============================================
// INICIALIZA O SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🥖 Padaria do Zé - Microsserviço ATIVO`);
  console.log(`📦 Serviço: ${SERVICE_NAME.toUpperCase()}`);
  console.log(`🚀 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
});

module.exports = app;
