// src/config/database.js
// Configuração da conexão com o PostgreSQL

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'padaria_user',
  password: process.env.DB_PASSWORD || 'padaria123',
  database: process.env.DB_NAME || 'padaria_db',
  // Pool de conexões - conceito importante para escalabilidade
  max: 10,           // máximo de conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco de dados:', err.stack);
  } else {
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    release();
  }
});

module.exports = pool;
