import { useState, useMemo } from 'react';
import { X, Upload, Search, Check } from 'lucide-react';
import { CHARM_TYPES, SPINE_COLORS, PRICING } from '../../config/constants';

export default function CustomizePanel({ product, onConfirm, onCancel }) {
  const [charmType, setCharmType] = useState(CHARM_TYPES[0].id);
  const [engravedText, setEngravedText] = useState('');
  const [chainType, setChainType] = useState(null); // null = no chain
  const [spineColor, setSpineColor] = useState(SPINE_COLORS[0].id);
  const [customCover, setCustomCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverSearchQuery, setCoverSearchQuery] = useState('');

  // Calculate total price
  const totalPrice = useMemo(() => {
    let price = product.basePrice;
    if (customCover) price += PRICING.CUSTOM_COVER;
    if (engravedText.trim()) price += PRICING.CUSTOMIZE_ADDON;
    if (chainType) price += PRICING.CUSTOMIZE_ADDON;
    return price;
  }, [product.basePrice, customCover, engravedText, chainType]);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomCover(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      charmType,
      engravedText: engravedText.trim() || null,
      chainType,
      spineColor,
      customCover: coverPreview,
    });
  };

  const wordCount = engravedText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[80] flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-brand-cream-dark px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-golan text-xl font-bold text-brand-charcoal">
              Customize
            </h2>
            <p className="font-san text-xs text-brand-muted">{product.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-brand-cream rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* === Preview === */}
          <div className="bg-brand-cream rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Custom cover"
                  className="w-32 h-44 object-cover rounded-lg shadow-lg mx-auto mb-3"
                />
              ) : (
                <div className="w-32 h-44 bg-brand-cream-dark rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-4xl">📚</span>
                </div>
              )}
              <p className="font-san text-xs text-brand-muted">
                Thành phẩm sau khi customize
              </p>
            </div>
          </div>

          {/* === 1. Chọn loại charm === */}
          <div>
            <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
              🪙 Chọn loại charm
            </h3>
            <div className="flex gap-3">
              {CHARM_TYPES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setCharmType(ct.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                    charmType === ct.id
                      ? 'border-brand-amber bg-brand-amber/5'
                      : 'border-brand-cream-dark hover:border-brand-muted'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2"
                    style={{
                      backgroundColor: ct.color,
                      borderColor: charmType === ct.id ? '#F2A900' : ct.color,
                    }}
                  />
                  <span className="font-san text-sm">{ct.label}</span>
                  {charmType === ct.id && (
                    <Check size={14} className="text-brand-amber" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* === 2. Khắc tên / lời chúc === */}
          <div>
            <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
              ✍️ Khắc tên / lời chúc lên gáy sách{' '}
              <span className="text-brand-muted font-normal">(tối đa 10 từ)</span>
            </h3>
            <input
              type="text"
              value={engravedText}
              onChange={(e) => setEngravedText(e.target.value)}
              placeholder="Nhập tên hoặc lời chúc..."
              className="w-full px-4 py-3 border-2 border-brand-cream-dark rounded-xl font-san text-sm focus:border-brand-amber"
              maxLength={100}
            />
            <div className="flex justify-between mt-2">
              <p className="font-san text-xs text-brand-muted">
                {engravedText.trim() ? `+${PRICING.CUSTOMIZE_ADDON.toLocaleString('vi-VN')}đ` : 'Miễn phí nếu để trống'}
              </p>
              <p
                className={`font-san text-xs ${
                  wordCount > 10 ? 'text-red-500' : 'text-brand-muted'
                }`}
              >
                {wordCount}/10 từ
              </p>
            </div>
          </div>

          {/* === 3. Chọn thêm chain === */}
          <div>
            <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
              ⛓️ Chọn thêm chain để móc cùng
            </h3>
            <p className="font-san text-xs text-brand-muted mb-3">
              Biến charm của bạn trở nên lấp lánh hơn
            </p>
            <div className="flex gap-3">
              {[
                { id: null, label: 'Không thêm', price: 0 },
                { id: 'basic', label: 'Chain cơ bản', price: PRICING.CUSTOMIZE_ADDON },
                { id: 'premium', label: 'Chain Premium', price: PRICING.CUSTOMIZE_ADDON },
              ].map((chain) => (
                <button
                  key={chain.id || 'none'}
                  onClick={() => setChainType(chain.id)}
                  className={`flex-1 py-3 px-3 rounded-xl border-2 text-center transition-all ${
                    chainType === chain.id
                      ? 'border-brand-amber bg-brand-amber/5'
                      : 'border-brand-cream-dark hover:border-brand-muted'
                  }`}
                >
                  <p className="font-san text-sm font-medium">{chain.label}</p>
                  <p className="font-san text-xs text-brand-muted mt-1">
                    {chain.price > 0
                      ? `+${chain.price.toLocaleString('vi-VN')}đ`
                      : 'Miễn phí'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* === 4. Chọn màu gáy sách === */}
          <div>
            <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
              🎨 Chọn màu gáy sách
            </h3>
            <div className="flex gap-3 flex-wrap">
              {SPINE_COLORS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSpineColor(sc.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    spineColor === sc.id
                      ? 'border-brand-amber'
                      : 'border-brand-cream-dark hover:border-brand-muted'
                  }`}
                  title={sc.label}
                >
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: sc.hex }}
                  />
                  <span className="font-san text-xs">{sc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* === 5. Tự tay làm bìa === */}
          <div>
            <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
              🖼️ Tự tay làm bìa{' '}
              <span className="text-brand-muted font-normal">
                (+{PRICING.CUSTOM_COVER.toLocaleString('vi-VN')}đ)
              </span>
            </h3>

            {/* Search for existing cover */}
            <div className="flex items-center gap-2 bg-brand-cream rounded-xl px-4 py-3 mb-3">
              <Search size={16} className="text-brand-muted" />
              <input
                type="text"
                value={coverSearchQuery}
                onChange={(e) => setCoverSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bìa sách..."
                className="flex-1 bg-transparent font-san text-sm outline-none"
              />
            </div>

            {/* Upload */}
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-cream-dark rounded-xl p-6 cursor-pointer hover:border-brand-amber transition-colors">
              <Upload size={24} className="text-brand-muted" />
              <p className="font-san text-sm text-brand-muted">
                Upload hình ảnh bìa (độ phân giải cao)
              </p>
              <p className="font-san text-xs text-brand-muted">
                PNG, JPG tối đa 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer: Price & Actions */}
        <div className="sticky bottom-0 bg-white border-t border-brand-cream-dark px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-san text-sm text-brand-muted">Tổng cộng:</span>
            <span className="font-golan text-2xl font-bold text-brand-amber">
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border-2 border-brand-cream-dark text-brand-charcoal font-san font-medium rounded-xl hover:border-brand-muted transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={wordCount > 10}
              className="flex-1 py-3 bg-brand-navy text-white font-san font-medium rounded-xl hover:bg-brand-deep-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
