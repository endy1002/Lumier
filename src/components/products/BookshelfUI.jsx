import { useMemo } from 'react';
import { getProductsByShelf } from '../../data/products';
import ProductCard from './ProductCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const SHELF_GROUPS = [
  { id: 'charm', title: 'Bookcharm', shelves: [1, 2] },
  { id: 'bookmark', title: 'Bookmark', shelves: [3] },
  { id: 'note', title: 'Sổ Notes', shelves: [4] },
];

export default function BookshelfUI({ onProductClick, selectedProductId, selectedQuantities = {}, searchTerm = '' }) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const groupsWithProducts = useMemo(
    () =>
      SHELF_GROUPS.map((group) => ({
        ...group,
        products: group.shelves
          .flatMap((shelfNum) => getProductsByShelf(shelfNum))
          .filter((product) => {
            if (!normalizedSearch) return true;
            return (
              product.name.toLowerCase().includes(normalizedSearch) ||
              product.description.toLowerCase().includes(normalizedSearch)
            );
          }),
      })).filter((group) => group.products.length > 0),
    [normalizedSearch]
  );

  return (
    <div className="space-y-12">
      {groupsWithProducts.map((group) => {
        return (
          <ShelfGroupSection
            key={group.id}
            group={group}
            selectedProductId={selectedProductId}
            selectedQuantities={selectedQuantities}
            onProductClick={onProductClick}
          />
        );
      })}

      {groupsWithProducts.length === 0 && (
        <div className="rounded-2xl border border-brand-cream-dark bg-white p-8 text-center">
          <p className="font-san text-sm text-brand-muted">
            Không tìm thấy sản phẩm phù hợp. Thử từ khóa khác nhé.
          </p>
        </div>
      )}
    </div>
  );
}

function ShelfGroupSection({ group, selectedProductId, selectedQuantities, onProductClick }) {
  const [sectionRef, visible] = useScrollReveal({ repeat: true, threshold: 0.2, rootMargin: '-8% 0px -12% 0px' });

  return (
    <section
      ref={sectionRef}
      className={`rounded-2xl border border-brand-cream-dark/70 bg-white/70 px-4 py-5 md:px-6 md:py-6 transition-all duration-500 ${
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-40 translate-y-10 scale-[0.985]'
      }`}
    >
      <div className="flex items-center gap-4 mb-5">
        <h3 className="font-golan text-xl font-semibold text-brand-charcoal">
          {group.title}
        </h3>
        <div className="flex-1 h-px bg-brand-cream-dark" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {group.products.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              isSelected={selectedProductId === product.id || (selectedQuantities[product.id] || 0) > 0}
              selectedQuantity={selectedQuantities[product.id] || 0}
              onAddClick={() => onProductClick(product)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
