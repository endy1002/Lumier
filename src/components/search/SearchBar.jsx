import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { PRODUCTS } from '../../data/products';

export default function SearchBar({ onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matched = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ).slice(0, 5);

    setResults(matched);
  }, [query]);

  const handleSelect = (product) => {
    onNavigate(`/san-pham?highlight=${product.id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // If product found, navigate to products page
      if (results.length > 0) {
        onNavigate(`/san-pham?search=${encodeURIComponent(query)}`);
      } else {
        // Product not found → redirect to customize with message
        onNavigate(
          `/san-pham?customize=true&search=${encodeURIComponent(query)}`
        );
      }
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 cursor-default"
        onClick={() => {
          if (!query.trim()) {
            onClose();
          }
        }}
        aria-hidden="true"
      />
      <div className="relative z-50 border-t border-brand-cream-dark py-4 animate-fade-in-up bg-brand-cream/95 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-brand-cream-dark/50">
            <SearchIcon size={18} className="text-brand-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sách, bookcharm..."
              className="flex-1 font-san text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 !shadow-none placeholder:text-brand-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-brand-muted hover:text-brand-charcoal"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-brand-muted hover:text-brand-charcoal ml-2 text-sm font-san"
            >
              Đóng
            </button>
          </div>

          {/* Search results dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-50">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-brand-cream transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-brand-cream-dark rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-san text-sm font-medium text-brand-charcoal">
                      {product.name}
                    </p>
                    <p className="font-san text-xs text-brand-muted">
                      {product.category} •{' '}
                      {product.basePrice.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {query.trim().length >= 2 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg p-4 z-50">
              <p className="font-san text-sm text-brand-muted text-center">
                Không tìm thấy sản phẩm.{' '}
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/san-pham?customize=true&search=${encodeURIComponent(
                        query
                      )}`
                    )
                  }
                  className="text-brand-amber font-medium hover:underline"
                >
                  Cùng customize nhé!
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
