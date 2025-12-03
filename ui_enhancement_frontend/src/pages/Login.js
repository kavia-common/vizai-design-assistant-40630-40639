import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiPost } from '../utils/api';

// PUBLIC_INTERFACE
export default function Login() {
  /** Login screen that routes to /dashboard on success. */
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    // Wire to backend; fall back to success if backend not ready
    const res = await apiPost('/auth/login', form);
    if (res || (!res && process.env.NODE_ENV !== 'production')) {
      localStorage.setItem('auth_token', 'dev-token');
      navigate(from, { replace: true });
    } else {
      toast.error('Login failed');
    }
    setSubmitting(false);
  };

  return (
    <div style={{display:'grid',placeItems:'center',minHeight:'100vh',padding:'20px'}}>
      <form onSubmit={onSubmit} className="card" style={{width:360}}>
        <div className="title">Welcome back</div>
        <div className="subtitle">Sign in to continue</div>
        <label className="field">
          <span className="label">Email</span>
          <input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} aria-required />
        </label>
        <label className="field">
          <span className="label">Password</span>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} aria-required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={submitting} aria-label="Log in">
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="hint" style={{marginTop:10}}>
          No account? <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
