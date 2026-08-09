import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateString) {
  const days = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Picked today';
  if (days === 1) return 'Picked 1 day ago';
  return `Picked ${days} days ago`;
}

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError('Product not found'));
  }, [id]);

  const handleOrder = async () => {
    setError('');
    setSuccess('');

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      setError('Only buyers can place orders');
      return;
    }

    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/orders',
        { productId: id, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Order placed! Total: ₹${res.data.totalPrice}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (error && !product) return <p className="error-stamp" style={{ padding: '2rem' }}>⚠ {error}</p>;
  if (!product) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div className="detail-card">
      <div style={{
        width: '220px',
        height: '160px',
        background: 'var(--paper)',
        border: '1.5px dashed var(--soil)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--soil)',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '0.8rem'
      }}>
        No image yet
      </div>

      <div style={{ flex: 1, minWidth: '250px' }}>
        <span className="stamp">{timeAgo(product.listedDate)}</span>
        <h1 style={{ color: 'var(--forest)', margin: '0.75rem 0 0.25rem' }}>{product.name}</h1>
        <p style={{ color: 'var(--soil)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem' }}>
          {product.category}
        </p>

        <p style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--chili)', margin: '0.75rem 0' }}>
          ₹{product.price} / {product.unit}
        </p>
        <p style={{ color: 'var(--soil)' }}>{product.quantity} {product.unit} available</p>

        <p style={{ color: 'var(--forest)', marginTop: '1rem' }}>
          👤 {product.farmerId?.name || 'Unknown farmer'} · {product.farmerId?.location || '—'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <label className="form-label" style={{ margin: 0 }}>Qty</label>
          <input
            className="qty-input"
            type="number"
            min="1"
            max={product.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <button className="btn-primary" onClick={handleOrder} disabled={placing}>
            {placing ? 'Placing order...' : 'Place order'}
          </button>
        </div>

        {error && <p className="error-stamp">⚠ {error}</p>}
        {success && <p className="success-stamp">✓ {success}</p>}
      </div>
    </div>
  );
}

export default ProductDetail;