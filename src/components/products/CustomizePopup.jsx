import { X } from 'lucide-react';

export default function CustomizePopup({
  product,
  onAccept,
  onDecline,
  onClose,
  title = 'Tùy chỉnh những dấu ấn riêng của bạn chứ?',
  description,
  acceptLabel = 'Đồng ý',
  declineLabel = 'Hủy',
  hintText = 'Nếu hủy, sản phẩm sẽ được thêm vào giỏ hàng với cấu hình mặc định',
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-muted hover:text-brand-charcoal"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-brand-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✨</span>
          </div>

          {/* Title */}
          <h3 className="font-golan text-2xl font-bold text-brand-charcoal mb-3 italic">
            {title}
          </h3>

          {/* Product name */}
          <p className="font-san text-sm text-brand-muted mb-8">
            {description || product?.name}
          </p>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onDecline}
              className="flex-1 py-3 px-6 border-2 border-brand-cream-dark text-brand-charcoal font-san font-medium rounded-xl hover:border-brand-muted transition-colors"
            >
              {declineLabel}
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-3 px-6 bg-brand-navy text-white font-san font-medium rounded-xl hover:bg-brand-deep-blue transition-colors"
            >
              {acceptLabel}
            </button>
          </div>

          {hintText && (
            <p className="font-san text-xs text-brand-muted mt-4">
              {hintText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
