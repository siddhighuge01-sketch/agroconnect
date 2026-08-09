import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';
import Admin from './pages/Admin';
// ...
<Route path="/admin" element={<Admin />} />

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'var(--forest)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h2 style={{ color: 'var(--turmeric)', fontSize: '1.5rem', margin: 0 }}>
          🌾 AgroConnect
        </h2>
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/products" style={{ color: 'var(--paper)', textDecoration: 'none', fontWeight: 500 }}>
          Products
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: 'var(--paper)', textDecoration: 'none', fontWeight: 500 }}>
              Dashboard
            </Link>
            <span style={{ color: 'var(--turmeric)', fontSize: '0.9rem' }}>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              style={{ background: 'var(--chili)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--paper)', textDecoration: 'none', fontWeight: 500 }}>
              Login
            </Link>
            <Link to="/register" style={{ color: 'var(--paper)', textDecoration: 'none', fontWeight: 500 }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/admin" element={<Admin />} />
         </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;