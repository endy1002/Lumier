import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function StorySection() {
  const [ref, isVisible] = useScrollReveal();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/hero/story-bg.png"
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C3E2D]/90 via-[#2C3E2D]/80 to-[#2C3E2D]/60" />
      </div>

      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 section-reveal ${isVisible ? 'visible' : ''
          }`}
      >
        <div className="max-w-3xl">
          <h2 className="font-golan text-3xl md:text-5xl font-bold text-white leading-tight mb-8 italic">
            Ta là ai và sẽ trở thành ai qua những gì ta đọc?
          </h2>
          <p className="font-san text-base md:text-lg text-white/80 leading-relaxed mb-10">
            Trong một thế giới bị phân mảnh bởi quá tải kỹ thuật số và tăng tốc liên tục,
            nhiều người xem sách và những câu chuyện dài hơi như một nơi trú ẩn để chậm lại,
            suy ngẫm và tìm thấy cảm giác thuộc về...
          </p>

          {/* The Storyteller badge */}
          <div className="w-full flex flex-col items-end mt-2">
            <div className="w-44 md:w-60 h-[3px] bg-white/90 mb-3" />
            <p className="font-golan text-3xl md:text-4xl text-white italic leading-none">
              The storyteller
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
