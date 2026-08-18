import ProductItem from './ProductItem';

function ProductList({ products, onDelete, loading, isAdmin }) {
  if (loading) return <p className="empty-state">Chargement...</p>;

  if (products.length === 0) {
    return <li className="empty-state">Aucun article enregistré pour l'instant.</li>;
  }

  return (
    <ul id="product-list">
      {products.map((p, i) => (
        <ProductItem key={p.id} product={p} index={i} onDelete={onDelete} isAdmin={isAdmin} />
      ))}
    </ul>
  );
}

export default ProductList;