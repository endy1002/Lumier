import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { t, formatCurrency } = useLanguage();
  const { items, itemCount, subtotal, total, discount, promo, updateQuantity, removeItem } =
    useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="cart-drawer-overlay" onClick={onClose} />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[95] flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-cream-dark">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-navy" />
            <h2 className="font-golan text-lg font-bold text-brand-charcoal">
              {t('Giỏ hàng', 'Cart')}
            </h2>
            <span className="bg-brand-amber text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-cream rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-brand-cream-dark mb-4" />
              <p className="font-san text-sm text-brand-muted mb-4">
                {t('Giỏ hàng trống', 'Your cart is empty')}
              </p>
              <button
                onClick={onClose}
                className="font-san text-sm text-brand-amber hover:underline"
              >
                {t('Tiếp tục mua sắm', 'Continue shopping')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartKey}
                  className="flex gap-4 bg-brand-cream/50 rounded-xl p-3"
                >
                  {/* Thumb */}
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-brand-cream-dark flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML =
                          '<div class="flex items-center justify-center h-full text-2xl">📚</div>';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-san text-sm font-medium text-brand-charcoal truncate">
                      {item.name}
                    </h4>
                    {item.customization && (
                      <p className="font-san text-[10px] text-brand-blue mt-0.5">
                        ✨ {t('Đã customize', 'Customized')}
                      </p>
                    )}
                    <p className="font-san text-sm font-bold text-brand-amber mt-1">
                      {formatCurrency(item.unitPrice)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border hover:border-brand-amber transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-san text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity + 1)
                        }
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border hover:border-brand-amber transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Totals & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-brand-cream-dark px-6 py-4 space-y-3">
            <div className="flex justify-between font-san text-sm">
              <span className="text-brand-muted">{t('Tạm tính', 'Subtotal')}:</span>
              <span className="text-brand-charcoal">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {promo && (
              <div className="flex justify-between font-san text-sm">
                <span className="text-green-600">{t('Giảm giá', 'Discount')} ({promo.code}):</span>
                <span className="text-green-600">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-brand-cream-dark">
              <span className="font-san text-sm font-semibold text-brand-charcoal">
                {t('Tổng cộng', 'Total')}:
              </span>
              <span className="font-golan text-xl font-bold text-brand-amber">
                {formatCurrency(total)}
              </span>
            </div>

            <Link
              to="/thanh-toan"
              onClick={onClose}
              className="block w-full text-center py-3.5 bg-brand-navy text-white font-san font-medium rounded-xl hover:bg-brand-deep-blue transition-colors"
            >
              {t('Thanh toán', 'Checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
