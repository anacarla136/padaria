// src/controllers/funcionarios.controller.js
// Controller do recurso Funcionários
// Segue o mesmo padrão do produtos.controller.js

const db = require('../config/database');

// GET /api/funcionarios
const listarFuncionarios = async (req, res) => {
  try {
    const { busca, cargo } = req.query;

    let query = `SELECT * FROM funcionarios WHERE ativo = TRUE`;
    const params = [];

    if (busca) {
      params.push(`%${busca}%`);
      query += ` AND (nome ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    if (cargo) {
      params.push(cargo);
      query += ` AND cargo = $${params.length}`;
    }

    query += ' ORDER BY nome ASC';

    const resultado = await db.query(query, params);
    res.json({ sucesso: true, total: resultado.rows.length, dados: resultado.rows });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// GET /api/funcionarios/:id
const buscarFuncionarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await db.query('SELECT * FROM funcionarios WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
    }

    res.json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// POST /api/funcionarios
const criarFuncionario = async (req, res) => {
  try {
    const { nome, email, telefone, cargo, salario, data_admissao } = req.body;

    if (!nome || !email || !cargo) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome, email e cargo são obrigatórios' });
    }

    const resultado = await db.query(
      `INSERT INTO funcionarios (nome, email, telefone, cargo, salario, data_admissao)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nome, email, telefone, cargo, salario || null, data_admissao || null]
    );

    res.status(201).json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail já cadastrado' });
    }
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// PUT /api/funcionarios/:id
const atualizarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cargo, salario, data_admissao } = req.body;

    const resultado = await db.query(
      `UPDATE funcionarios
       SET nome = COALESCE($1, nome),
           email = COALESCE($2, email),
           telefone = COALESCE($3, telefone),
           cargo = COALESCE($4, cargo),
           salario = COALESCE($5, salario),
           data_admissao = COALESCE($6, data_admissao),
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $7 AND ativo = TRUE
       RETURNING *`,
      [nome, email, telefone, cargo, salario, data_admissao, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
    }

    res.json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// DELETE /api/funcionarios/:id — soft delete
const deletarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await db.query(
      `UPDATE funcionarios SET ativo = FALSE, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
    }

    res.json({ sucesso: true, mensagem: 'Funcionário desativado com sucesso' });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

module.exports = {
  listarFuncionarios,
  buscarFuncionarioPorId,
  criarFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
};