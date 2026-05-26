// src/pages/Pedidos.js
import React, { useEffect, useState } from 'react';
import { pedidosService, clientesService, produtosService } from '../services/api';

const STATUS_OPTIONS = ['pendente', 'em_preparo', 'pronto', 'entregue', 'cancelado'];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detalheId, setDetalheId] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [filtrando, setFiltrando] = useState('');

  // Form de novo pedido
  const [novoForm, setNovoForm] = useState({ cliente_id: '', observacao: '', itens: [] });

  const carregar = async () => {
    try {
      const [rPed, rCli, rProd] = await Promise.all([
        pedidosService.listar(),
        clientesService.listar(),
        produtosService.listar({ ativo: true }),
      ]);
      setPedidos(rPed.data.dados || []);
      setClientes(rCli.data.dados || []);
      setProdutos(rProd.data.dados || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const verDetalhe = async (id) => {
    try {
      const res = await pedidosService.buscarPorId(id);
      setDetalhe(res.data.dados);
      setDetalheId(id);
    } catch {
      exibirMensagem('Erro ao carregar pedido.', 'danger');
    }
  };

  const atualizarStatus = async (id, status) => {
    try {
      await pedidosService.atualizarStatus(id, status);
      exibirMensagem('Status atualizado!', 'success');
      carregar();
      if (detalheId === id) verDetalhe(id);
    } catch {
      exibirMensagem('Erro ao atualizar status.', 'danger');
    }
  };

  const adicionarItem = () => {
    setNovoForm(prev => ({
      ...prev,
      itens: [...prev.itens, { produto_id: '', quantidade: 1, preco_unitario: 0 }]
    }));
  };

  const atualizarItem = (index, campo, valor) => {
    const itens = [...novoForm.itens];
    itens[index][campo] = valor;
    if (campo === 'produto_id') {
      const prod = produtos.find(p => p.id === Number(valor));
      if (prod) itens[index].preco_unitario = prod.preco;
    }
    setNovoForm(prev => ({ ...prev, itens }));
  };

  const removerItem = (index) => {
    setNovoForm(prev => ({ ...prev, itens: prev.itens.filter((_, i) => i !== index) }));
  };

  const totalNovoPedido = novoForm.itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);

  const salvarPedido = async () => {
    if (!novoForm.cliente_id || novoForm.itens.length === 0) {
      exibirMensagem('Selecione o cliente e adicione pelo menos um item.', 'danger');
      return;
    }
    try {
      await pedidosService.criar(novoForm);
      exibirMensagem('Pedido criado com sucesso!', 'success');
      setModal(false);
      setNovoForm({ cliente_id: '', observacao: '', itens: [] });
      carregar();
    } catch {
      exibirMensagem('Erro ao criar pedido.', 'danger');
    }
  };

  const exibirMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3000);
  };

  const pedidosFiltrados = filtrando ? pedidos.filter(p => p.status === filtrando) : pedidos;

  if (loading) return <div className="loading">⏳ Carregando pedidos...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🛒 Pedidos</h2>
          <p>{pedidos.length} pedidos no total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Novo Pedido</button>
      </div>

      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      {/* Filtro de status */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${filtrando === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltrando('')}>Todos</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} className={`btn btn-sm ${filtrando === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltrando(s)}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {pedidosFiltrados.map(p => (
          <div className="card" key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong>Pedido #{p.id}</strong> — {p.cliente_nome || 'Cliente não encontrado'}
              <span style={{ marginLeft: 12 }} className={`badge badge-${p.status}`}>{p.status.replace('_', ' ')}</span>
              <div style={{ fontSize: '0.8rem', color: '#7a6055', marginTop: 2 }}>
                {new Date(p.criado_em).toLocaleString('pt-BR')} · R$ {Number(p.total).toFixed(2)}
              </div>
              {p.observacao && <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: 2 }}>Obs: {p.observacao}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="btn btn-secondary btn-sm"
                value={p.status}
                onChange={e => atualizarStatus(p.id, e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => verDetalhe(p.id)}>🔍 Detalhes</button>
            </div>
          </div>
        ))}
        {pedidosFiltrados.length === 0 && (
          <div className="empty-state"><div className="empty-icon">🛒</div><p>Nenhum pedido encontrado</p></div>
        )}
      </div>

      {/* Modal: Detalhes do pedido */}
      {detalheId && detalhe && (
        <div className="modal-overlay" onClick={() => { setDetalheId(null); setDetalhe(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Pedido #{detalhe.id}</h3>
            <p><strong>Cliente:</strong> {detalhe.cliente_nome}</p>
            <p><strong>Status:</strong> <span className={`badge badge-${detalhe.status}`}>{detalhe.status}</span></p>
            {detalhe.observacao && <p><strong>Obs:</strong> {detalhe.observacao}</p>}
            <hr style={{ margin: '16px 0', borderColor: '#e8d5c0' }} />
            <h4 style={{ marginBottom: 10 }}>Itens</h4>
            {(detalhe.itens || []).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0e0d0' }}>
                <span>{item.produto_nome} x{item.quantidade}</span>
                <span>R$ {Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 700, fontSize: '1.1rem', color: '#c8841a' }}>
              Total: R$ {Number(detalhe.total).toFixed(2)}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setDetalheId(null); setDetalhe(null); }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo pedido */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <h3>Novo Pedido</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Cliente *</label>
                <select value={novoForm.cliente_id} onChange={e => setNovoForm({ ...novoForm, cliente_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Observação</label>
                <input value={novoForm.observacao} onChange={e => setNovoForm({ ...novoForm, observacao: e.target.value })} placeholder="Ex: sem cebola" />
              </div>
            </div>

            <h4 style={{ marginBottom: 8 }}>Itens do Pedido</h4>
            {novoForm.itens.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select style={{ flex: 2, padding: '8px', borderRadius: 8, border: '1px solid #e8d5c0' }}
                  value={item.produto_id}
                  onChange={e => atualizarItem(i, 'produto_id', e.target.value)}>
                  <option value="">Produto...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {Number(p.preco).toFixed(2)}</option>)}
                </select>
                <input type="number" min={1} style={{ width: 60, padding: '8px', borderRadius: 8, border: '1px solid #e8d5c0', textAlign: 'center' }}
                  value={item.quantidade}
                  onChange={e => atualizarItem(i, 'quantidade', Number(e.target.value))} />
                <span style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#c8841a', fontWeight: 600 }}>
                  R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                </span>
                <button className="btn btn-danger btn-sm" onClick={() => removerItem(i)}>✕</button>
              </div>
            ))}

            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={adicionarItem}>+ Adicionar Item</button>

            {novoForm.itens.length > 0 && (
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#c8841a', marginBottom: 8 }}>
                Total: R$ {totalNovoPedido.toFixed(2)}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarPedido}>Criar Pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
