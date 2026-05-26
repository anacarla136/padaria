// src/pages/Categorias.js
import React, { useEffect, useState } from 'react';
import { categoriasService } from '../services/api';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [mensagem, setMensagem] = useState(null);

  const carregar = async () => {
    try {
      const res = await categoriasService.listar();
      setCategorias(res.data.dados || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    try {
      await categoriasService.criar(form);
      setMensagem({ texto: 'Categoria criada!', tipo: 'success' });
      setModal(false);
      setForm({ nome: '', descricao: '' });
      carregar();
    } catch {
      setMensagem({ texto: 'Erro ao criar categoria.', tipo: 'danger' });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  if (loading) return <div className="loading">⏳ Carregando categorias...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🏷️ Categorias</h2>
          <p>{categorias.length} categorias cadastradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nova Categoria</button>
      </div>

      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><strong>{c.nome}</strong></td>
                  <td>{c.descricao || '-'}</td>
                  <td>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nova Categoria</h3>
            <div className="form-group">
              <label>Nome *</label>
              <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Tortas" />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea rows={2} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
