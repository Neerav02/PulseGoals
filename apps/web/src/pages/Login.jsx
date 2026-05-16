import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();
  
  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const path = user.role === 'ADMIN' ? '/admin' : user.role === 'MANAGER' ? '/manager' : '/employee';
      navigate(path);
      toast.success('Successfully logged in!');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-hero)',
      padding: '2rem',
    }}>
      <div className="page-enter" style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo & Tagline */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-progress)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 24px rgba(255,107,71,0.3)',
            }}>
              <HeartPulse size={28} strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              background: 'var(--gradient-progress)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              PulseGoals
            </h1>
          </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Your Goals. Your Pulse. Your Organization's Heartbeat.
            </p>
          </div>

        {/* Login Card */}
        <div className="card-static" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem', fontSize: '1.25rem' }}>
            {formattedRole ? `${formattedRole} Sign In` : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Enter your credentials to access the portal
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@atomquest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontSize: '0.95rem' }}
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--color-accent-1)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
