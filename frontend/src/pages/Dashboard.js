// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { produtosService, pedidosService, clientesService } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ produtos: 0, pedidos: 0, clientes: 0, pendentes: 0 });
  const [pedidosRecentes, setPedidosRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resProdutos, resPedidos, resClientes] = await Promise.all([
          produtosService.listar({ ativo: true }),
          pedidosService.listar(),
          clientesService.listar(),
        ]);

        const pedidos = resPedidos.data.dados || [];
        const pendentes = pedidos.filter(p => p.status === 'pendente' || p.status === 'em_preparo').length;

        setStats({
          produtos: resProdutos.data.total || 0,
          pedidos: pedidos.length,
          clientes: resClientes.data.dados?.length || 0,
          pendentes,
        });

        setPedidosRecentes(pedidos.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const statusBadge = (status) => (
    <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
  );

  if (loading) return <div className="loading">⏳ Carregando dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Bem-vindo ao sistema da Padaria do Zé 🥖</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🍞</div>
          <div className="stat-value">{stats.produtos}</div>
          <div className="stat-label">Produtos Ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-value">{stats.pedidos}</div>
          <div className="stat-label">Total de Pedidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.clientes}</div>
          <div className="stat-label">Clientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendentes}</div>
          <div className="stat-label">Pedidos em Aberto</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Pedidos Recentes</h3>
        {pedidosRecentes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Nenhum pedido ainda</p>
          </div>
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
                {pedidosRecentes.map(p => (
                  <tr key={p.id}>
                    <td><strong>#{p.id}</strong></td>
                    <td>{p.cliente_nome || 'N/A'}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td>R$ {Number(p.total).toFixed(2)}</td>
                    <td>{new Date(p.criado_em).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 20, background: '#fff8f0', borderColor: '#f0d0a0' }}>
        <h3 style={{ marginBottom: 8 }}>💡 Sobre a Arquitetura deste Sistema</h3>
        <p style={{ color: '#7a6055', fontSize: '0.9rem', lineHeight: 1.8 }}>
          Este sistema usa <strong>Microsserviços</strong>: o backend está dividido em dois serviços independentes.
          O <strong>serviço de Produtos</strong> (porta 3001) gerencia produtos e categorias.
          O <strong>serviço de Pedidos</strong> (porta 3002) gerencia clientes e pedidos.
          Cada serviço tem sua própria responsabilidade e pode ser escalado de forma independente.
        </p>
      </div>
    </div>
  );
}
