import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

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
          <span className="stamp">FARM · DIRECT · FRESH</span>
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
          <p style={{ color: 'var(--soil)', margin: '0.25rem 0' }}>₹40/kg · Pune</p>
        </div>
      </section>
    </div>
  );
}

export default Home;