import api from './api';

const CATEGORY_FALLBACK_IMAGE = {
  CHARM: '/showing/cover/A1.jpg',
  BOOKMARK: '/showing/bookmark/D1.jpg',
  NOTEBOOK: '/showing/notes/B1.jpg',
};

function normalizeProduct(raw) {
  const category = String(raw?.category || '').toUpperCase();

  return {
    id: raw?.id,
    name: raw?.name || 'Sản phẩm',
    category,
    basePrice: Number(raw?.basePrice || 0),
    image: raw?.imageUrl || CATEGORY_FALLBACK_IMAGE[category] || CATEGORY_FALLBACK_IMAGE.CHARM,
    description: '',
    customizable: category === 'CHARM',
    isAvailable: Boolean(raw?.isAvailable),
  };
}

export async function fetchProducts() {
  const { data } = await api.get('/products');
  return (data || []).map(normalizeProduct);
}

export async function fetchProductById(productId) {
  const products = await fetchProducts();
  return products.find((item) => String(item.id) === String(productId)) || null;
}
