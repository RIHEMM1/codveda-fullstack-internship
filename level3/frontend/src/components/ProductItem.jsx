function ProductItem({ product, index, onDelete, isAdmin }) {
  return (
    <li className="ticket">
      <div className="ticket-left">
        <span className="ticket-no">N° {String(index + 1).padStart(3, '0')}</span>
        <span className="ticket-name">{product.name}</span>
      </div>
      <div className="ticket-right">
        <span className="ticket-price">{Number(product.price).toFixed(2)} €</span>
        {isAdmin && (
          <button
            className="ticket-delete"
            onClick={() => onDelete(product.id)}
            aria-label={`Supprimer ${product.name}`}
          >
            ✕
          </button>
        )}
      </div>
    </li>
  );
}

export default ProductItem;