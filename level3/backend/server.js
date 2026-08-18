const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sequelize = require('./db');
const Product = require('./models/Product');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const { authMiddleware, requireAdmin } = require('./middleware/auth');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Client connecté :', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté :', socket.id);
  });
});

// --- Routes REST ---
app.use('/api/auth', authRoutes);

app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    io.emit('product:created', product);
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
    io.emit('product:updated', product);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    const deletedId = product.id;
    await product.destroy();
    io.emit('product:deleted', { id: deletedId });
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Démarrage : GraphQL puis serveur HTTP (dans cet ordre précis) ---
async function startServer() {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        io,
        user: req.headers.authorization || null,
      }),
    })
  );

  await sequelize.sync();
  console.log('✅ Tables synchronisées avec MySQL');

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`✅ GraphQL prêt sur http://localhost:${PORT}/graphql`);
  });
}

startServer();