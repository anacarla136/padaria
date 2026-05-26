// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';

import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Categorias from './pages/Categorias';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>🥖 Padaria do Zé</h1>
        <p>Sistema de Gestão</p>
      </div>
      <nav>
        <NavLink to="/" end>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/produtos">
          <span className="nav-icon">🍞</span> Produtos
        </NavLink>
        <NavLink to="/categorias">
          <span className="nav-icon">🏷️</span> Categorias
        </NavLink>
        <NavLink to="/clientes">
          <span className="nav-icon">👥</span> Clientes
        </NavLink>
        <NavLink to="/pedidos">
          <span className="nav-icon">🛒</span> Pedidos
        </NavLink>
      </nav>
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
