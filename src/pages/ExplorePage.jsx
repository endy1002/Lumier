import { useEffect, useState } from 'react';
import AudiobookSection from '../components/explore/AudiobookSection';
import AuthorInfo from '../components/explore/AuthorInfo';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuth } from '../hooks/useAuth';
import { fetchExploreAuthors, fetchExploreSummaries } from '../services/explore';
import { useLanguage } from '../context/LanguageContext';

export default function ExplorePage() {
  const [refSummary, summaryVisible] = useScrollReveal();
  const { user } = useAuth();
  const { t, translateText } = useLanguage();
  const [authors, setAuthors] = useState([]);
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadExploreData = async () => {
      try {
        const [authorData, summaryData] = await Promise.all([
          fetchExploreAuthors(),
          fetchExploreSummaries(),
        ]);

        if (!mounted) {
          return;
        }

        setAuthors(authorData);
        setSummaries(summaryData);
      } catch {
        if (mounted) {
          setAuthors([]);
          setSummaries([]);
        }
      }
    };

    loadExploreData();

    return () => {
      mounted = false;
    };
  }, []);

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
            {t('Nơi tâm hồn vui hơn qua những con chữ', 'Where words make the soul lighter')}
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        <section>
          <AudiobookSection googleId={user?.googleId} />
        </section>

        <section
          ref={refSummary}
          className={`section-reveal ${summaryVisible ? 'visible' : ''}`}
        >
          <div className="bg-gradient-to-r from-brand-cream to-white rounded-2xl p-8">
            <h2 className="font-golan text-2xl md:text-3xl font-bold text-brand-charcoal mb-2 italic">
              {t('Tóm tắt nội dung sách', 'Book Summary')}
            </h2>
            <p className="font-san text-base text-brand-muted mb-1 leading-relaxed">
              {t(
                'Cho phép người dùng xem trước về nội dung sách trong trường hợp mua tặng hoặc mua vì bìa, mua theo gu.',
                'Let users preview book content when buying as a gift, buying for cover design, or buying by personal taste.'
              )}
            </p>
            <p className="font-san text-base text-brand-navy/85 mb-8">
              {t('Xem tóm tắt nội dung sách', 'Browse book summaries')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaries.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="inline-block font-san text-[10px] font-semibold uppercase tracking-wider bg-brand-amber/10 text-brand-amber px-2.5 py-1 rounded-full mb-3">
                    {translateText(book.tag)}
                  </span>
                  <h3 className="font-golan text-base font-bold text-brand-charcoal mb-1">
                    {translateText(book.title)}
                  </h3>
                  <p className="font-san text-sm text-brand-blue mb-3">
                    {translateText(book.author)}
                  </p>
                  <p className="font-san text-sm text-brand-muted leading-relaxed">
                    {translateText(book.excerpt)}
                  </p>
                  <button className="mt-4 font-san text-sm text-brand-navy font-medium hover:text-brand-amber transition-colors">
                    {t('Đọc thêm →', 'Read more ->')}
                  </button>
                </div>
              ))}
            </div>

            {summaries.length === 0 && (
              <div className="bg-white rounded-xl p-6 mt-4 text-center">
                <p className="font-san text-sm text-brand-muted">
                  {t('Chưa có dữ liệu tóm tắt sách.', 'No book summaries available yet.')}
                </p>
              </div>
            )}
          </div>
        </section>

        <section>
          <AuthorInfo authors={authors} />
        </section>
      </div>
    </div>
  );
}
