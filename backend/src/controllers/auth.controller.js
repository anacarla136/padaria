// src/controllers/auth.controller.js
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ctrlpao_secret_2024';

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND senha_texto = $2',
      [email, senha]
    );

    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

module.exports = { login };