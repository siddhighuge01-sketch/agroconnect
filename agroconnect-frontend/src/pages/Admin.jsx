import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.error || 'Could not load stats'));
  }, []);

  if (!user || user.role !== 'admin') {
    return <p style={{ padding: '2rem' }}>Admin access only.</p>;
  }

  if (error) return <p className="error-stamp" style={{ padding: '2rem' }}>⚠ {error}</p>;
  if (!stats) return <p style={{ padding: '2rem' }}>Loading stats...</p>;

  return (
    <div>
      <div style={{ padding: '2rem 2rem 0' }}>
        <span className="stamp">PLATFORM OVERVIEW</span>
        <h1 style={{ color: 'var(--forest)', marginTop: '0.5rem' }}>Admin Dashboard</h1>
      </div>

      <div className="stat-grid" style={{ marginTop: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-number">Rs.{stats.totalCommission.toFixed(0)}</div>
          <div className="stat-label">Commission Earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Rs.{stats.totalRevenue.toFixed(0)}</div>
          <div className="stat-label">Total Order Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalOrders}</div>
          <div className="stat-label">Orders Placed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">Products Listed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalFarmers}</div>
          <div className="stat-label">Farmers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalBuyers}</div>
          <div className="stat-label">Buyers</div>
        </div>
      </div>

      <FeaturedManager />
      <AbandonedScan />
    </div>
  );
}

function FeaturedManager() {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem('token');

  const load = () => axios.get('http://localhost:5000/api/products').then(res => setProducts(res.data));
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await axios.patch(`http://localhost:5000/api/products/${id}/feature`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    load();
  };

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <h3 style={{ color: 'var(--forest)' }}>Manage Featured Listings</h3>
      {products.map(p => (
        <div className="listing-row" key={p._id}>
          <span>{p.name} — Rs.{p.price}/{p.unit}</span>
          <button
            className="btn-primary"
            style={{ padding: '5px 12px', background: p.isFeatured ? 'var(--leaf)' : 'var(--soil)' }}
            onClick={() => toggle(p._id)}
          >
            {p.isFeatured ? 'Featured ✓' : 'Feature it'}
          </button>
        </div>
      ))}
    </div>
  );
}

function AbandonedScan() {
  const [result, setResult] = useState(null);

  const runScan = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:5000/api/admin/abandoned-scan', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setResult(res.data);
  };

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <h3 style={{ color: 'var(--forest)' }}>Abandoned Cart Scan</h3>
      <button className="btn-primary" onClick={runScan}>Run abandoned order scan</button>
      {result && <p style={{ marginTop: '1rem', color: 'var(--soil)' }}>{result.triggered} reminder(s) triggered.</p>}
    </div>
  );
}

export default Admin;
