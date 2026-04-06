import { ShoppingBag, Eye } from 'lucide-react';

export default function ProductCard({ product, onClick }) {
  return (
    <div
      className="product-card bg-white rounded-2xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-brand-cream-dark overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="flex flex-col items-center justify-center h-full p-4 text-center">
                <div class="text-4xl mb-2">${
                  product.category === 'CHARM'
                    ? '📚'
                    : product.category === 'BOOKMARK'
                    ? '🔖'
                    : '📓'
                }</div>
                <p class="font-san text-xs text-brand-muted">${product.name}</p>
              </div>
            `;
          }}
        />

        {/* Best seller badge */}
        {product.bestSeller && (
          <div className="absolute top-3 left-3 bg-brand-amber text-white font-san text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Best Seller
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
            <button className="bg-white/90 p-3 rounded-full hover:bg-brand-amber hover:text-white transition-colors">
              <Eye size={16} />
            </button>
            <button className="bg-white/90 p-3 rounded-full hover:bg-brand-amber hover:text-white transition-colors">
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-golan text-sm font-semibold text-brand-charcoal mb-1 truncate">
          {product.name}
        </h4>
        <p className="font-san text-sm font-bold text-brand-amber">
          {product.basePrice.toLocaleString('vi-VN')}đ
        </p>
        {product.customizable && (
          <p className="font-san text-[10px] text-brand-blue mt-1 uppercase tracking-wider">
            ✨ Có thể customize
          </p>
        )}
      </div>
    </div>
  );
}
