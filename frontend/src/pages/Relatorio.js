// src/pages/Relatorio.js
import React, { useState } from 'react';
import { pedidosService } from '../services/api';
import { MdBarChart, MdSearch } from 'react-icons/md';

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

export default function Relatorio() {
  const hoje = new Date().toISOString().split('T')[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [de, setDe]         = useState(inicioMes);
  const [ate, setAte]       = useState(hoje);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState(null);

  const gerar = async () => {
    if (!de || !ate) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await pedidosService.relatorio(de, ate);
      setResultado(res.data);
    } catch {
      setErro('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MdBarChart size={26} color="#C47C2B" /> Relatório de Vendas
          </h2>
          <p>Consulte os pedidos por período</p>
        </div>
      </div>

      {/* Filtro de período */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data inicial</label>
            <input type="date" value={de} onChange={e => setDe(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data final</label>
            <input type="date" value={ate} onChange={e => setAte(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <button className="btn btn-primary" onClick={gerar} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 38 }}>
            <MdSearch size={18} />
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {resultado && (
        <>
          {/* Resumo */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-icon">
                <MdBarChart size={22} color="#C47C2B" />
              </div>
              <div className="stat-info">
                <div className="stat-value">{resultado.resumo.totalPedidos}</div>
                <div className="stat-label">Total de Pedidos</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C47C2B' }}>R$</div>
              <div className="stat-info">
                <div className="stat-value">
                  {Number(resultado.resumo.totalArrecadado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="stat-label">Total Arrecadado</div>
              </div>
            </div>
            {Object.entries(resultado.resumo.porStatus).map(([status, qtd]) => {
              const cfg = STATUS_CONFIG[status] || { label: status, bg: '#eee', cor: '#555' };
              return (
                <div className="stat-card" key={status} style={{ borderLeftColor: cfg.cor }}>
                  <div className="stat-icon" style={{ background: cfg.bg }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: cfg.cor, display: 'inline-block' }} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ fontSize: '1.3rem', color: cfg.cor }}>{qtd}</div>
                    <div className="stat-label">{cfg.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabela */}
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: '0.95rem' }}>
              Pedidos de {new Date(de + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(ate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </h3>
            {resultado.dados.length === 0 ? (
              <div className="empty-state"><p>Nenhum pedido encontrado neste período</p></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.dados.map(p => (
                      <tr key={p.id}>
                        <td><strong>#{p.id}</strong></td>
                        <td>{p.cliente_nome || 'N/A'}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td style={{ fontWeight: 600, color: '#C47C2B' }}>
                          R$ {Number(p.total).toFixed(2)}
                        </td>
                        <td>{new Date(p.criado_em).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}