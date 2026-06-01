// src/App.js — Ctrl+Pão
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdShoppingBag,
  MdLabel,
  MdPeople,
  MdReceiptLong,
} from 'react-icons/md';
import './index.css';

import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Categorias from './pages/Categorias';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Funcionarios from './pages/Funcionarios';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
         <div className="sidebar-logo-icon">
          <MdShoppingBag size={28} color="#F5ECD7" />
        </div>
        <h1>Ctrl+Pão</h1>
        <p>Do forno ao caixa, tudo sob controle.</p>
      </div>
      <nav>
        <NavLink to="/" end>
          <MdDashboard size={19} /> Dashboard
        </NavLink>
        <NavLink to="/produtos">
          <MdShoppingBag size={19} /> Produtos
        </NavLink>
        <NavLink to="/categorias">
          <MdLabel size={19} /> Categorias
        </NavLink>
        <NavLink to="/clientes">
          <MdPeople size={19} /> Clientes
        </NavLink>
        <NavLink to="/pedidos">
          <MdReceiptLong size={19} /> Pedidos
        </NavLink>
        <NavLink to="/funcionarios">
          <MdPeople size={19} /> Funcionários
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Ctrl+Pão © 2026
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
