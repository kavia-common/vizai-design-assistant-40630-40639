import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Reports from './pages/Reports';
import { FilterProvider } from './context/FilterContext';

// Simple auth persistence (localStorage). In a real app, use secure cookies/JWT with proper handling.
const useAuth = () => {
  const token = localStorage.getItem('auth_token');
  return Boolean(token);
};

function RequireAuth({ children }) {
  const authed = useAuth();
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Get API base using environment variables. Prefer REACT_APP_API_BASE then REACT_APP_BACKEND_URL. */
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';
  return base?.replace(/\/+$/, '');
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <FilterProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer position="bottom-center" />
      </FilterProvider>
    </BrowserRouter>
  );
}
