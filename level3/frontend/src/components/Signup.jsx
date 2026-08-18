import { useState } from 'react';
import api from '../api';

function Signup({ switchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', { email, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card">
        <span className="eyebrow">Codveda · Accès</span>
        <h1>Compte créé !</h1>
        <p className="subtitle">Vous pouvez maintenant vous connecter.</p>
        <button onClick={switchToLogin}>Aller à la connexion</button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <span className="eyebrow">Codveda · Accès</span>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe (min. 6 caractères)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer le compte'}
        </button>
      </form>
      <p className="switch-text">
        Déjà un compte ?{' '}
        <button className="link-btn" onClick={switchToLogin}>Se connecter</button>
      </p>
    </div>
  );
}

export default Signup;