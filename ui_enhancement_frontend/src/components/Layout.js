import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatbotWidget from './chatbot/ChatbotWidget';

export default function Layout() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <header className="header" role="banner">
          <div className="brand">
            <div className="brand-badge" aria-hidden>V</div>
            <div>
              <div className="title" style={{margin:0}}>VizAI</div>
              <div className="hint">Ocean Professional</div>
            </div>
          </div>
          <nav aria-label="Primary">
            <div className="header-actions">
              <NavLink className="btn" to="/dashboard">Dashboard</NavLink>
              <NavLink className="btn" to="/timeline">Timeline</NavLink>
              <NavLink className="btn" to="/reports">Reports</NavLink>
              <button className="btn" onClick={logout} aria-label="Logout">Logout</button>
            </div>
          </nav>
        </header>
        <main className="content" role="main">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
