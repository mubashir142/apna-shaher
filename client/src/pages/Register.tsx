import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate(role === 'seller' ? '/seller' : '/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">ApnaShehar<span style={{ color: '#f97316' }}>.</span></div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-sub">Join thousands of local shoppers &amp; sellers</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-control"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Muhammad Ali"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">I want to</label>
            <div className="flex gap-sm" style={{ marginTop: '0.25rem' }}>
              {[
                { value: 'customer', label: '🛍️ Shop as Customer' },
                { value: 'seller',   label: '🏪 Sell on ApnaShehar' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: `2px solid ${role === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    background: role === opt.value ? 'var(--primary-light)' : 'var(--surface)',
                    textAlign: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={role === opt.value}
                    onChange={() => setRole(opt.value)}
                    style={{ display: 'none' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
