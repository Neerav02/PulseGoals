import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role: 'EMPLOYEE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Register the user
      await api.register(form);
      // 2. Log them in directly after successful registration
      await login(form.email, form.password);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
      setError(err.message);
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    const creds = {
      admin: { email: 'admin@atomquest.com', password: 'Admin@123' },
      manager: { email: 'manager@atomquest.com', password: 'Manager@123' },
      employee: { email: 'employee@atomquest.com', password: 'Employee@123' },
    };
    setLoading(true);
    try {
      const user = await login(creds[role].email, creds[role].password);
      const path = user.role === 'ADMIN' ? '/admin' : user.role === 'MANAGER' ? '/manager' : '/employee';
      navigate(path);
      toast.success(`Logged in as ${role}!`);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', padding: '2rem' }}>
      <div className="card page-enter" style={{ maxWidth: 480, width: '100%', padding: '3rem', background: 'white' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--gradient-progress)', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(255,107,71,0.3)' }}>
            <HeartPulse size={28} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Create your account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Join PulseGoals and start managing performance</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label className="input-label">Full Name</label>
            <input className="input" type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />
          </div>

          <div>
            <label className="input-label">Work Email</label>
            <input className="input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input className="input" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" minLength={6} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Department</label>
              <input className="input" type="text" required value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="e.g. Sales" />
            </div>
            <div>
              <label className="input-label">System Role</label>
              <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.8rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent-1)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
        </div>

        {/* Quick Login for Hackathon Presentation */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Hackathon Demo Access
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => quickLogin('employee')} className="btn btn-outline btn-sm" style={{ flex: 1 }} disabled={loading}>
              👤 Employee
            </button>
            <button type="button" onClick={() => quickLogin('manager')} className="btn btn-outline btn-sm" style={{ flex: 1 }} disabled={loading}>
              👔 Manager
            </button>
            <button type="button" onClick={() => quickLogin('admin')} className="btn btn-outline btn-sm" style={{ flex: 1 }} disabled={loading}>
              🛡️ Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
