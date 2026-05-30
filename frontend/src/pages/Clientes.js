// src/pages/Clientes.js
import React, { useEffect, useState } from 'react';
import { clientesService } from '../services/api';
import { MdPeople, MdAdd, MdEdit, MdSearch, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const FORM_VAZIO = { nome: '', email: '', telefone: '', endereco: '' };

function Avatar({ nome }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: '#fff0d6', color: '#7A4A00',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
      border: '1px solid #E0C89A',
    }}>
      {iniciais}
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes]     = useState([]);
  const [filtrados, setFiltrados]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem]     = useState(null);
  const [busca, setBusca]           = useState('');

  const carregar = async () => {
    try {
      const res = await clientesService.listar();
      const dados = res.data.dados || [];
      setClientes(dados);
      setFiltrados(dados);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    const termo = busca.toLowerCase();
    setFiltrados(
      clientes.filter(c =>
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo)
      )
    );
  }, [busca, clientes]);

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

  if (loading) return <div className="loading">Carregando clientes...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MdPeople size={26} color="#C47C2B" /> Clientes
          </h2>
          <p>{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MdAdd size={18} /> Novo Cliente
        </button>
      </div>

      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 340 }}>
        <MdSearch size={18} style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          color: '#7A5C3E', pointerEvents: 'none',
        }} />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          style={{
            width: '100%', padding: '9px 12px 9px 36px',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: '0.88rem', fontFamily: 'Poppins, sans-serif',
            background: 'var(--bg-card)', color: 'var(--text)', outline: 'none',
          }}
        />
      </div>

      <div className="card">
        {filtrados.length === 0 ? (
          <div className="empty-state"><p>Nenhum cliente encontrado</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdEmail size={13} /> E-mail</span></th>
                  <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdPhone size={13} /> Telefone</span></th>
                  <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdLocationOn size={13} /> Endereço</span></th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar nome={c.nome} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.nome}</div>
                          <div style={{ fontSize: '0.72rem', color: '#7A5C3E' }}>#{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{c.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{c.telefone || '-'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{c.endereco || '-'}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => abrirModal(c)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MdEdit size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome completo" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="Ex: 83 99999-1111" />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} placeholder="Rua, número, bairro" />
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