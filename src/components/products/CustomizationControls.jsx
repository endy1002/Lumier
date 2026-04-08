import { Upload, Check } from 'lucide-react';
import { CHARM_TYPES, SPINE_COLORS, PRICING } from '../../config/constants';

export default function CustomizationControls({
  product,
  charmType, setCharmType,
  engravedText, setEngravedText,
  spineColor, setSpineColor,
  handleCoverUpload,
  totalPrice,
  onCancel,
  onConfirm,
  onEngravingFocusChange,
}) {
  const wordCount = engravedText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full right-panel-scroll overflow-y-auto bg-white border-l border-brand-cream-dark">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-brand-cream-dark px-6 py-5 z-10">
        <h2 className="font-golan text-2xl font-bold text-brand-charcoal">
          Tùy chỉnh tác phẩm
        </h2>
        <p className="font-san text-sm text-brand-muted mt-1">{product?.name || 'Sản phẩm'}</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        
        {/* === 5. Tự tay làm bìa (Moved to top as it is the most primary feature) === */}
        <div>
          <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
            🖼️ Tự tay làm bìa{' '}
            <span className="text-brand-muted font-normal">
              (+{PRICING.CUSTOM_COVER.toLocaleString('vi-VN')}đ)
            </span>
          </h3>

          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-cream-dark rounded-xl p-6 cursor-pointer hover:border-brand-amber hover:bg-brand-amber/5 transition-colors">
            <Upload size={24} className="text-brand-muted" />
            <p className="font-san text-sm text-brand-muted text-center">
              Upload hình ảnh bìa của riêng bạn
            </p>
            <p className="font-san text-xs text-brand-muted">
              Yêu cầu ảnh tỷ lệ 4:5
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* === 1. Chọn loại charm === */}
        <div>
          <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
            🪙 Chọn loại charm kim loại
          </h3>
          <div className="flex gap-3">
            {CHARM_TYPES.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setCharmType(ct.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-xl border-2 transition-all ${
                  charmType === ct.id
                    ? 'border-brand-amber bg-brand-amber/5 shadow-sm'
                    : 'border-brand-cream-dark hover:border-brand-muted'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                  style={{
                    backgroundColor: ct.color,
                  }}
                />
                <span className="font-san text-sm font-medium flex items-center gap-1">
                  {ct.label}
                  {charmType === ct.id && (
                    <Check size={14} className="text-brand-amber" />
                  )}
                </span>
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                  spineColor === sc.id
                    ? 'border-brand-amber bg-brand-amber/5'
                    : 'border-brand-cream-dark hover:border-brand-muted'
                }`}
                title={sc.label}
              >
                <div
                  className="w-5 h-5 rounded-full border shadow-sm"
                  style={{ backgroundColor: sc.hex }}
                />
                <span className="font-san text-sm">{sc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* === 2. Khắc tên / lời chúc === */}
        <div>
          <h3 className="font-san text-sm font-semibold text-brand-charcoal mb-3">
            ✍️ Khắc chữ lên gáy sách{' '}
            <span className="text-brand-muted font-normal">(tối đa 10 từ)</span>
          </h3>
          <input
            type="text"
            value={engravedText}
            onChange={(e) => setEngravedText(e.target.value)}
            onFocus={() => onEngravingFocusChange?.(true)}
            onBlur={() => onEngravingFocusChange?.(false)}
            placeholder="Nhập chữ cần khắc (VD: LUMIER, ENDY...)"
            className={`w-full px-4 py-3 border-2 rounded-xl font-san text-sm transition-colors ${
              wordCount > 10 ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-brand-cream-dark focus:border-brand-amber'
            }`}
            maxLength={100}
          />
          <div className="flex justify-between mt-2">
            <p className="font-san text-xs text-brand-muted">
              {engravedText.trim() ? `+${PRICING.CUSTOMIZE_ADDON.toLocaleString('vi-VN')}đ` : 'Miễn phí nếu để trống'}
            </p>
            <p
              className={`font-san text-xs font-medium ${
                wordCount > 10 ? 'text-red-500' : 'text-brand-muted'
              }`}
            >
              {wordCount}/10 từ
            </p>
          </div>
        </div>

      </div>

      {/* Footer: Price & Actions */}
      <div className="sticky bottom-0 bg-white border-t border-brand-cream-dark px-6 py-5 z-10 w-full shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <span className="font-san text-sm text-brand-charcoal font-medium">Tổng ước tính:</span>
          <span className="font-golan text-2xl font-bold text-brand-amber">
            {totalPrice.toLocaleString('vi-VN')}đ
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 border-2 border-brand-cream-dark text-brand-charcoal font-san font-medium rounded-xl hover:border-brand-muted transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={wordCount > 10}
            className="flex-1 py-3.5 bg-brand-navy text-white font-san font-medium rounded-xl hover:bg-brand-deep-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            Hoàn tất tùy chỉnh
          </button>
        </div>
      </div>
    </div>
  );
}
