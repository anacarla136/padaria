// src/pages/Pedidos.js
import React, { useEffect, useState } from 'react';
import { pedidosService, clientesService, produtosService } from '../services/api';
import { MdReceiptLong, MdAdd, MdSearch, MdClose } from 'react-icons/md';

const STATUS_OPTIONS = ['pendente', 'em_preparo', 'pronto', 'entregue', 'cancelado'];

const STATUS_CONFIG = {
  pendente:   { label: 'Pendente',   cor: '#856404', bg: '#fef3cd' },
  em_preparo: { label: 'Em Preparo', cor: '#7A4A00', bg: '#fff0d6' },
  pronto:     { label: 'Pronto',     cor: '#0f5132', bg: '#d1e7dd' },
  entregue:   { label: 'Entregue',   cor: '#41464b', bg: '#e2e3e5' },
  cancelado:  { label: 'Cancelado',  cor: '#842029', bg: '#f8d7da' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cor: '#555', bg: '#eee' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
      color: cfg.cor, background: cfg.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.cor, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

export default function Pedidos() {
  const [pedidos, setPedidos]       = useState([]);
  const [clientes, setClientes]     = useState([]);
  const [produtos, setProdutos]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [detalheId, setDetalheId]   = useState(null);
  const [detalhe, setDetalhe]       = useState(null);
  const [mensagem, setMensagem]     = useState(null);
  const [filtrando, setFiltrando]   = useState('');
  const [busca, setBusca]           = useState('');
  const [novoForm, setNovoForm]     = useState({ cliente_id: '', observacao: '', itens: [] });

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
      itens: [...prev.itens, { produto_id: '', quantidade: 1, preco_unitario: 0 }],
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

  const pedidosFiltrados = pedidos
    .filter(p => filtrando ? p.status === filtrando : true)
    .filter(p => busca
      ? p.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        String(p.id).includes(busca)
      : true
    );

  if (loading) return <div className="loading">Carregando pedidos...</div>;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MdReceiptLong size={26} color="#C47C2B" /> Pedidos
          </h2>
          <p>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MdAdd size={18} /> Novo Pedido
        </button>
      </div>

      {mensagem && <div className={`alert alert-${mensagem.tipo}`}>{mensagem.texto}</div>}

      {/* Busca + Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <MdSearch size={18} style={{
            position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
            color: '#7A5C3E', pointerEvents: 'none',
          }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou #ID..."
            style={{
              padding: '9px 12px 9px 36px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: '0.88rem', fontFamily: 'Poppins, sans-serif',
              background: 'var(--bg-card)', color: 'var(--text)', outline: 'none', width: 260,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${filtrando === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltrando('')}>
            Todos
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setFiltrando(s)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif',
                background: filtrando === s ? STATUS_CONFIG[s].bg : 'var(--bg-card)',
                color: filtrando === s ? STATUS_CONFIG[s].cor : '#7A5C3E',
                border: `1px solid ${filtrando === s ? STATUS_CONFIG[s].cor + '44' : 'var(--border)'}`,
              }}>
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="empty-state"><p>Nenhum pedido encontrado</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedidosFiltrados.map(p => (
            <div className="card" key={p.id} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pedido #{p.id}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#7A5C3E', marginBottom: 2 }}>
                  {p.cliente_nome || 'Cliente não encontrado'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#7A5C3E' }}>
                  {new Date(p.criado_em).toLocaleString('pt-BR')}
                  <span style={{ margin: '0 6px' }}>·</span>
                  <span style={{ fontWeight: 700, color: '#C47C2B' }}>R$ {Number(p.total).toFixed(2)}</span>
                </div>
                {p.observacao && (
                  <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#7A5C3E', marginTop: 2 }}>
                    Obs: {p.observacao}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={p.status}
                  onChange={e => atualizarStatus(p.id, e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
                    fontSize: '0.82rem', fontFamily: 'Poppins, sans-serif',
                    background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', outline: 'none',
                  }}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={() => verDetalhe(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MdSearch size={14} /> Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Detalhes */}
      {detalheId && detalhe && (
        <div className="modal-overlay" onClick={() => { setDetalheId(null); setDetalhe(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Pedido #{detalhe.id}</h3>
              <button onClick={() => { setDetalheId(null); setDetalhe(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A5C3E' }}>
                <MdClose size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem' }}><strong>Cliente:</strong> {detalhe.cliente_nome}</div>
              <div style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>Status:</strong> <StatusBadge status={detalhe.status} />
              </div>
              {detalhe.observacao && <div style={{ fontSize: '0.88rem' }}><strong>Obs:</strong> {detalhe.observacao}</div>}
            </div>

            <hr style={{ margin: '12px 0', borderColor: 'var(--border)' }} />
            <h4 style={{ marginBottom: 10, fontSize: '0.9rem' }}>Itens</h4>
            {(detalhe.itens || []).map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--border)',
                fontSize: '0.85rem',
              }}>
                <span>{item.produto_nome} <span style={{ color: '#7A5C3E' }}>x{item.quantidade}</span></span>
                <span style={{ fontWeight: 600, color: '#C47C2B' }}>R$ {Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: 14, fontWeight: 700, fontSize: '1.05rem', color: '#C47C2B' }}>
              Total: R$ {Number(detalhe.total).toFixed(2)}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setDetalheId(null); setDetalhe(null); }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Pedido */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Novo Pedido</h3>
              <button onClick={() => setModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A5C3E' }}>
                <MdClose size={20} />
              </button>
            </div>
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

            <h4 style={{ marginBottom: 10, fontSize: '0.9rem' }}>Itens do Pedido</h4>
            {novoForm.itens.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select style={{ flex: 2, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem' }}
                  value={item.produto_id}
                  onChange={e => atualizarItem(i, 'produto_id', e.target.value)}>
                  <option value="">Produto...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {Number(p.preco).toFixed(2)}</option>)}
                </select>
                <input type="number" min={1}
                  style={{ width: 60, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}
                  value={item.quantidade}
                  onChange={e => atualizarItem(i, 'quantidade', Number(e.target.value))} />
                <span style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#C47C2B', fontWeight: 600, minWidth: 70 }}>
                  R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                </span>
                <button className="btn btn-danger btn-sm" onClick={() => removerItem(i)}
                  style={{ display: 'flex', alignItems: 'center' }}>
                  <MdClose size={14} />
                </button>
              </div>
            ))}

            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={adicionarItem}>
              <MdAdd size={15} /> Adicionar Item
            </button>

            {novoForm.itens.length > 0 && (
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#C47C2B', marginBottom: 8, fontSize: '0.95rem' }}>
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