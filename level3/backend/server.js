const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const Product = require('./models/Product');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const { authMiddleware, requireAdmin } = require('./middleware/auth');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

sequelize.sync()
  .then(() => console.log('✅ Tables synchronisées avec MySQL'))
  .catch(err => console.error('❌ Erreur de synchronisation :', err));

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// CREATE — utilisateur connecté requis
app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ (tous) — utilisateur connecté requis
app.get('/api/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (un seul)
app.get('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — utilisateur connecté requis
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — réservé aux admins uniquement
app.delete('/api/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    await product.destroy();
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));