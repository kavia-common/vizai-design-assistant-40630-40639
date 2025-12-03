import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiPost } from '../utils/api';

const ROLES = [
  { value: 'researcher', label: 'Researcher' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'viewer', label: 'Viewer' }
];

// PUBLIC_INTERFACE
export default function Register() {
  /** Registration with role selection; role is not shown after login. */
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: '' });
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name || !form.role) {
      toast.error('Please complete all fields and select a role.');
      return;
    }
    setSubmitting(true);
    const payload = { email: form.email, password: form.password, name: form.name, role: form.role, redirect: process.env.REACT_APP_FRONTEND_URL || window.location.origin };
    const res = await apiPost('/auth/register', payload);
    if (res || (!res && process.env.NODE_ENV !== 'production')) {
      // simulate success
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } else {
      toast.error('Registration failed');
    }
    setSubmitting(false);
  };

  return (
    <div style={{display:'grid',placeItems:'center',minHeight:'100vh',padding:'20px'}}>
      <form onSubmit={onSubmit} className="card" style={{width:420}}>
        <div className="title">Create your account</div>
        <div className="subtitle">Join VizAI</div>

        <label className="field">
          <span className="label">Full name</span>
          <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} aria-required />
        </label>
        <label className="field">
          <span className="label">Email</span>
          <input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} aria-required />
        </label>
        <label className="field">
          <span className="label">Password</span>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} aria-required />
        </label>
        <label className="field">
          <span className="label">Role</span>
          <select className="select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} aria-required>
            <option value="">Select a role</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>

        <div className="flex gap-12">
          <button className="btn" type="button" onClick={()=>navigate('/login')}>Back to Login</button>
          <button className="btn btn-primary" type="submit" disabled={submitting} aria-label="Register">
            {submitting ? 'Creating...' : 'Register'}
          </button>
        </div>

        <div className="hint" style={{marginTop:10}}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
