import { useState, useEffect } from 'react';
import api from './api';
import Login from './components/Login';
import Signup from './components/Signup';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const handleAdd = async (product) => {
    await api.post('/products', product);
    loadProducts();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // --- Non connecté : afficher login/signup ---
  if (!user) {
    return (
      <main className="sheet auth-wrapper">
        {authView === 'login' ? (
          <Login onLogin={setUser} switchToSignup={() => setAuthView('signup')} />
        ) : (
          <Signup switchToLogin={() => setAuthView('login')} />
        )}
      </main>
    );
  }

  // --- Connecté : afficher l'application ---
  return (
    <main className="sheet">
      <header className="sheet-head">
        <div className="head-row">
          <div>
            <span className="eyebrow">Codveda · Full-Stack Internship</span>
            <h1>Registre de Produits</h1>
           <p className="subtitle">
  Connecté en tant que <strong>{user.email}</strong>{' '}
  <span className="role-badge">{user.role}</span>
</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <div className="workspace">
        <ProductForm onAdd={handleAdd} />

        <section className="ledger">
          <div className="ledger-head">
            <span>Articles enregistrés</span>
            <span id="count-badge">{products.length}</span>
          </div>
          <ProductList
            products={products}
            onDelete={handleDelete}
            loading={loading}
            isAdmin={user.role === 'admin'}
          />
        </section>
      </div>
    </main>
  );
}

export default App;