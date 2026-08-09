import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <span className="stamp">WELCOME BACK</span>
      <h2 style={{ color: 'var(--forest)', marginTop: '0.75rem' }}>Login</h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Email</label>
        <input
          className="form-input"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label className="form-label">Password</label>
        <input
          className="form-input"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '1.5rem', width: '100%' }}
          disabled={loading}
        >
          {loading && <span className="spinner"></span>}
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <p className="error-stamp">⚠ {error}</p>}

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        New here? <Link to="/register" style={{ color: 'var(--leaf)' }}>Create an account</Link>
      </p>
    </div>
  );
}

export default Login;