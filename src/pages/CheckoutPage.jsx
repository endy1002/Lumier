import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, QrCode, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { useUTM } from '../hooks/useUTM';
import { PAYMENT_METHODS } from '../config/constants';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discount, total, promo, applyPromo, removePromo, promoError, clearCart } = useCart();
  const { user, saveOrder } = useAuth();
  const { getUTMData } = useUTM();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '',
    name: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
  });
  const [promoCode, setPromoCode] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email không hợp lệ';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(formData.phone.replace(/\s/g, '')))
      newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build order data with UTM params
    const utmData = getUTMData();
    const orderData = {
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: item.customization || null,
      })),
      customer: {
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        address: formData.address,
        note: formData.note,
      },
      paymentMethod: formData.paymentMethod,
      subtotal,
      discount,
      total,
      promoCode: promo?.code || null,
      ...utmData,
    };

    // Save order (mock — stored in localStorage)
    const savedOrder = saveOrder(orderData);
    setPlacedOrder(savedOrder);
    setOrderPlaced(true);
    clearCart();
  };

  // === Order Success Screen ===
  if (orderPlaced && placedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="font-golan text-3xl font-bold text-brand-charcoal mb-3">
            Đặt hàng thành công!
          </h1>
          <p className="font-san text-sm text-brand-muted mb-2">
            Mã đơn hàng: <span className="font-monoht text-brand-navy font-bold">{placedOrder.id}</span>
          </p>
          <p className="font-san text-sm text-brand-muted mb-8">
            Chúng tôi sẽ liên hệ bạn qua <strong>{formData.email}</strong> để xác nhận đơn hàng.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-brand-navy text-white font-san text-sm font-medium rounded-xl hover:bg-brand-deep-blue transition-colors"
            >
              Về trang chủ
            </Link>
            <Link
              to="/tai-khoan"
              className="px-6 py-3 border-2 border-brand-cream-dark text-brand-charcoal font-san text-sm font-medium rounded-xl hover:border-brand-amber transition-colors"
            >
              Xem đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // === Empty Cart ===
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-6">🛒</div>
        <h1 className="font-golan text-2xl font-bold text-brand-charcoal mb-3">
          Giỏ hàng trống
        </h1>
        <p className="font-san text-sm text-brand-muted mb-6">
          Hãy khám phá sản phẩm của Lumier trước nhé!
        </p>
        <Link
          to="/san-pham"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-san text-sm font-medium rounded-xl"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  // === Checkout Form ===
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-san text-sm text-brand-muted hover:text-brand-charcoal mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>

      {/* Logo */}
      <div className="text-center mb-8">
        <Link to="/san-pham">
          <h1 className="font-golan text-3xl font-bold text-brand-navy">LUMIER</h1>
        </Link>
        <p className="font-san text-xs text-brand-muted mt-1 uppercase tracking-widest">
          Thanh toán
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: Customer Info */}
          <div className="space-y-6">
            {/* Contact info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-golan text-lg font-bold text-brand-charcoal mb-4">
                Thông tin liên hệ
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-san text-xs font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wider">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 border-2 rounded-xl font-san text-sm ${
                      errors.email ? 'border-red-400' : 'border-brand-cream-dark'
                    }`}
                  />
                  {errors.email && (
                    <p className="font-san text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block font-san text-xs font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wider">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912 345 678"
                    className={`w-full px-4 py-3 border-2 rounded-xl font-san text-sm ${
                      errors.phone ? 'border-red-400' : 'border-brand-cream-dark'
                    }`}
                  />
                  {errors.phone && (
                    <p className="font-san text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block font-san text-xs font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wider">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className={`w-full px-4 py-3 border-2 rounded-xl font-san text-sm ${
                      errors.name ? 'border-red-400' : 'border-brand-cream-dark'
                    }`}
                  />
                  {errors.name && (
                    <p className="font-san text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-san text-xs font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wider">
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, quận, thành phố..."
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-brand-cream-dark rounded-xl font-san text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block font-san text-xs font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wider">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ghi chú đơn hàng (không bắt buộc)..."
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-brand-cream-dark rounded-xl font-san text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-golan text-lg font-bold text-brand-charcoal mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === method.id
                        ? 'border-brand-amber bg-brand-amber/5'
                        : 'border-brand-cream-dark hover:border-brand-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleChange}
                      className="w-4 h-4 accent-brand-amber"
                    />
                    <div className="flex items-center gap-3">
                      {method.id === 'cod' ? (
                        <Truck size={20} className="text-brand-navy" />
                      ) : (
                        <QrCode size={20} className="text-brand-navy" />
                      )}
                      <span className="font-san text-sm">{method.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-golan text-lg font-bold text-brand-charcoal mb-4">
                Đơn hàng của bạn
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.cartKey} className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-brand-cream-dark rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML =
                            '<div class="flex items-center justify-center h-full text-lg">📚</div>';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-san text-sm text-brand-charcoal truncate">
                        {item.name}
                      </p>
                      <p className="font-san text-xs text-brand-muted">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="font-san text-sm font-semibold text-brand-charcoal">
                      {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Mã khuyến mãi"
                    className="flex-1 px-3 py-2.5 border-2 border-brand-cream-dark rounded-xl font-san text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => applyPromo(promoCode)}
                    className="px-4 py-2.5 bg-brand-cream-dark text-brand-charcoal font-san text-sm font-medium rounded-xl hover:bg-brand-amber hover:text-white transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
                {promoError && (
                  <p className="font-san text-xs text-red-500 mt-1">{promoError}</p>
                )}
                {promo && (
                  <div className="flex items-center justify-between mt-2 bg-green-50 px-3 py-2 rounded-lg">
                    <p className="font-san text-xs text-green-700 font-medium">
                      ✅ Mã {promo.code} — Giảm{' '}
                      {promo.type === 'percent'
                        ? `${promo.value}%`
                        : `${promo.value.toLocaleString('vi-VN')}đ`}
                    </p>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-brand-cream-dark pt-4 mb-6">
                <div className="flex justify-between font-san text-sm">
                  <span className="text-brand-muted">Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-san text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-san text-sm">
                  <span className="text-brand-muted">Vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-brand-cream-dark">
                  <span className="font-san font-semibold text-brand-charcoal">
                    Tổng cộng
                  </span>
                  <span className="font-golan text-2xl font-bold text-brand-amber">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-brand-navy text-white font-san font-semibold rounded-xl hover:bg-brand-deep-blue transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Đặt hàng
              </button>

              <p className="font-san text-[10px] text-brand-muted text-center mt-3">
                * Đây là thanh toán mô phỏng, không kết nối cổng thanh toán thật
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
