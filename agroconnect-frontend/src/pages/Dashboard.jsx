import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('listings');

  if (!user) {
    return <p style={{ padding: '2rem' }}>Please log in to view your dashboard.</p>;
  }

  if (user.role === 'admin') {
    navigate('/admin');
    return null;
  }

  return (
    <div>
      <div style={{ padding: '2rem 2rem 0' }}>
        <span className="stamp">{user.role === 'farmer' ? 'FARMER DASHBOARD' : 'BUYER DASHBOARD'}</span>
        <h1 style={{ color: 'var(--forest)', marginTop: '0.5rem' }}>Hi, {user.name.split(' ')[0]}</h1>
      </div>

      <div className="tab-bar" style={{ marginTop: '1.5rem' }}>
        {user.role === 'farmer' && (
          <>
            <button className={`tab-btn ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
              My Listings
            </button>
            <button className={`tab-btn ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
              Add Product
            </button>
          </>
        )}
        <button className={`tab-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          {user.role === 'farmer' ? 'Orders Received' : 'My Orders'}
        </button>
      </div>

      <div style={{ padding: '0 2rem 2rem' }}>
        {tab === 'listings' && user.role === 'farmer' && <MyListings />}
        {tab === 'add' && user.role === 'farmer' && <AddProduct onAdded={() => setTab('listings')} />}
        {tab === 'orders' && <MyOrders role={user.role} />}
      </div>
    </div>
  );
}

function MyListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/products/farmer/mine', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your listings...</p>;

  if (products.length === 0) return (
    <div className="empty-state">
      <span className="stamp">NOTHING LISTED YET</span>
      <p>Add your first product to see it here.</p>
    </div>
  );

  return (
    <div>
      {products.map(p => (
        <div className="listing-row" key={p._id}>
          <div>
            <strong style={{ color: 'var(--forest)' }}>{p.name}</strong>
            <span style={{ color: 'var(--soil)', marginLeft: '0.75rem', fontSize: '0.9rem' }}>
              ₹{p.price}/{p.unit} · {p.quantity} available
            </span>
          </div>
          <span className="stamp">{p.category}</span>
        </div>
      ))}
    </div>
  );
}

function AddProduct({ onAdded }) {
  const [formData, setFormData] = useState({
    name: '', category: 'Vegetables', price: '', unit: 'kg', quantity: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/products', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`"${res.data.name}" added to your listings`);
      setFormData({ name: '', category: 'Vegetables', price: '', unit: 'kg', quantity: '' });
      setTimeout(() => onAdded(), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add product');
    }
  };

  return (
    <div className="card" style={{ margin: 0, maxWidth: '420px' }}>
      <h3 style={{ color: 'var(--forest)' }}>Add Product</h3>
      <form onSubmit={handleSubmit}>
        <label className="form-label">Name</label>
        <input className="form-input" name="name" value={formData.name} onChange={handleChange} required />

        <label className="form-label">Category</label>
        <select className="form-input" name="category" value={formData.category} onChange={handleChange}>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Grains">Grains</option>
          <option value="Dairy">Dairy</option>
        </select>

        <label className="form-label">Price</label>
        <input className="form-input" type="number" name="price" value={formData.price} onChange={handleChange} required />

        <label className="form-label">Unit</label>
        <select className="form-input" name="unit" value={formData.unit} onChange={handleChange}>
          <option value="kg">kg</option>
          <option value="dozen">dozen</option>
          <option value="litre">litre</option>
        </select>

        <label className="form-label">Quantity available</label>
        <input className="form-input" type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

        <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
          Add Product
        </button>
      </form>
      {message && <p className="success-stamp">✓ {message}</p>}
      {error && <p className="error-stamp">⚠ {error}</p>}
    </div>
  );
}

function MyOrders({ role }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // refresh the list to show the updated status
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update status');
    }
  };

  if (loading) return <p>Loading orders...</p>;

  if (orders.length === 0) return (
    <div className="empty-state">
      <span className="stamp">NO ORDERS YET</span>
      <p>{role === 'farmer' ? 'Orders on your listings will show up here.' : 'Orders you place will show up here.'}</p>
    </div>
  );

  return (
    <div>
      {orders.map(o => (
        <div className="listing-row" key={o._id}>
          <div>
            <strong style={{ color: 'var(--forest)' }}>{o.productId?.name || 'Product'}</strong>
            <span style={{ color: 'var(--soil)', marginLeft: '0.75rem', fontSize: '0.9rem' }}>
              Qty {o.quantity} · ₹{o.totalPrice}
              {role === 'farmer' && ` · Commission ₹${o.commission}`}
            </span>
          </div>

          {role === 'farmer' ? (
            <select
              className="status-select"
              value={o.status}
              onChange={(e) => handleStatusChange(o._id, e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="out_for_delivery">out for delivery</option>
              <option value="delivered">delivered</option>
            </select>
          ) : (
            <span className={`status-badge status-${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default Dashboard;