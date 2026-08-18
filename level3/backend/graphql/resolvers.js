const Product = require('../models/Product');

const resolvers = {
  Query: {
    products: async () => {
      return await Product.findAll();
    },
    product: async (_, { id }) => {
      return await Product.findByPk(id);
    },
  },
  Mutation: {
    addProduct: async (_, { name, price }, context) => {
      const product = await Product.create({ name, price });
      context.io.emit('product:created', product); // synchro temps réel aussi via GraphQL
      return product;
    },
    updateProduct: async (_, { id, name, price }, context) => {
      const product = await Product.findByPk(id);
      if (!product) throw new Error('Produit non trouvé');
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (price !== undefined) updates.price = price;
      await product.update(updates);
      context.io.emit('product:updated', product);
      return product;
    },
    deleteProduct: async (_, { id }, context) => {
      const product = await Product.findByPk(id);
      if (!product) throw new Error('Produit non trouvé');
      await product.destroy();
      context.io.emit('product:deleted', { id });
      return true;
    },
  },
};

module.exports = resolvers;