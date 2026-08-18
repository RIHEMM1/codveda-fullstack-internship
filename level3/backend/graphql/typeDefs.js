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
    updateProduct(id: ID!, name: String, price: Float): Product
    deleteProduct(id: ID!): Boolean
  }
`;

module.exports = typeDefs;