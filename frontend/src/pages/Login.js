// src/pages/Login.js
import React, { useState } from 'react';
import { MdShoppingBag, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import axios from 'axios';

const API = process.env.REACT_APP_API_PRODUTOS || 'http://localhost:3001/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const resposta = await axios.post(`${API}/auth/login`, { email, senha });
      const { token, usuario } = resposta.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      onLogin(usuario);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <MdShoppingBag size={32} color="#3d1a1a" />
          </div>
          <h1>Ctrl+Pão</h1>
          <p>DO FORNO AO CAIXA, TUDO SOB CONTROLE.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {erro && <div className="login-erro">⚠️ {erro}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-senha">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-olho"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha
                  ? <MdVisibilityOff size={20} />
                  : <MdVisibility size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar no forno'}
          </button>
        </form>

        <div className="login-footer">
          Ctrl+Pão © 2026 — Gestão fresquinha todo dia
        </div>
      </div>
    </div>
  );
}

export default Login;