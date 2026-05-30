// src/pages/Produtos.js
import React, { useEffect, useState } from 'react';
import { produtosService, categoriasService } from '../services/api';
import { MdEdit, MdDelete, MdAdd, MdSearch, MdShoppingBag } from 'react-icons/md';

const FORM_VAZIO = { nome: '', descricao: '', preco: '', estoque: '', categoria_id: '' };

// Cores para os chips de categoria (vai ciclando)
const CORES_CATEGORIA = [
  { bg: '#fff0d6', cor: '#7A4A00' },
  { bg: '#d1e7dd', cor: '#0f5132' },
  { bg: '#fef3cd', cor: '#856404' },
  { bg: '#e8d5f5', cor: '#5a2d82' },
  { bg: '#d4edff', cor: '#0a4a7a' },
  { bg: '#f8d7da', cor: '#842029' },
];

function getCor(categoriaId) {
  const idx = (Number(categoriaId) - 1) % CORES_CATEGORIA.length;
  return CORES_CATEGORIA[idx >= 0 ? idx : 0];
}

export default function Produtos() {
  const [produtos, setProdutos]     = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem]     = useState(null);
  const [busca, setBusca]           = useState('');

  const carregar = async (filtro = '') => {
    try {
      const [rProd, rCat] = await Promise.all([
        produtosService.listar({ ativo: true, busca: filtro || undefined }),
        categoriasService.listar(),
      ]);
      setProdutos(rProd.data.dados || []);
      setCategorias(rCat.data.dados || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  // Busca com pequeno delay para não chamar a API a cada letra
  useEffect(() => {
    const timer = setTimeout(() => carregar(busca), 350);
    return () => clearTimeout(timer);
  }, [busca]);

  const abrirModal = (produto = null) => {
    if (produto) {
      setForm({
        nome: produto.nome,
        descricao: produto.descricao || '',
        preco: produto.preco,
        estoque: produto.estoque,
        categoria_id: produto.categoria_id || '',
      });
      setEditandoId(produto.id);
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
        await produtosService.atualizar(editandoId, form);
        exibirMensagem('Produto atualizado com sucesso!', 'success');
      } else {
        await produtosService.criar(form);
        exibirMensagem('Produto criado com sucesso!', 'success');
      }
      fecharModal();
      carregar(busca);
    } catch {
      exibirMensagem('Erro ao salvar produto.', 'danger');
    }
  };

  const deletar = async (id) => {
    if (!window.confirm('Deseja desativar este produto?')) return;
    try {
      await produtosService.deletar(id);
      exibirMensagem('Produto desativado.', 'success');
      carregar(busca);
    } catch {
      exibirMensagem('Erro ao desativar produto.', 'danger');
    }
  };

  const exibirMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3000);
  };

  if (loading) return <div className="loading">Carregando produtos...</div>;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MdShoppingBag size={26} color="#C47C2B" /> Produtos
            </h2>
          <p>{produtos.length} produto{produtos.length !== 1 ? 's' : ''} encontrado{produtos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          <MdAdd size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Novo Produto
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 340 }}>
        <MdSearch size={18} style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          color: '#7A5C3E', pointerEvents: 'none',
        }} />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          style={{
            width: '100%', padding: '9px 12px 9px 36px',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: '0.88rem', fontFamily: 'Poppins, sans-serif',
            background: 'var(--bg-card)', color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>

      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      {/* Grid de produtos */}
      {produtos.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="produtos-grid">
          {produtos.map(p => {
            const cor = getCor(p.categoria_id);
            const estoqueBaixo = p.estoque != null && p.estoque <= 5;
            return (
              <div className="produto-card" key={p.id}>

                {/* Tag de categoria */}
                {p.categoria_nome && (
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: '0.72rem', fontWeight: 600,
                    background: cor.bg, color: cor.cor,
                    marginBottom: 10,
                  }}>
                    {p.categoria_nome}
                  </span>
                )}

                <h4 style={{ marginBottom: 6 }}>{p.nome}</h4>

                {p.descricao && (
                  <p style={{ fontSize: '0.78rem', color: '#7A5C3E', marginBottom: 8, lineHeight: 1.5 }}>
                    {p.descricao}
                  </p>
                )}

                <div className="preco">R$ {Number(p.preco).toFixed(2)}</div>

                {/* Estoque com alerta se baixo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span className="estoque">Estoque: {p.estoque} unid.</span>
                  {estoqueBaixo && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px',
                      borderRadius: 20, background: p.estoque === 0 ? '#f8d7da' : '#fff0d6',
                      color: p.estoque === 0 ? '#842029' : '#7A4A00',
                    }}>
                      {p.estoque === 0 ? 'Sem estoque' : 'Baixo'}
                    </span>
                  )}
                </div>

                {/* Botões */}
                <div className="produto-actions" style={{ marginTop: 14 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => abrirModal(p)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <MdEdit size={15} /> Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deletar(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <MdDelete size={15} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editandoId ? 'Editar Produto' : 'Novo Produto'}</h3>
            <div className="form-group">
              <label>Nome *</label>
              <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Pão Francês" />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea rows={2} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Descrição do produto" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Preço (R$) *</label>
                <input type="number" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Estoque</label>
                <input type="number" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
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