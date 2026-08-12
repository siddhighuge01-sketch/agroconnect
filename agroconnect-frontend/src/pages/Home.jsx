import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products/featured')
      .then(res => setFeatured(res.data))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4rem 2rem',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ maxWidth: '480px' }}>
          <span className="stamp">FARM . DIRECT . FRESH</span>
          <h1 style={{ fontSize: '3rem', margin: '1rem 0', color: 'var(--forest)' }}>
            From the field to your cart, nothing in between.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '1.5rem' }}>
            AgroConnect connects farmers directly with buyers — no middlemen, fair prices, fresher produce.
          </p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Browse Produce
          </button>
        </div>

        <div style={{
          background: 'white',
          border: '2px solid var(--forest)',
          borderRadius: '12px',
          padding: '1.5rem',
          transform: 'rotate(1deg)',
          boxShadow: '6px 6px 0 var(--turmeric)'
        }}>
          <span className="stamp" style={{ transform: 'rotate(-3deg)' }}>PICKED TODAY</span>
          <h3 style={{ marginTop: '0.75rem', color: 'var(--forest)' }}>Tomatoes</h3>
          <p style={{ color: 'var(--soil)', margin: '0.25rem 0' }}>Rs.40/kg . Pune</p>
        </div>
      </section>

      {featured.length > 0 && (
        <section style={{ padding: '0 2rem 3rem' }}>
          <span className="stamp">KISAN PRO</span>
          <h2 style={{ color: 'var(--forest)', margin: '0.5rem 0 1rem' }}>Featured Harvest of the Day</h2>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {featured.map(p => (
              <Link to={`/products/${p._id}`} key={p._id} className="product-card" style={{ minWidth: '220px', flexShrink: 0 }}>
                <span className="stamp">FEATURED</span>
                <h3 style={{ color: 'var(--forest)', marginTop: '0.5rem' }}>{p.name}</h3>
                <p style={{ color: 'var(--soil)' }}>Rs.{p.price}/{p.unit}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
