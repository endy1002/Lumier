import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BRAND } from '../../config/constants';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_42%_46%,_rgba(242,169,0,0.16)_0%,_rgba(242,169,0,0.08)_26%,_rgba(255,255,255,1)_62%)]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-white/72" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Bookcharm Image with floating animation */}
          <div className="relative flex justify-center lg:justify-start order-1 lg:order-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full bg-brand-amber/20 blur-sm" />

            {/* Product image container with sway animation */}
            <div className="relative z-10 animate-sway pointer-events-none translate-x-4 md:translate-x-12">
              <div className="w-80 h-96 md:w-[35rem] md:h-[34rem] flex items-center justify-center">
                <img
                  src="/images/products/charm-golden.png"
                  alt="The Golden Book Charm"
                  className="w-full h-full object-contain scale-[1.2]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="flex flex-col items-center justify-center text-center p-6 h-full border-2 border-dashed border-brand-amber/40 rounded-3xl">
                        <div class="text-6xl mb-4">📚</div>
                        <p class="font-golan text-lg text-brand-navy">Merchant Image</p>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Brand text & CTA */}
          <div className="order-2 lg:order-2 text-center lg:text-left">
            <h1 className="font-golan text-5xl md:text-6xl lg:text-7xl font-bold text-brand-navy leading-tight mb-2 tracking-wide">
              LUMIER
            </h1>
            <h2 className="font-heading text-2xl md:text-3xl text-brand-charcoal italic mb-6 drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]">
              "Chạm tri thức, rực bản nguyên"
            </h2>

            <p className="font-san text-base md:text-[17px] text-brand-charcoal/78 leading-relaxed mb-8 max-w-xl">
              Vượt xa một món phụ kiện trang trí thông thường, Book Charm là sự giao thoa giữa thẩm mỹ cá nhân và giá trị tri thức. Với kích thước vừa vặn trong lòng bàn tay, món đồ nhỏ nhắn này không chỉ tạo điểm nhấn phong cách cho chiếc túi xách, mà còn là một “tín hiệu ngầm” giúp bạn kết nối với những tâm hồn đồng điệu. Đó là cách đầy tinh tế để bạn khẳng định gu đọc sách và tự hào chia sẻ về những tác phẩm mình tâm đắc.
            </p>

            <Link
              to="/san-pham"
              className="inline-flex items-center gap-3 bg-brand-navy hover:bg-brand-deep-blue text-white font-san font-medium px-8 py-4 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/20 group"
            >
              <span>Khám phá ngay</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30V60H0V30Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </section>
  );
}
