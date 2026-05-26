// src/controllers/clientes.controller.js

const db = require('../config/database');

const listarClientes = async (req, res) => {
  try {
    const resultado = await db.query('SELECT * FROM clientes ORDER BY nome ASC');
    res.json({ sucesso: true, dados: resultado.rows });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

const buscarClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }
    res.json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

const criarCliente = async (req, res) => {
  try {
    const { nome, email, telefone, endereco } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome e email são obrigatórios' });
    }

    const resultado = await db.query(
      'INSERT INTO clientes (nome, email, telefone, endereco) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone, endereco]
    );
    res.status(201).json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(400).json({ sucesso: false, mensagem: 'Email já cadastrado' });
    }
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, endereco } = req.body;

    const resultado = await db.query(
      `UPDATE clientes SET
         nome = COALESCE($1, nome),
         email = COALESCE($2, email),
         telefone = COALESCE($3, telefone),
         endereco = COALESCE($4, endereco)
       WHERE id = $5 RETURNING *`,
      [nome, email, telefone, endereco, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }
    res.json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

module.exports = { listarClientes, buscarClientePorId, criarCliente, atualizarCliente };
