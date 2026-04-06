import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function SpecsSection() {
  const [ref, isVisible] = useScrollReveal();

  return (
    <section className="py-20 bg-brand-cream relative overflow-hidden">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-reveal ${
          isVisible ? 'visible' : ''
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Product image / Specifications visual */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-brand-cream-dark shadow-lg">
              <img
                src="/images/hero/specs-bookcharm.jpg"
                alt="Bookcharm specifications"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div class="text-5xl mb-4">📐</div>
                      <p class="font-golan text-xl text-brand-navy mb-2">Thông số sản phẩm</p>
                      <div class="space-y-2 mt-4 font-san text-sm text-brand-muted">
                        <p>Kích thước: 10cm x 5.5cm x 2.5cm</p>
                        <p>Trọng lượng: 450g</p>
                        <p>Chất liệu: Polymer cao cấp</p>
                      </div>
                    </div>
                  `;
                }}
              />
            </div>

            {/* Size annotation overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4">
              <p className="font-san text-xs text-brand-muted text-center">
                <span className="font-semibold text-brand-charcoal">Kích thước:</span>{' '}
                10cm × 5.5cm × 2.5cm •{' '}
                <span className="font-semibold text-brand-charcoal">Trọng lượng:</span>{' '}
                450g
              </p>
            </div>
          </div>

          {/* Right: Description text */}
          <div>
            <p className="font-san text-sm uppercase tracking-widest text-brand-amber mb-4">
              Vẻ đẹp không cần đánh đổi bởi sự thuận tiện
            </p>
            <h2 className="font-golan text-3xl md:text-4xl font-bold text-brand-charcoal leading-snug mb-6">
              Với kích thước chỉ vỏn vẹn{' '}
              <span className="text-brand-navy">10cm × 5.5cm × 2.5cm</span>
            </h2>
            <p className="font-san text-base text-brand-muted leading-relaxed mb-6">
              Với kích thước chỉ vỏn vẹn 10cm x 5.5cm x 2.5cm và trọng lượng 450g giúp mọi
              bước đi của bạn đều thoải mái và nhẹ nhàng. Với lớp phủ polymer đặc biệt giúp
              ngăn thấm nước, chống bẩn và tăng độ bền cho bìa sách.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4">
              {[
                { icon: '🪶', text: 'Siêu nhẹ chỉ 450g — thoải mái mang theo mọi nơi' },
                { icon: '💧', text: 'Phủ polymer chống nước — bảo vệ toàn diện' },
                { icon: '✨', text: 'Thủ công tinh xảo — mỗi sản phẩm là duy nhất' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <p className="font-san text-sm text-brand-charcoal">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
