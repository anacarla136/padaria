// src/pages/Clientes.js
import React, { useEffect, useState } from 'react';
import { clientesService } from '../services/api';

const FORM_VAZIO = { nome: '', email: '', telefone: '', endereco: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const carregar = async () => {
    try {
      const res = await clientesService.listar();
      setClientes(res.data.dados || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirModal = (cliente = null) => {
    if (cliente) {
      setForm({ nome: cliente.nome, email: cliente.email, telefone: cliente.telefone || '', endereco: cliente.endereco || '' });
      setEditandoId(cliente.id);
    } else {
      setForm(FORM_VAZIO);
      setEditandoId(null);
    }
    setModal(true);
  };

  const salvar = async () => {
    try {
      if (editandoId) {
        await clientesService.atualizar(editandoId, form);
      } else {
        await clientesService.criar(form);
      }
      setMensagem({ texto: 'Cliente salvo com sucesso!', tipo: 'success' });
      setModal(false);
      setForm(FORM_VAZIO);
      setEditandoId(null);
      carregar();
    } catch (err) {
      setMensagem({ texto: err.response?.data?.mensagem || 'Erro ao salvar.', tipo: 'danger' });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  if (loading) return <div className="loading">⏳ Carregando clientes...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>👥 Clientes</h2>
          <p>{clientes.length} clientes cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Novo Cliente</button>
      </div>

      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><strong>{c.nome}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.telefone || '-'}</td>
                  <td>{c.endereco || '-'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => abrirModal(c)}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="Ex: 63 99999-1111" />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
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
