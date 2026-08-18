const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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

// Serveur HTTP + Socket.io par-dessus Express
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Rendre "io" accessible dans les routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Client connecté :', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté :', socket.id);
  });
});

sequelize.sync()
  .then(() => console.log('✅ Tables synchronisées avec MySQL'))
  .catch(err => console.error('❌ Erreur de synchronisation :', err));

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// CREATE — émet un événement temps réel après création
app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    io.emit('product:created', product); // 🔴 notifie tous les clients connectés
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    await product.update(req.body);
    io.emit('product:updated', product); // 🔴 notifie la mise à jour
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — émet un événement temps réel après suppression
app.delete('/api/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    const deletedId = product.id;
    await product.destroy();
    io.emit('product:deleted', { id: deletedId }); // 🔴 notifie la suppression
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
// ⚠️ IMPORTANT : on écoute maintenant via "server" (et non "app") pour que Socket.io fonctionne
server.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));