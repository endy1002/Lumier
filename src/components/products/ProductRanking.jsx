import { useMemo } from 'react';

export default function ProductRanking({ products = [] }) {
  const topProducts = useMemo(
    () =>
      products
        .filter((product) => product.category === 'CHARM')
        .slice(0, 5),
    [products]
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-golan text-lg font-bold text-brand-charcoal mb-6">
        🏆 Bìa sách bán chạy
      </h3>
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center gap-4 group cursor-pointer"
          >
            {/* Rank number */}
            <span
              className={`font-golan text-2xl font-bold w-8 text-center ${
                index === 0
                  ? 'text-brand-amber'
                  : index === 1
                  ? 'text-gray-400'
                  : index === 2
                  ? 'text-amber-700'
                  : 'text-gray-300'
              }`}
            >
              {index + 1}
            </span>

            {/* Product thumb */}
            <div className="w-12 h-14 rounded-lg overflow-hidden bg-brand-cream-dark flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full text-lg">📚</div>`;
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-san text-sm font-medium text-brand-charcoal truncate group-hover:text-brand-amber transition-colors">
                {product.name}
              </p>
              <p className="font-san text-xs text-brand-muted">
                {product.basePrice.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        ))}

        {topProducts.length === 0 && (
          <p className="font-san text-xs text-brand-muted">Chưa có dữ liệu sản phẩm.</p>
        )}
      </div>
    </div>
  );
}
