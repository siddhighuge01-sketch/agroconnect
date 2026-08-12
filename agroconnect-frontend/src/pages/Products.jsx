import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy'];

function timeAgo(dateString) {
  const days = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Picked today';
  if (days === 1) return 'Picked 1 day ago';
  return `Picked ${days} days ago`;
}

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('none');

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setError('Could not load products'))
      .finally(() => setLoading(false));
  }, []);

  let filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);
  filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (sortOrder === 'low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortOrder === 'high') filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div>
      <div style={{ padding: '2rem 2rem 0' }}>
        <span className="stamp">THE MARKET</span>
        <h1 style={{ color: 'var(--forest)', marginTop: '0.5rem' }}>Browse Produce</h1>
      </div>

      <div className="filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '1rem 2rem 0', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ maxWidth: '220px' }}
          placeholder="Search produce..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-input" style={{ maxWidth: '160px' }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="none">Sort by</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      {loading && <p style={{ padding: '2rem' }}>Loading produce...</p>}
      {error && <p className="error-stamp" style={{ padding: '0 2rem' }}>⚠ {error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <span className="stamp">EMPTY CRATE</span>
          <p>No produce listed in this category yet.</p>
        </div>
      )}

      <div className="product-grid">
        {filtered.map(product => (
          <Link to={`/products/${product._id}`} key={product._id} className="product-card">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
              />
            )}
            <span className="stamp">{timeAgo(product.listedDate)}</span>
            <h3 style={{ color: 'var(--forest)', marginTop: '0.75rem' }}>{product.name}</h3>
            <p style={{ color: 'var(--soil)', margin: '0.25rem 0' }}>
              Rs.{product.price}/{product.unit} . {product.quantity} available
              {product.quantity > 0 && product.quantity <= 5 && (
                <span style={{ color: 'var(--chili)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>Only {product.quantity} left!</span>
              )}
            </p>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: 'var(--leaf)' }}>
              {product.category}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Products;
