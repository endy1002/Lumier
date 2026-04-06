import AudiobookSection from '../components/explore/AudiobookSection';
import AuthorInfo from '../components/explore/AuthorInfo';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ExplorePage() {
  const [refSummary, summaryVisible] = useScrollReveal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="text-center mb-12">
        <h1 className="font-golan text-3xl md:text-4xl font-bold text-brand-charcoal mb-3 italic">
          Khám phá
        </h1>
        <p className="font-san text-base text-brand-muted max-w-lg mx-auto">
          Nơi tâm hồn vui hơn qua những con chữ
        </p>
      </div>

      {/* === Audiobook Section === */}
      <div className="mb-20">
        <AudiobookSection />
      </div>

      {/* === Book Summary Section === */}
      <div
        ref={refSummary}
        className={`mb-20 section-reveal ${summaryVisible ? 'visible' : ''}`}
      >
        <div className="bg-gradient-to-r from-brand-cream to-white rounded-2xl p-8">
          <h2 className="font-golan text-2xl font-bold text-brand-charcoal mb-2 italic">
            Xem tóm tắt nội dung sách
          </h2>
          <p className="font-san text-sm text-brand-muted mb-8">
            Cho phép người đọc xem trước về nội dung sách trong trường hợp mua tặng hoặc mua vì bìa, mua theo gu
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
                <p className="font-san text-xs text-brand-blue mb-3">
                  {book.author}
                </p>
                <p className="font-san text-xs text-brand-muted leading-relaxed">
                  {book.excerpt}
                </p>
                <button className="mt-4 font-san text-xs text-brand-navy font-medium hover:text-brand-amber transition-colors">
                  Đọc thêm →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === Author Info Section === */}
      <AuthorInfo />
    </div>
  );
}
