// src/controllers/pedidos.controller.js

const db = require('../config/database');

// GET /api/pedidos - Lista todos os pedidos
const listarPedidos = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT p.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE p.status = $1`;
    }

    query += ' ORDER BY p.criado_em DESC';

    const resultado = await db.query(query, params);
    res.json({ sucesso: true, total: resultado.rows.length, dados: resultado.rows });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// GET /api/pedidos/:id - Detalhes de um pedido com itens
const buscarPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await db.query(
      `SELECT p.*, c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (pedido.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado' });
    }

    const itens = await db.query(
      `SELECT ip.*, pr.nome AS produto_nome
       FROM itens_pedido ip
       JOIN produtos pr ON ip.produto_id = pr.id
       WHERE ip.pedido_id = $1`,
      [id]
    );

    res.json({
      sucesso: true,
      dados: {
        ...pedido.rows[0],
        itens: itens.rows,
      },
    });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

// POST /api/pedidos - Cria um novo pedido
const criarPedido = async (req, res) => {
  const client = await db.connect(); // Usa transação para garantir integridade
  try {
    await client.query('BEGIN');

    const { cliente_id, itens, observacao } = req.body;

    if (!cliente_id || !itens || itens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'cliente_id e itens são obrigatórios',
      });
    }

    // Calcular total
    let total = 0;
    for (const item of itens) {
      total += item.quantidade * item.preco_unitario;
    }

    // Criar pedido
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (cliente_id, total, observacao, status)
       VALUES ($1, $2, $3, 'pendente') RETURNING *`,
      [cliente_id, total, observacao]
    );
    const pedido = pedidoResult.rows[0];

    // Inserir itens
    for (const item of itens) {
      await client.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, item.produto_id, item.quantidade, item.preco_unitario]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ sucesso: true, dados: pedido });
  } catch (erro) {
    await client.query('ROLLBACK');
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  } finally {
    client.release();
  }
};

// PATCH /api/pedidos/:id/status - Atualiza o status do pedido
const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['pendente', 'em_preparo', 'pronto', 'entregue', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Status inválido. Use: ${statusValidos.join(', ')}`,
      });
    }

    const resultado = await db.query(
      `UPDATE pedidos SET status = $1, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado' });
    }

    res.json({ sucesso: true, dados: resultado.rows[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

module.exports = { listarPedidos, buscarPedidoPorId, criarPedido, atualizarStatusPedido };
