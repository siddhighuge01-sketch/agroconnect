import { useState, useEffect } from 'react';
import axios from 'axios';
import AddProduct from './AddProduct';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    axios.get('http://localhost:5000/api/ping')
      .then(res => setMessage(res.data.message))
      .catch(err => setMessage('Could not reach backend'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AgroConnect</h1>
      <p>{message}</p>
      <AddProduct />
    </div>
  );
}

export default App;