// src/controllers/categorias.controller.js

const db = require('../config/database');

const listarCategorias = async (req, res) => {
  try {
    const resultado = await db.query('SELECT * FROM categorias ORDER BY nome ASC');
    res.json({ sucesso: true, dados: resultado.rows });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

const criarCategoria = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ sucesso: false, mensagem: 'Nome é obrigatório' });

    const resultado = await db.query(
      'INSERT INTO categorias (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao]
    );
    res.status(201).json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

module.exports = { listarCategorias, criarCategoria };
