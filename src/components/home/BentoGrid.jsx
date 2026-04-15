import { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../context/LanguageContext';

export default function BentoGrid() {
  const [ref, isVisible] = useScrollReveal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  const slides = [
    '/images/feedback/IMG_6274.PNG',
    '/images/feedback/IMG_6275.PNG',
    '/images/feedback/M1.jpg',
    '/images/feedback/M2.jpg',
    '/images/feedback/Screenshot 2026-04-05 192231.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="py-20 bg-white relative">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 section-reveal ${isVisible ? 'visible' : ''
          }`}
      >
        {/* Section title */}
        <div className="mb-10 inline-block border-brand-navy pb-1">
          <h2 className="font-golan text-2xl md:text-3xl font-medium text-brand-navy tracking-wide">
            {t('Những niềm tự hào của Lumier', 'Lumier highlights')}
          </h2>
        </div>

        {/* Bento Grid Layout - Exactly matching screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (1/3 width) */}
          <div className="flex flex-col col-span-1 gap-6">

            {/* Sự hài lòng của khách hàng (tall box) */}
            <div className="flex-[8] bg-brand-cream border-2 border-brand-charcoal rounded-3xl p-6 md:min-h-[350px] relative overflow-hidden flex flex-col justify-between shadow-sm">
              <h3 className="font-golan text-xl font-bold text-brand-charcoal z-10 relative">
                {t('Sự hài lòng của khách hàng', 'Customer satisfaction')}
              </h3>

              {/* Slideshow placeholder */}
              <div className="absolute inset-0 pt-[4.5rem] p-6">
                <div className={`w-full h-full rounded-2xl transition-all duration-1000 flex items-center justify-center bg-gray-100 overflow-hidden`}>
                  <img src={slides[currentSlide]} alt="Customer Feedback" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Quá trình tạo ra sản phẩm (short box) */}
            <div className="flex-[4] rounded-3xl p-6 min-h-[160px] flex items-center justify-center shadow-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-charcoal/40 transition-colors group-hover:bg-brand-charcoal/50 z-10" />
              <img src="/images/products/process.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Process" />
              <h3 className="font-golan text-xl font-bold text-white text-center px-4 relative z-20">
                {t('Quá trình tạo ra sản phẩm', 'How our products are made')}
              </h3>
            </div>
          </div>

          {/* Right Column (2/3 width) */}
          <div className="flex flex-col col-span-1 lg:col-span-2 gap-6">

            {/* Top row of right column: Two short boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-[4] min-h-[160px]">

              {/* 1000+ */}
              <div className="bg-brand-amber rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="font-golan text-6xl md:text-7xl font-bold text-brand-charcoal mb-2">
                  1000<span className="font-san font-normal text-4xl text-brand-charcoal/60 absolute mt-2 ml-1">+</span>
                </p>
                <p className="font-golan text-xl font-bold text-brand-charcoal mt-3">
                  {t('bìa sách có sẵn', 'ready-made covers')}
                </p>
              </div>

              {/* 10+ */}
              <div className="bg-brand-navy rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="font-golan text-6xl md:text-7xl font-bold text-white mb-2 relative">
                  10<span className="font-san font-normal text-4xl text-white/70 absolute top-2 -right-6">+</span>
                </p>
                <p className="font-golan text-xl font-bold text-white mt-3">
                  {t('NXB cùng hợp tác', 'partner publishers')}
                </p>
              </div>
            </div>

            {/* ABOUT LUMIER (tall gradient box) */}
            <div className="flex-[8] rounded-3xl md:min-h-[350px] relative overflow-hidden p-8 flex flex-col shadow-md">
              {/* Gradient Background matching screenshot (blue -> amber/yellow) */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1E5EFF] via-[#4A8DFF] to-[#FFAA00]" />

              {/* Noise overlay for texture */}
              <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MDAnIGhlaWdodD0nNDAwJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC44JyBudW1PY3RhdmVzPSczJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI24pJyBvcGFjaXR5PScwLjI1Jy8+PC9zdmc+')]" />

              {/* Content */}
              <div className="relative z-10 text-white flex flex-col h-full p-2">
                <h3 className="font-serif text-3xl font-bold tracking-wider uppercase mb-auto drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                  ABOUT LUMIER
                </h3>

                <div className="mt-12 md:mt-20">
                  <p className="font-san text-sm tracking-widest uppercase mb-4 font-bold text-white/95">
                    OUR MISSION
                  </p>
                  <p className="font-san text-xl md:text-2xl text-white font-medium leading-relaxed max-w-4xl drop-shadow-sm">
                    {t(
                      'Lumier trao gửi khách hàng những món phụ kiện cá tính, cá nhân và có tính biểu tượng nhằm nâng cao đời sống tinh thần và vun vén một cộng đồng đọc sách của người Việt Nam.',
                      'Lumier delivers expressive, personal, and symbolic accessories that enrich everyday life and nurture a stronger reading community in Vietnam.'
                    )}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
