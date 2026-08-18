import { useState, useEffect } from 'react';
import api from './api';
import socket from './socket';
import Login from './components/Login';
import Signup from './components/Signup';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import ToastContainer from './components/Toast';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authView, setAuthView] = useState('login');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

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

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!user) return;

    function onCreated(product) {
      setProducts((prev) => {
        if (prev.some(p => p.id === product.id)) return prev;
        return [...prev, product];
      });
      pushToast('created', `"${product.name}" ajouté en direct`);
    }

    function onUpdated(product) {
      setProducts((prev) => prev.map(p => p.id === product.id ? product : p));
      pushToast('updated', `"${product.name}" mis à jour en direct`);
    }

    function onDeleted({ id }) {
      setProducts((prev) => prev.filter(p => p.id !== id));
      pushToast('deleted', `Un article a été supprimé en direct`);
    }

    socket.on('product:created', onCreated);
    socket.on('product:updated', onUpdated);
    socket.on('product:deleted', onDeleted);

    return () => {
      socket.off('product:created', onCreated);
      socket.off('product:updated', onUpdated);
      socket.off('product:deleted', onDeleted);
    };
  }, [user]);

  const handleAdd = async (product) => {
    await api.post('/products', product);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

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

  return (
    <main className="sheet">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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