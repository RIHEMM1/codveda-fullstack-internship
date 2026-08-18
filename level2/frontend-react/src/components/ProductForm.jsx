import { useState } from 'react';

function ProductForm({ onAdd }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    onAdd({ name, price });
    setName('');
    setPrice('');
  };

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <h2>Nouvel article</h2>
      <div className="field">
        <label htmlFor="name">Article</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Clavier mécanique"
          required
        />
      </div>
      <div className="field field-price">
        <label htmlFor="price">Prix (€)</label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>
      <button type="submit">Enregistrer</button>
    </form>
  );
}

export default ProductForm;