import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'farmer', location: '', phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <span className="stamp">JOIN THE MARKET</span>
      <h2 style={{ color: 'var(--forest)', marginTop: '0.75rem' }}>Register</h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Full name</label>
        <input className="form-input" name="name" value={formData.name} onChange={handleChange} required />

        <label className="form-label">Email</label>
        <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label className="form-label">Password</label>
        <input className="form-input" type="password" name="password" value={formData.password} onChange={handleChange} required />

        <label className="form-label">I am a</label>
        <select className="form-input" name="role" value={formData.role} onChange={handleChange}>
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>

        <label className="form-label">Location</label>
        <input className="form-input" name="location" value={formData.location} onChange={handleChange} required />

        <label className="form-label">Phone (optional)</label>
        <input className="form-input" name="phone" value={formData.phone} onChange={handleChange} />

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '1.5rem', width: '100%' }}
          disabled={loading}
        >
          {loading && <span className="spinner"></span>}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {error && <p className="error-stamp">⚠ {error}</p>}

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--leaf)' }}>Login</Link>
      </p>
    </div>
  );
}

export default Register;