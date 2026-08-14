import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import './App.css';

const API_URL = 'http://localhost:5000/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = async (product) => {
    await axios.post(API_URL, product);
    loadProducts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    loadProducts();
  };

  return (
    <main className="sheet">
      <header className="sheet-head">
        <span className="eyebrow">Codveda · Full-Stack Internship</span>
        <h1>Registre de Produits</h1>
        <p className="subtitle">Ajoutez, consultez et retirez des articles de l'inventaire.</p>
      </header>

      <div className="workspace">
        <ProductForm onAdd={handleAdd} />

        <section className="ledger">
          <div className="ledger-head">
            <span>Articles enregistrés</span>
            <span id="count-badge">{products.length}</span>
          </div>
          <ProductList products={products} onDelete={handleDelete} loading={loading} />
        </section>
      </div>
    </main>
  );
}

export default App;