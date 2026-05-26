// src/controllers/produtos.controller.js
// Controller do recurso Produtos
// Contém a lógica de negócio (CRUD completo)

const db = require('../config/database');

// GET /api/produtos - Lista todos os produtos
const listarProdutos = async (req, res) => {
  try {
    const { categoria_id, ativo, busca } = req.query;

    let query = `
      SELECT p.*, c.nome AS categoria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (categoria_id) {
      params.push(categoria_id);
      query += ` AND p.categoria_id = $${params.length}`;
    }

    if (ativo !== undefined) {
      params.push(ativo === 'true');
      query += ` AND p.ativo = $${params.length}`;
    }

    if (busca) {
      params.push(`%${busca}%`);
      query += ` AND (p.nome ILIKE $${params.length} OR p.descricao ILIKE $${params.length})`;
    }

    query += ' ORDER BY p.nome ASC';

    const resultado = await db.query(query, params);
    res.json({
      sucesso: true,
      total: resultado.rows.length,
      dados: resultado.rows,
    });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// GET /api/produtos/:id - Busca um produto por ID
const buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await db.query(
      `SELECT p.*, c.nome AS categoria_nome
       FROM produtos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado' });
    }

    res.json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// POST /api/produtos - Cria um novo produto
const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, categoria_id, imagem_url } = req.body;

    // Validação básica
    if (!nome || !preco) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome e preço são obrigatórios',
      });
    }

    const resultado = await db.query(
      `INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id, imagem_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nome, descricao, preco, estoque || 0, categoria_id, imagem_url]
    );

    res.status(201).json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// PUT /api/produtos/:id - Atualiza um produto
const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque, categoria_id, imagem_url, ativo } = req.body;

    const resultado = await db.query(
      `UPDATE produtos
       SET nome = COALESCE($1, nome),
           descricao = COALESCE($2, descricao),
           preco = COALESCE($3, preco),
           estoque = COALESCE($4, estoque),
           categoria_id = COALESCE($5, categoria_id),
           imagem_url = COALESCE($6, imagem_url),
           ativo = COALESCE($7, ativo),
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [nome, descricao, preco, estoque, categoria_id, imagem_url, ativo, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado' });
    }

    res.json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// DELETE /api/produtos/:id - Remove (desativa) um produto
const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: apenas desativa, não remove do banco
    const resultado = await db.query(
      `UPDATE produtos SET ativo = FALSE, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado' });
    }

    res.json({ sucesso: true, mensagem: 'Produto desativado com sucesso' });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  deletarProduto,
};
