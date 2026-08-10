const API_URL = 'http://localhost:5000/api/products';

const form = document.getElementById('add-form');
const list = document.getElementById('product-list');
const countBadge = document.getElementById('count-badge');

async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    console.error('Erreur chargement:', err);
  }
}

function renderProducts(products) {
  countBadge.textContent = products.length;

  if (products.length === 0) {
    list.innerHTML = `<li class="empty-state">Aucun article enregistré pour l'instant.</li>`;
    return;
  }

  list.innerHTML = products.map((p, i) => `
    <li class="ticket">
      <div class="ticket-left">
        <span class="ticket-no">N° ${String(i + 1).padStart(3, '0')}</span>
        <span class="ticket-name">${p.name}</span>
      </div>
      <div class="ticket-right">
        <span class="ticket-price">${Number(p.price).toFixed(2)} €</span>
        <button class="ticket-delete" onclick="deleteProduct(${p.id})" aria-label="Supprimer ${p.name}">✕</button>
      </div>
    </li>
  `).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price })
  });

  form.reset();
  loadProducts();
});

async function deleteProduct(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadProducts();
}

loadProducts();