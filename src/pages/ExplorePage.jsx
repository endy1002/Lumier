import AudiobookSection from '../components/explore/AudiobookSection';
import AuthorInfo from '../components/explore/AuthorInfo';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ExplorePage() {
  const [refSummary, summaryVisible] = useScrollReveal();

  return (
    <div>
      <section className="relative overflow-hidden bg-[#101a2f]">
        <img
          src="/images/hero/explorebg.jpg"
          alt=""
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a31]/78 via-[#0f1a31]/64 to-[#0f1a31]/42" />
        <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <h1 className="font-golan text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl italic drop-shadow-[0_3px_16px_rgba(0,0,0,0.4)]">
            Nơi tâm hồn vui hơn qua những con chữ
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        <section>
          <AudiobookSection />
        </section>

        <section
          ref={refSummary}
          className={`section-reveal ${summaryVisible ? 'visible' : ''}`}
        >
          <div className="bg-gradient-to-r from-brand-cream to-white rounded-2xl p-8">
            <h2 className="font-golan text-2xl md:text-3xl font-bold text-brand-charcoal mb-2 italic">
              Tóm tắt nội dung sách
            </h2>
            <p className="font-san text-base text-brand-muted mb-1 leading-relaxed">
              Cho phép người dùng xem trước về nội dung sách trong trường hợp mua tặng hoặc mua vì bìa, mua theo gu.
            </p>
            <p className="font-san text-base text-brand-navy/85 mb-8">
              Xem tóm tắt nội dung sách
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Nhà Giả Kim',
                  author: 'Paulo Coelho',
                  excerpt:
                    'Câu chuyện về chàng chăn cừu Santiago trong hành trình theo đuổi giấc mơ vượt sa mạc Sahara...',
                  tag: 'Phiêu lưu',
                },
                {
                  title: 'Đắc Nhân Tâm',
                  author: 'Dale Carnegie',
                  excerpt:
                    'Những nguyên tắc cơ bản trong giao tiếp và cách đối nhân xử thế để chinh phục lòng người...',
                  tag: 'Self-help',
                },
                {
                  title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
                  author: 'Nguyễn Nhật Ánh',
                  excerpt:
                    'Câu chuyện tuổi thơ trong sáng về tình bạn, tình anh em và cuộc sống làng quê miền Trung...',
                  tag: 'Văn học Việt',
                },
              ].map((book) => (
                <div
                  key={book.title}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="inline-block font-san text-[10px] font-semibold uppercase tracking-wider bg-brand-amber/10 text-brand-amber px-2.5 py-1 rounded-full mb-3">
                    {book.tag}
                  </span>
                  <h3 className="font-golan text-base font-bold text-brand-charcoal mb-1">
                    {book.title}
                  </h3>
                  <p className="font-san text-sm text-brand-blue mb-3">
                    {book.author}
                  </p>
                  <p className="font-san text-sm text-brand-muted leading-relaxed">
                    {book.excerpt}
                  </p>
                  <button className="mt-4 font-san text-sm text-brand-navy font-medium hover:text-brand-amber transition-colors">
                    Đọc thêm →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <AuthorInfo />
        </section>
      </div>
    </div>
  );
}
