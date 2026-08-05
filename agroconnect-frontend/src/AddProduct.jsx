import { useState } from 'react';
import axios from 'axios';

function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    farmerId: '64f1a2b3c4d5e6f7a8b9c0d1'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/products', formData);
      setMessage(`Product created: ${res.data.name}`);
    } catch (err) {
      setMessage('Error creating product');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', maxWidth: '400px' }}>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Product name"
          value={formData.name}
          onChange={handleChange}
          required
        /><br /><br />

        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Grains">Grains</option>
          <option value="Dairy">Dairy</option>
        </select><br /><br />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        /><br /><br />

        <select name="unit" value={formData.unit} onChange={handleChange}>
          <option value="kg">kg</option>
          <option value="dozen">dozen</option>
          <option value="litre">litre</option>
        </select><br /><br />

        <input
          name="quantity"
          type="number"
          placeholder="Quantity available"
          value={formData.quantity}
          onChange={handleChange}
          required
        /><br /><br />

        <button type="submit">Add Product</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddProduct;