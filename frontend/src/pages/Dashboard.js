// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { produtosService, pedidosService, clientesService } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  MdShoppingBag, MdShoppingCart, MdPeople, MdAccessTime, MdWarning,
} from 'react-icons/md';

const STATUS_CONFIG = {
  pendente:   { label: 'Pendente',   cor: '#856404', bg: '#fef3cd', barra: '#D4A843' },
  em_preparo: { label: 'Em Preparo', cor: '#7A4A00', bg: '#fff0d6', barra: '#C47C2B' },
  pronto:     { label: 'Pronto',     cor: '#0f5132', bg: '#d1e7dd', barra: '#2d7a4f' },
  entregue:   { label: 'Entregue',   cor: '#41464b', bg: '#e2e3e5', barra: '#6B3F24' },
  cancelado:  { label: 'Cancelado',  cor: '#842029', bg: '#f8d7da', barra: '#c0392b' },
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

function TooltipCustom({ active, payload }) {
  if (active && payload?.length) {
    const { name, value } = payload[0].payload;
    return (
      <div style={{
        background: '#2C1A0E', color: '#F5ECD7', padding: '7px 13px',
        borderRadius: 8, fontSize: '0.8rem', fontFamily: 'Poppins, sans-serif',
      }}>
        <strong>{name}</strong>: {value} pedido{value !== 1 ? 's' : ''}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [stats, setStats]                     = useState({ produtos: 0, pedidos: 0, clientes: 0, pendentes: 0 });
  const [pedidosRecentes, setPedidosRecentes] = useState([]);
  const [graficoDados, setGraficoDados]       = useState([]);
  const [estoqueBaixo, setEstoqueBaixo]       = useState([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resProdutos, resPedidos, resClientes] = await Promise.all([
          produtosService.listar({ ativo: true }),
          pedidosService.listar(),
          clientesService.listar(),
        ]);

        const pedidos  = resPedidos.data.dados  || [];
        const produtos = resProdutos.data.dados || [];
        const pendentes = pedidos.filter(p =>
          p.status === 'pendente' || p.status === 'em_preparo'
        ).length;

        setStats({
          produtos: resProdutos.data.total || 0,
          pedidos:  pedidos.length,
          clientes: resClientes.data.dados?.length || 0,
          pendentes,
        });

        setPedidosRecentes(pedidos.slice(0, 5));

        const contagem = {};
        pedidos.forEach(p => { contagem[p.status] = (contagem[p.status] || 0) + 1; });
        setGraficoDados(
          Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
            name: cfg.label, value: contagem[key] || 0, cor: cfg.barra,
          }))
        );

        setEstoqueBaixo(
          produtos
            .filter(p => p.estoque_quantidade != null && p.estoque_quantidade <= 5)
            .sort((a, b) => a.estoque_quantidade - b.estoque_quantidade)
            .slice(0, 6)
        );
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  if (loading) return <div className="loading">Carregando dashboard...</div>;

  const statCards = [
    { icon: <MdShoppingBag size={22} color="#C47C2B" />, value: stats.produtos,  label: 'Produtos Ativos'    },
    { icon: <MdShoppingCart size={22} color="#C47C2B" />, value: stats.pedidos,  label: 'Total de Pedidos'   },
    { icon: <MdPeople size={22} color="#C47C2B" />,       value: stats.clientes, label: 'Clientes'           },
    { icon: <MdAccessTime size={22} color="#C47C2B" />,   value: stats.pendentes,label: 'Pedidos em Aberto'  },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Bem-vindo ao Ctrl+Pão</h2>
          <p>Gerenciando fornadas sem entrar em colapso.</p>
        </div>
      </div>

      {/* Cards */}
      <div className="stats-grid">
        {statCards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico + Estoque Baixo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 18, fontSize: '0.95rem' }}>Pedidos por Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={graficoDados} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE0C4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7A5C3E', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7A5C3E', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipCustom />} cursor={{ fill: 'rgba(196,124,43,0.08)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {graficoDados.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
            <MdWarning size={18} color="#C47C2B" /> Estoque Baixo
          </h3>
          {estoqueBaixo.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#2d7a4f', fontSize: '0.85rem', fontWeight: 500 }}>
              ✓ Todos os produtos com estoque OK
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {estoqueBaixo.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 13px', borderRadius: 8,
                  background: p.estoque_quantidade === 0 ? '#f8d7da' : '#fff0d6',
                  border: `1px solid ${p.estoque_quantidade === 0 ? '#f1aeb5' : '#f0d0a0'}`,
                }}>
                  <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2C1A0E' }}>{p.nome}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: p.estoque_quantidade === 0 ? '#842029' : '#7A4A00' }}>
                    {p.estoque_quantidade === 0 ? 'Sem estoque' : `${p.estoque_quantidade} un.`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pedidos Recentes */}
      <div className="card">
        <h3 style={{ marginBottom: 14, fontSize: '0.95rem' }}>Pedidos Recentes</h3>
        {pedidosRecentes.length === 0 ? (
          <div className="empty-state"><p>Nenhum pedido ainda</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Cliente</th><th>Status</th><th>Total</th><th>Data</th></tr>
              </thead>
              <tbody>
                {pedidosRecentes.map(p => (
                  <tr key={p.id}>
                    <td><strong>#{p.id}</strong></td>
                    <td>{p.cliente_nome || 'N/A'}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>R$ {Number(p.total).toFixed(2)}</td>
                    <td>{new Date(p.criado_em).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}