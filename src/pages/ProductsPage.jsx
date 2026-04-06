import { useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import BookshelfUI from '../components/products/BookshelfUI';
import ProductRanking from '../components/products/ProductRanking';
import CustomizePopup from '../components/products/CustomizePopup';
import CustomizePanel from '../components/products/CustomizePanel';
import { useCart } from '../context/CartContext';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const { showToast } = useOutletContext();
  const { addItem } = useCart();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCustomizePopup, setShowCustomizePopup] = useState(false);
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);

  // Check if redirected from search with no results
  const shouldCustomize = searchParams.get('customize') === 'true';
  const searchQuery = searchParams.get('search') || '';

  const handleProductClick = (product) => {
    setSelectedProduct(product);

    if (product.customizable) {
      // Show customize popup for customizable products
      setShowCustomizePopup(true);
    } else {
      // Non-customizable: add directly to cart
      addItem(product);
      showToast(`${product.name} đã được thêm vào giỏ hàng!`);
    }
  };

  const handleCustomizeAccept = () => {
    setShowCustomizePopup(false);
    setShowCustomizePanel(true);
  };

  const handleCustomizeDecline = () => {
    // Add to cart without customization
    if (selectedProduct) {
      addItem(selectedProduct);
      showToast(`${selectedProduct.name} đã được thêm vào giỏ hàng!`);
    }
    setShowCustomizePopup(false);
    setSelectedProduct(null);
  };

  const handleCustomizeConfirm = (customization) => {
    if (selectedProduct) {
      addItem(selectedProduct, customization);
      showToast(`${selectedProduct.name} (đã customize) đã được thêm vào giỏ hàng!`);
    }
    setShowCustomizePanel(false);
    setSelectedProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-golan text-3xl md:text-4xl font-bold text-brand-charcoal mb-3">
          Sản phẩm
        </h1>
        <p className="font-san text-sm text-brand-muted">
          Khám phá kệ sách Lumier — nơi mỗi cuốn sách là một tác phẩm nghệ thuật
        </p>
      </div>

      {/* "Not found" message from search redirect */}
      {shouldCustomize && searchQuery && (
        <div className="bg-brand-amber/10 border border-brand-amber/30 rounded-xl px-5 py-4 mb-8">
          <p className="font-san text-sm text-brand-charcoal">
            Sản phẩm "<strong>{searchQuery}</strong>" đang tìm không có sẵn.{' '}
            <span className="text-brand-amber font-medium">
              Cùng customize nhé! ✨
            </span>
          </p>
        </div>
      )}

      {/* Main layout: Shelf + Ranking sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Bookshelf */}
        <BookshelfUI onProductClick={handleProductClick} />

        {/* Sidebar: Bestseller Ranking */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ProductRanking />
          </div>
        </aside>
      </div>

      {/* === Pricing Table === */}
      <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="font-golan text-2xl font-bold text-brand-charcoal mb-6">
          Bảng Giá
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full font-san text-sm">
            <thead>
              <tr className="border-b-2 border-brand-cream-dark">
                <th className="text-left py-3 px-4 font-semibold text-brand-charcoal uppercase tracking-wider text-xs">
                  Phân loại
                </th>
                <th className="text-right py-3 px-4 font-semibold text-brand-charcoal uppercase tracking-wider text-xs">
                  Giá
                </th>
                <th className="text-left py-3 px-4 font-semibold text-brand-charcoal uppercase tracking-wider text-xs">
                  Chú thích
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-cream">
                <td className="py-3 px-4">Sách có sẵn</td>
                <td className="py-3 px-4 text-right font-semibold text-brand-amber">
                  150.000đ
                </td>
                <td className="py-3 px-4 text-brand-muted">Bookcharm với bìa có sẵn</td>
              </tr>
              <tr className="border-b border-brand-cream">
                <td className="py-3 px-4">Sách tự tay lựa</td>
                <td className="py-3 px-4 text-right font-semibold text-brand-amber">
                  200.000đ
                </td>
                <td className="py-3 px-4 text-brand-muted">
                  Upload hoặc chọn bìa tùy ý (+50.000đ)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">Customize khác</td>
                <td className="py-3 px-4 text-right font-semibold text-brand-amber">
                  50.000đ/lần
                </td>
                <td className="py-3 px-4 text-brand-muted">
                  Khắc tên, dây chain, chọn màu gáy...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* === Modals === */}
      {showCustomizePopup && selectedProduct && (
        <CustomizePopup
          product={selectedProduct}
          onAccept={handleCustomizeAccept}
          onDecline={handleCustomizeDecline}
          onClose={() => {
            setShowCustomizePopup(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showCustomizePanel && selectedProduct && (
        <CustomizePanel
          product={selectedProduct}
          onConfirm={handleCustomizeConfirm}
          onCancel={() => {
            setShowCustomizePanel(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
