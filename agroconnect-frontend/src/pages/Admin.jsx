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
          <div className="stat-number">₹{stats.totalCommission.toFixed(0)}</div>
          <div className="stat-label">Commission Earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{stats.totalRevenue}</div>
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
    </div>
  );
}

export default Admin;