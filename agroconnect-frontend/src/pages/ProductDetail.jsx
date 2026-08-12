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

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError('Product not found'));
  }, [id]);

  const applyCoupon = async () => {
    setCouponMsg('');
    try {
      const token = localStorage.getItem('token');
      const orderValue = product.price * quantity;
      const res = await axios.post('http://localhost:5000/api/coupons/validate',
        { code: couponCode, orderValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscount(res.data.discount);
      setCouponMsg(`Coupon applied — Rs.${res.data.discount} off`);
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err.response?.data?.error || 'Invalid coupon');
    }
  };

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
        { productId: id, quantity: Number(quantity), couponCode: couponCode || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Order placed! Total: Rs.${res.data.totalPrice}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (error && !product) return <p className="error-stamp" style={{ padding: '2rem' }}>⚠ {error}</p>;
  if (!product) return <p style={{ padding: '2rem' }}>Loading...</p>;

  const orderValue = product.price * quantity;

  return (
    <div className="detail-card">
      <div style={{
        width: '220px', height: '160px', background: 'var(--paper)',
        border: '1.5px dashed var(--soil)', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--soil)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.8rem',
        overflow: 'hidden'
      }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : 'No image yet'}
      </div>

      <div style={{ flex: 1, minWidth: '250px' }}>
        <span className="stamp">{timeAgo(product.listedDate)}</span>
        {product.isFeatured && <span className="stamp" style={{ marginLeft: '0.5rem' }}>KISAN PRO</span>}
        <h1 style={{ color: 'var(--forest)', margin: '0.75rem 0 0.25rem' }}>{product.name}</h1>
        <p style={{ color: 'var(--soil)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem' }}>
          {product.category}
        </p>

        <p style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--chili)', margin: '0.75rem 0' }}>
          Rs.{product.price} / {product.unit}
        </p>
        <p style={{ color: 'var(--soil)' }}>{product.quantity} {product.unit} available</p>

        <p style={{ color: 'var(--forest)', marginTop: '1rem' }}>
          {product.farmerId?.name || 'Unknown farmer'} . {product.farmerId?.location || '—'}
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
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label className="form-label">Promo code</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input className="form-input" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g. FIRST10" />
            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={applyCoupon}>Apply</button>
          </div>
          {couponMsg && (
            <p style={{ fontSize: '0.85rem', color: discount > 0 ? 'var(--leaf)' : 'var(--chili)', marginTop: '0.3rem' }}>
              {couponMsg}
            </p>
          )}
          <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
            Total: Rs.{(orderValue - discount).toFixed(2)}
            {discount > 0 && (
              <span style={{ color: 'var(--soil)', fontWeight: 400, marginLeft: '0.5rem', textDecoration: 'line-through' }}>
                Rs.{orderValue}
              </span>
            )}
          </p>
        </div>

        <button className="btn-primary" onClick={handleOrder} disabled={placing} style={{ marginTop: '0.75rem' }}>
          {placing ? 'Placing order...' : 'Place order'}
        </button>

        {error && <p className="error-stamp">⚠ {error}</p>}
        {success && <p className="success-stamp">✓ {success}</p>}
      </div>
    </div>
  );
}

export default ProductDetail;
