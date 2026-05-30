// src/pages/Categorias.js
import React, { useEffect, useState } from 'react';
import { categoriasService } from '../services/api';
import { MdLabel, MdAdd } from 'react-icons/md';

const CORES_CATEGORIA = [
  { bg: '#fff0d6', cor: '#7A4A00' },
  { bg: '#d1e7dd', cor: '#0f5132' },
  { bg: '#fef3cd', cor: '#856404' },
  { bg: '#e8d5f5', cor: '#5a2d82' },
  { bg: '#d4edff', cor: '#0a4a7a' },
  { bg: '#f8d7da', cor: '#842029' },
];

function getCor(id) {
  const idx = (Number(id) - 1) % CORES_CATEGORIA.length;
  return CORES_CATEGORIA[idx >= 0 ? idx : 0];
}

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState({ nome: '', descricao: '' });
  const [mensagem, setMensagem]     = useState(null);

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

  if (loading) return <div className="loading">Carregando categorias...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MdLabel size={26} color="#C47C2B" /> Categorias
          </h2>
          <p>{categorias.length} categoria{categorias.length !== 1 ? 's' : ''} cadastrada{categorias.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MdAdd size={18} /> Nova Categoria
        </button>
      </div>

      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      {categorias.length === 0 ? (
        <div className="empty-state"><p>Nenhuma categoria cadastrada ainda</p></div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {categorias.map(c => {
            const cor = getCor(c.id);
            return (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Chip */}
                <span style={{
                  display: 'inline-block', alignSelf: 'flex-start',
                  padding: '3px 12px', borderRadius: 20,
                  fontSize: '0.72rem', fontWeight: 600,
                  background: cor.bg, color: cor.cor,
                }}>
                  {c.nome}
                </span>

                {/* Descrição */}
                <p style={{ fontSize: '0.82rem', color: '#7A5C3E', lineHeight: 1.6, flex: 1 }}>
                  {c.descricao || 'Sem descrição'}
                </p>

                {/* Rodapé do card */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4,
                }}>
                  <span style={{ fontSize: '0.72rem', color: '#7A5C3E', fontWeight: 500 }}>
                    #{c.id}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#7A5C3E' }}>
                    {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

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
              <textarea rows={2} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Descrição da categoria" />
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