import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function ProductCard({ product, onAddClick, isSelected = false, selectedQuantity = 0 }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`product-card bg-white rounded-2xl overflow-hidden group border-2 transition-all h-full ${
        isSelected ? 'border-brand-amber shadow-lg shadow-brand-amber/20 -translate-y-1' : 'border-transparent'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-brand-cream-dark overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="text-4xl mb-2">
              {product.category === 'CHARM'
                ? '📚'
                : product.category === 'BOOKMARK'
                ? '🔖'
                : '📓'}
            </div>
            <p className="font-san text-xs text-brand-muted">{product.name}</p>
          </div>
        )}

        {/* Best seller badge */}
        {product.bestSeller && (
          <div className="absolute top-3 left-3 bg-brand-amber text-white font-san text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Best Seller
          </div>
        )}

        {selectedQuantity > 0 && (
          <div className="absolute top-3 right-3 min-w-7 h-7 px-2 bg-brand-navy text-white font-san text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {selectedQuantity}
          </div>
        )}

        <button
          type="button"
          onClick={onAddClick}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/95 border border-brand-cream-dark text-brand-charcoal flex items-center justify-center shadow-sm hover:bg-brand-amber hover:text-white hover:border-brand-amber transition-colors"
          aria-label={`Thêm ${product.name}`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 md:p-4">
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
