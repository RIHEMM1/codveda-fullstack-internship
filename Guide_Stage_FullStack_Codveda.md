# Guide Étape par Étape — Stage Full-Stack Development (Codveda)

> Rappel : vous devez compléter **2 tâches sur 3 par niveau**. Ce guide couvre les 3 tâches de chaque niveau pour que vous puissiez choisir celles qui vous conviennent le mieux.
> Stack recommandée : **Node.js + Express + MongoDB (Mongoose) + React**, mais toutes les alternatives (MySQL/PostgreSQL, Vue, Angular) fonctionnent aussi.

---

## Avant de commencer : organisation

Créez un dossier principal sur votre ordinateur :

```bash
mkdir codveda-internship
cd codveda-internship
mkdir level1 level2 level3
```

Un dépôt GitHub séparé (ou un mono-repo avec des sous-dossiers) par niveau est une bonne pratique — vous en aurez besoin pour les liens à partager sur LinkedIn.

---

## NIVEAU 1 — Basique

### Tâche 1 : Configuration de l'environnement

**Étapes :**
1. **Installer Node.js** (version LTS) depuis [nodejs.org](https://nodejs.org). Vérifiez :
   ```bash
   node -v
   npm -v
   ```
2. **Installer VS Code** depuis [code.visualstudio.com](https://code.visualstudio.com).
3. **Installer Git** depuis [git-scm.com](https://git-scm.com), puis configurez votre identité :
   ```bash
   git config --global user.name "Rihem Amiche"
   git config --global user.email "votre-email@gmail.com"
   ```
4. **Créer un compte GitHub** (si vous n'en avez pas), créer un nouveau dépôt `codveda-fullstack-internship`.
5. **Initialiser Git localement** :
   ```bash
   cd level1
   git init
   git remote add origin https://github.com/VOTRE-USER/codveda-fullstack-internship.git
   ```
6. **Installer une base de données** — le plus simple pour débuter : **MongoDB Community** (local) ou créer un cluster gratuit sur **MongoDB Atlas** (cloud, aucune installation).
7. **Commandes terminal de base à apprendre** : `cd`, `ls`/`dir`, `mkdir`, `touch`, `npm init -y`, `npm install`, `git add/commit/push`.

**Livrable** : capture d'écran des versions installées + premier commit "Initial setup" sur GitHub.

---

### Tâche 2 : API REST simple (CRUD)

**Étapes :**
1. Dans un dossier `backend/` :
   ```bash
   mkdir backend && cd backend
   npm init -y
   npm install express mongoose dotenv cors
   npm install --save-dev nodemon
   ```
2. Créer `server.js` :
   ```javascript
   const express = require('express');
   const mongoose = require('mongoose');
   require('dotenv').config();

   const app = express();
   app.use(express.json());

   mongoose.connect(process.env.MONGO_URI)
     .then(() => console.log('MongoDB connecté'))
     .catch(err => console.error(err));

   const productSchema = new mongoose.Schema({
     name: { type: String, required: true },
     price: { type: Number, required: true }
   });
   const Product = mongoose.model('Product', productSchema);

   // CREATE
   app.post('/api/products', async (req, res) => {
     try {
       const product = await Product.create(req.body);
       res.status(201).json(product);
     } catch (err) { res.status(400).json({ error: err.message }); }
   });

   // READ (all)
   app.get('/api/products', async (req, res) => {
     const products = await Product.find();
     res.json(products);
   });

   // READ (one)
   app.get('/api/products/:id', async (req, res) => {
     const product = await Product.findById(req.params.id);
     if (!product) return res.status(404).json({ error: 'Not found' });
     res.json(product);
   });

   // UPDATE
   app.put('/api/products/:id', async (req, res) => {
     const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
     res.json(product);
   });

   // DELETE
   app.delete('/api/products/:id', async (req, res) => {
     await Product.findByIdAndDelete(req.params.id);
     res.json({ message: 'Supprimé' });
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));
   ```
3. Créer un fichier `.env` avec `MONGO_URI=votre_uri_mongodb` et `PORT=5000`. **Ajoutez `.env` au `.gitignore`.**
4. Lancer avec `npx nodemon server.js`.
5. **Tester avec Postman ou Thunder Client** (extension VS Code) : faites un POST, un GET, un PUT, un DELETE.
6. Ajouter une gestion d'erreurs propre (codes HTTP corrects : 200, 201, 400, 404, 500).

**Livrable** : code sur GitHub + captures Postman montrant les 4 opérations CRUD fonctionnelles.

---

### Tâche 3 : Frontend HTML/CSS/JS

**Étapes :**
1. Créer un dossier `frontend/` avec `index.html`, `style.css`, `script.js`.
2. Structure HTML basique (liste de produits + formulaire d'ajout).
3. Dans `script.js`, récupérer les données de votre API :
   ```javascript
   const API_URL = 'http://localhost:5000/api/products';

   async function loadProducts() {
     const res = await fetch(API_URL);
     const products = await res.json();
     const list = document.getElementById('product-list');
     list.innerHTML = products.map(p => `<li>${p.name} — ${p.price}€</li>`).join('');
   }

   document.getElementById('add-form').addEventListener('submit', async (e) => {
     e.preventDefault();
     const name = document.getElementById('name').value;
     const price = document.getElementById('price').value;
     await fetch(API_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ name, price })
     });
     loadProducts();
   });

   loadProducts();
   ```
4. Ajouter du CSS (flexbox/grid, responsive avec media queries).
5. **Important** : ajoutez `app.use(cors())` côté backend pour éviter les erreurs CORS.

**Livrable** : page fonctionnelle qui affiche et ajoute des produits en temps réel.

---

## NIVEAU 2 — Intermédiaire

### Tâche 1 : Frontend avec React (recommandé)

**Étapes :**
1. Créer le projet :
   ```bash
   npm create vite@latest frontend-react -- --template react
   cd frontend-react
   npm install
   npm install axios
   ```
2. Créer un composant `ProductList.jsx` avec `useState`/`useEffect` :
   ```jsx
   import { useState, useEffect } from 'react';
   import axios from 'axios';

   function ProductList() {
     const [products, setProducts] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       axios.get('http://localhost:5000/api/products')
         .then(res => setProducts(res.data))
         .finally(() => setLoading(false));
     }, []);

     if (loading) return <p>Chargement...</p>;

     return (
       <ul>
         {products.map(p => <li key={p._id}>{p.name} — {p.price}€</li>)}
       </ul>
     );
   }

   export default ProductList;
   ```
3. Créer des composants réutilisables : `ProductCard`, `ProductForm`, `Loader`.
4. Gérer les états de chargement/erreur proprement.

**Livrable** : app React fonctionnelle avec au moins 3 composants réutilisables.

---

### Tâche 2 : Authentification (JWT + bcrypt)

**Étapes :**
1. Installer les dépendances :
   ```bash
   npm install bcryptjs jsonwebtoken
   ```
2. Modèle utilisateur :
   ```javascript
   const userSchema = new mongoose.Schema({
     email: { type: String, required: true, unique: true },
     password: { type: String, required: true },
     role: { type: String, default: 'user' }
   });
   const User = mongoose.model('User', userSchema);
   ```
3. Route signup (hash du mot de passe) :
   ```javascript
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');

   app.post('/api/auth/signup', async (req, res) => {
     const { email, password } = req.body;
     const hashedPassword = await bcrypt.hash(password, 10);
     const user = await User.create({ email, password: hashedPassword });
     res.status(201).json({ id: user._id, email: user.email });
   });
   ```
4. Route login (génération du JWT) :
   ```javascript
   app.post('/api/auth/login', async (req, res) => {
     const { email, password } = req.body;
     const user = await User.findOne({ email });
     if (!user || !(await bcrypt.compare(password, user.password))) {
       return res.status(401).json({ error: 'Identifiants invalides' });
     }
     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
     res.json({ token });
   });
   ```
5. Middleware de protection des routes :
   ```javascript
   function authMiddleware(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'Token manquant' });
     try {
       req.user = jwt.verify(token, process.env.JWT_SECRET);
       next();
     } catch {
       res.status(401).json({ error: 'Token invalide' });
     }
   }

   // Utilisation :
   app.get('/api/products', authMiddleware, async (req, res) => { /* ... */ });
   ```
6. Stocker le token côté frontend (localStorage ou cookie HTTP-only — HTTP-only est plus sécurisé).

**Livrable** : signup/login fonctionnels + au moins une route protégée testée avec et sans token.

---

### Tâche 3 : Intégration base de données avancée

**Étapes :**
1. Créer des **relations** entre modèles, ex. un `Order` lié à un `User` et des `Product` :
   ```javascript
   const orderSchema = new mongoose.Schema({
     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
     total: Number
   });
   ```
2. Utiliser `.populate()` pour récupérer les données liées :
   ```javascript
   const orders = await Order.find().populate('user').populate('products');
   ```
3. Ajouter un **index** pour optimiser les recherches fréquentes :
   ```javascript
   productSchema.index({ name: 1 });
   ```
4. Ajouter de la **validation** au niveau du schéma (min/max, regex, required).

**Livrable** : au moins 2 modèles liés avec population fonctionnelle.

---

## NIVEAU 3 — Avancé

### Tâche 1 : Application Full-Stack complète (MERN)

**Étapes :**
1. Combinez tout ce que vous avez fait : backend Express + MongoDB + auth JWT + frontend React.
2. Ajoutez le **contrôle d'accès par rôle** (ex. `admin` peut supprimer, `user` non) :
   ```javascript
   function requireAdmin(req, res, next) {
     if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
     next();
   }
   ```
3. **Déploiement** :
   - Backend : [Render](https://render.com) ou [Railway](https://railway.app) (gratuit)
   - Frontend : [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
   - Base de données : MongoDB Atlas (déjà en cloud si vous l'avez utilisé depuis le début)
4. **Optimisation** : compression des réponses (`npm install compression`), pagination des listes, lazy loading côté React.

**Livrable** : lien de l'app déployée + dépôt GitHub complet.

---

### Tâche 2 : WebSockets (Socket.io)

**Étapes :**
1. Backend :
   ```bash
   npm install socket.io
   ```
   ```javascript
   const http = require('http');
   const { Server } = require('socket.io');

   const server = http.createServer(app);
   const io = new Server(server, { cors: { origin: '*' } });

   io.on('connection', (socket) => {
     console.log('Utilisateur connecté :', socket.id);

     socket.on('sendMessage', (data) => {
       io.emit('receiveMessage', data); // broadcast à tous
     });

     socket.on('disconnect', () => console.log('Déconnecté'));
   });

   server.listen(5000, () => console.log('Serveur + WebSocket sur 5000'));
   ```
2. Frontend :
   ```bash
   npm install socket.io-client
   ```
   ```javascript
   import { io } from 'socket.io-client';
   const socket = io('http://localhost:5000');

   socket.on('receiveMessage', (data) => {
     console.log('Nouveau message :', data);
   });

   function sendMessage(text) {
     socket.emit('sendMessage', { text, time: new Date() });
   }
   ```
3. Cas d'usage simple à implémenter : chat en direct ou notification en temps réel quand un produit est ajouté.

**Livrable** : démo vidéo montrant 2 fenêtres/onglets communiquant en temps réel.

---

### Tâche 3 : API GraphQL

**Étapes :**
1. Installer Apollo Server :
   ```bash
   npm install @apollo/server graphql
   ```
2. Définir le schéma :
   ```javascript
   const typeDefs = `#graphql
     type Product {
       id: ID!
       name: String!
       price: Float!
     }
     type Query {
       products: [Product]
       product(id: ID!): Product
     }
     type Mutation {
       addProduct(name: String!, price: Float!): Product
     }
   `;
   ```
3. Définir les resolvers :
   ```javascript
   const resolvers = {
     Query: {
       products: async () => await Product.find(),
       product: async (_, { id }) => await Product.findById(id),
     },
     Mutation: {
       addProduct: async (_, { name, price }) => await Product.create({ name, price }),
     },
   };
   ```
4. Démarrer le serveur GraphQL :
   ```javascript
   const { ApolloServer } = require('@apollo/server');
   const { expressMiddleware } = require('@apollo/server/express4');

   const apolloServer = new ApolloServer({ typeDefs, resolvers });
   await apolloServer.start();
   app.use('/graphql', expressMiddleware(apolloServer));
   ```
5. Tester dans le navigateur via l'interface Apollo Sandbox (`http://localhost:5000/graphql`).

**Livrable** : capture de requêtes/mutations testées avec succès dans Apollo Sandbox.

---

## Checklist finale de soumission

- [ ] Code de chaque tâche choisie poussé sur GitHub (dépôt public ou lien partageable)
- [ ] Fichier séparé/dossier par niveau
- [ ] Vidéo de démonstration (courte, montrant le résultat fonctionnel + code)
- [ ] Post LinkedIn avec la vidéo + lien GitHub + tag @Codveda + hashtags demandés
- [ ] Formulaire de soumission Codveda rempli avant le 10/09/2026

---

**Conseil général** : avancez tâche par tâche, testez chaque étape avant de passer à la suivante (surtout le backend avant le frontend), et committez régulièrement sur Git — cela sert aussi de preuve de votre progression réelle.
