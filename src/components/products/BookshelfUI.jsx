import { getProductsByShelf } from '../../data/products';
import ProductCard from './ProductCard';

const SHELF_LABELS = {
  1: 'Bookcharm Collection I',
  2: 'Bookcharm Collection II',
  3: 'Bookmark',
  4: 'Sổ Note',
};

export default function BookshelfUI({ onProductClick }) {
  return (
    <div className="space-y-12">
      {[1, 2, 3, 4].map((shelfNum) => {
        const products = getProductsByShelf(shelfNum);
        if (products.length === 0) return null;

        return (
          <div key={shelfNum}>
            {/* Shelf label */}
            <div className="flex items-center gap-4 mb-6">
              <h3 className="font-golan text-xl font-semibold text-brand-charcoal">
                {SHELF_LABELS[shelfNum]}
              </h3>
              <div className="flex-1 h-px bg-brand-cream-dark" />
              <span className="font-san text-xs text-brand-muted uppercase tracking-wider">
                Ngăn {shelfNum}
              </span>
            </div>

            {/* Horizontal scrollable shelf */}
            <div className="bookshelf-scroll flex gap-6 pb-4">
              {products.map((product) => (
                <div key={product.id} className="shelf-item w-64 flex-shrink-0">
                  <ProductCard
                    product={product}
                    onClick={() => onProductClick(product)}
                  />
                </div>
              ))}
            </div>

            {/* Shelf visual (wooden shelf line) */}
            <div className="h-3 bg-gradient-to-b from-amber-800/30 to-amber-900/10 rounded-b-lg mt-2" />
          </div>
        );
      })}
    </div>
  );
}
