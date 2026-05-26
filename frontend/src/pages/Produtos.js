// src/pages/Produtos.js
import React, { useEffect, useState } from 'react';
import { produtosService, categoriasService } from '../services/api';

const EMOJIS_CATEGORIA = { 1: '🥖', 2: '🎂', 3: '🥐', 4: '🍬', 5: '☕' };

const FORM_VAZIO = { nome: '', descricao: '', preco: '', estoque: '', categoria_id: '' };

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const carregar = async () => {
    try {
      const [rProd, rCat] = await Promise.all([
        produtosService.listar({ ativo: true }),
        categoriasService.listar(),
      ]);
      setProdutos(rProd.data.dados || []);
      setCategorias(rCat.data.dados || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

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
      carregar();
    } catch (err) {
      exibirMensagem('Erro ao salvar produto.', 'danger');
    }
  };

  const deletar = async (id) => {
    if (!window.confirm('Deseja desativar este produto?')) return;
    try {
      await produtosService.deletar(id);
      exibirMensagem('Produto desativado.', 'success');
      carregar();
    } catch {
      exibirMensagem('Erro ao desativar produto.', 'danger');
    }
  };

  const exibirMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3000);
  };

  if (loading) return <div className="loading">⏳ Carregando produtos...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🍞 Produtos</h2>
          <p>{produtos.length} produtos cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Novo Produto</button>
      </div>

      {mensagem && (
        <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      <div className="produtos-grid">
        {produtos.map(p => (
          <div className="produto-card" key={p.id}>
            <div className="emoji">{EMOJIS_CATEGORIA[p.categoria_id] || '🛍️'}</div>
            <h4>{p.nome}</h4>
            <p style={{ fontSize: '0.8rem', color: '#7a6055', marginBottom: 4 }}>{p.categoria_nome}</p>
            <div className="preco">R$ {Number(p.preco).toFixed(2)}</div>
            <div className="estoque">Estoque: {p.estoque} unid.</div>
            <div className="produto-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => abrirModal(p)}>✏️ Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deletar(p.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

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
