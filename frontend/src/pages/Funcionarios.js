// src/pages/Funcionarios.js
import React, { useEffect, useState } from 'react';
import { funcionariosService } from '../services/api';
import { MdBadge, MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

const CARGOS = ['Gerente', 'Padeiro', 'Confeiteiro', 'Atendente', 'Caixa', 'Entregador', 'Auxiliar'];

const CORES_CARGO = {
  Gerente:      { bg: '#fff0d6', cor: '#7A4A00' },
  Padeiro:      { bg: '#d1e7dd', cor: '#0f5132' },
  Confeiteiro:  { bg: '#e8d5f5', cor: '#5a2d82' },
  Atendente:    { bg: '#fef3cd', cor: '#856404' },
  Caixa:        { bg: '#d4edff', cor: '#0a4a7a' },
  Entregador:   { bg: '#f8d7da', cor: '#842029' },
  Auxiliar:     { bg: '#e2e3e5', cor: '#41464b' },
};

const FORM_VAZIO = { nome: '', email: '', telefone: '', cargo: '', salario: '', data_admissao: '' };

function Avatar({ nome }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: '#fff0d6', color: '#7A4A00',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
      border: '1px solid #E0C89A',
    }}>
      {iniciais}
    </div>
  );
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState(false);
  const [form, setForm]                 = useState(FORM_VAZIO);
  const [editandoId, setEditandoId]     = useState(null);
  const [mensagem, setMensagem]         = useState(null);
  const [busca, setBusca]               = useState('');

  const carregar = async (filtro = '') => {
    try {
      const res = await funcionariosService.listar({ busca: filtro || undefined });
      setFuncionarios(res.data.dados || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => carregar(busca), 350);
    return () => clearTimeout(timer);
  }, [busca]);

  const abrirModal = (func = null) => {
    if (func) {
      setForm({
        nome: func.nome,
        email: func.email,
        telefone: func.telefone || '',
        cargo: func.cargo,
        salario: func.salario || '',
        data_admissao: func.data_admissao ? func.data_admissao.split('T')[0] : '',
      });
      setEditandoId(func.id);
    } else {
      setForm(FORM_VAZIO);
      setEditandoId(null);
    }
    setModal(true);
  };

  const fecharModal = () => { setModal(false); setForm(FORM_VAZIO); setEditandoId(null); };

  const salvar = async () => {
    try {
      if (editandoId) {
        await funcionariosService.atualizar(editandoId, form);
        exibirMensagem('Funcionário atualizado com sucesso!', 'success');
      } else {
        await funcionariosService.criar(form);
        exibirMensagem('Funcionário cadastrado com sucesso!', 'success');
      }
      fecharModal();
      carregar(busca);
    } catch (err) {
      exibirMensagem(err.response?.data?.mensagem || 'Erro ao salvar.', 'danger');
    }
  };

  const deletar = async (id) => {
    if (!window.confirm('Deseja desativar este funcionário?')) return;
    try {
      await funcionariosService.deletar(id);
      exibirMensagem('Funcionário desativado.', 'success');
      carregar(busca);
    } catch {
      exibirMensagem('Erro ao desativar funcionário.', 'danger');
    }
  };

  const exibirMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3000);
  };

  if (loading) return <div className="loading">Carregando funcionários...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MdBadge size={26} color="#C47C2B" /> Funcionários
          </h2>
          <p>{funcionarios.length} funcionário{funcionarios.length !== 1 ? 's' : ''} ativo{funcionarios.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MdAdd size={18} /> Novo Funcionário
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
          placeholder="Buscar funcionário..."
          style={{
            width: '100%', padding: '9px 12px 9px 36px',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: '0.88rem', fontFamily: 'Poppins, sans-serif',
            background: 'var(--bg-card)', color: 'var(--text)', outline: 'none',
          }}
        />
      </div>

      {/* Tabela */}
      {funcionarios.length === 0 ? (
        <div className="empty-state"><p>Nenhum funcionário encontrado</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Cargo</th>
                  <th>Telefone</th>
                  <th>Salário</th>
                  <th>Admissão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map(f => {
                  const cor = CORES_CARGO[f.cargo] || { bg: '#e2e3e5', cor: '#41464b' };
                  return (
                    <tr key={f.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar nome={f.nome} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{f.nome}</div>
                            <div style={{ fontSize: '0.72rem', color: '#7A5C3E' }}>{f.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                          fontSize: '0.72rem', fontWeight: 600,
                          background: cor.bg, color: cor.cor,
                        }}>
                          {f.cargo}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{f.telefone || '-'}</td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600, color: '#C47C2B' }}>
                        {f.salario ? `R$ ${Number(f.salario).toFixed(2)}` : '-'}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {f.data_admissao ? new Date(f.data_admissao).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => abrirModal(f)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <MdEdit size={14} /> Editar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deletar(f.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <MdDelete size={14} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editandoId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome completo" />
              </div>
              <div className="form-group">
                <label>E-mail *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cargo *</label>
                <select value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})}>
                  <option value="">Selecione...</option>
                  {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="Ex: 83 99999-1111" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Salário (R$)</label>
                <input type="number" step="0.01" value={form.salario} onChange={e => setForm({...form, salario: e.target.value})} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Data de Admissão</label>
                <input type="date" value={form.data_admissao} onChange={e => setForm({...form, data_admissao: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={fecharModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}