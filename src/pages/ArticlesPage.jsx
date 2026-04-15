import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock3, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchBlogCards, fetchBlogDetail } from '../services/blogs';

function formatDate(value, locale) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString(locale === 'en-US' ? 'en-GB' : 'vi-VN');
}

function ArticleDetailModal({ article, isLoading, error, onClose, t, locale }) {
  if (!article && !isLoading && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[#0d1a2f]/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-brand-cream-dark/80">
        <div className="relative">
          {article?.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title || 'Article cover'}
              className="w-full h-[220px] sm:h-[320px] object-cover"
            />
          ) : (
            <div className="w-full h-[220px] sm:h-[320px] bg-gradient-to-br from-brand-navy via-brand-blue to-brand-charcoal" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/45 to-black/15" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal rounded-full p-2 transition-colors"
            aria-label={t('Đóng', 'Close')}
          >
            <X size={22} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center rounded-full bg-brand-amber px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-black">
                {(article?.sourceName || 'Lumier').toUpperCase()}
              </span>
              <span className="text-sm text-white/85">
                {formatDate(article?.publishedAt, locale)}
              </span>
            </div>
            <h2 className="font-golan text-2xl sm:text-4xl leading-tight max-w-4xl">
              {article?.title || t('Đang tải bài viết...', 'Loading article...')}
            </h2>
          </div>
        </div>

        <div className="bg-white px-4 sm:px-8 py-6 sm:py-8">
          {isLoading && (
            <p className="font-san text-sm text-brand-muted">
              {t('Đang tải bài viết...', 'Loading article...')}
            </p>
          )}

          {error && (
            <p className="font-san text-sm text-red-500">{error}</p>
          )}

          {!isLoading && !error && article && (
            <>
              {article.excerpt && (
                <blockquote className="mb-6 border-l-4 border-brand-amber bg-brand-cream/55 p-4 sm:p-5 rounded-r-2xl">
                  <p className="font-san text-lg italic leading-relaxed text-brand-charcoal">{article.excerpt}</p>
                </blockquote>
              )}

              <div
                className="article-content font-san text-[17px] leading-[1.85] text-brand-charcoal space-y-4"
                dangerouslySetInnerHTML={{ __html: article.contentHtml || '' }}
              />

              <div className="mt-8 flex justify-end border-t border-brand-cream-dark pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-brand-navy text-white font-san text-sm hover:bg-brand-deep-blue transition-colors"
                >
                  {t('Đóng bài viết', 'Close article')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const [cards, setCards] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLanguage();

  useEffect(() => {
    let mounted = true;

    const loadCards = async () => {
      setIsLoadingList(true);
      setListError('');
      try {
        const data = await fetchBlogCards();
        if (mounted) {
          setCards(data);
        }
      } catch (err) {
        if (mounted) {
          setCards([]);
          setListError(err?.response?.data?.error || err?.message || t('Không thể tải danh sách bài viết.', 'Unable to load articles.'));
        }
      } finally {
        if (mounted) {
          setIsLoadingList(false);
        }
      }
    };

    loadCards();

    return () => {
      mounted = false;
    };
  }, [t]);

  useEffect(() => {
    if (!slug) {
      setSelectedArticle(null);
      setDetailError('');
      setIsLoadingDetail(false);
      return;
    }

    let mounted = true;

    const loadDetail = async () => {
      setIsLoadingDetail(true);
      setDetailError('');
      try {
        const data = await fetchBlogDetail(slug);
        if (mounted) {
          setSelectedArticle(data);
        }
      } catch (err) {
        if (mounted) {
          setSelectedArticle(null);
          setDetailError(err?.response?.data?.error || err?.message || t('Không thể tải chi tiết bài viết.', 'Unable to load article details.'));
        }
      } finally {
        if (mounted) {
          setIsLoadingDetail(false);
        }
      }
    };

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [slug, t]);

  const hasModal = Boolean(slug);

  const emptyMessage = useMemo(
    () => t('Chưa có bài viết nào được xuất bản.', 'No published articles yet.'),
    [t]
  );

  return (
    <div className="bg-[#f3f4f7] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="mb-8">
          <h1 className="font-golan text-3xl sm:text-4xl text-brand-charcoal">
            {t('Bài viết', 'Articles')}
          </h1>
          <p className="font-san text-brand-muted mt-2 max-w-2xl">
            {t('Không gian nội dung giúp Lumier phát triển SEO và chia sẻ câu chuyện thương hiệu.', 'A content hub for Lumier SEO growth and brand storytelling.')}
          </p>
        </div>

        {listError && (
          <p className="font-san text-sm text-red-500 mb-6">{listError}</p>
        )}

        {isLoadingList && (
          <p className="font-san text-sm text-brand-muted">{t('Đang tải bài viết...', 'Loading articles...')}</p>
        )}

        {!isLoadingList && !listError && cards.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-brand-cream-dark">
            <p className="font-san text-brand-muted">{emptyMessage}</p>
          </div>
        )}

        {!isLoadingList && cards.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xl:gap-6">
            {cards.map((card) => (
              <article
                key={card.id}
                className="bg-white rounded-3xl border border-[#d7dbe5] overflow-hidden shadow-[0_2px_12px_rgba(19,33,62,0.08)] hover:shadow-[0_6px_20px_rgba(19,33,62,0.12)] transition-shadow"
              >
                <div className="relative">
                  {card.coverImageUrl ? (
                    <img
                      src={card.coverImageUrl}
                      alt={card.title}
                      className="w-full h-[220px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[220px] bg-gradient-to-br from-[#cfd8ea] to-[#dfe6f2]" />
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-brand-muted mb-4">
                    <span className="inline-flex items-center rounded-full bg-[#eef2ff] text-brand-blue px-3 py-1 font-semibold">
                      {card.sourceName || 'Lumier'}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {formatDate(card.publishedAt, locale)}
                    </span>
                  </div>

                  <h2 className="font-golan text-2xl leading-[1.25] text-brand-charcoal mb-3 line-clamp-3">
                    {card.title}
                  </h2>

                  <p className="font-san text-[17px] leading-[1.6] text-brand-muted line-clamp-3 min-h-[82px] mb-5">
                    {card.excerpt || ''}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-brand-muted">
                      <Clock3 size={14} />
                      {t('{minutes} phút đọc', '{minutes} min read', { minutes: card.readingTimeMinutes || 1 })}
                    </span>

                    <Link
                      to={`/bai-viet/${card.slug}`}
                      className="inline-flex items-center gap-2 font-san font-semibold text-lg text-[#2a63f8] hover:text-brand-navy transition-colors"
                    >
                      {t('Đọc tiếp', 'Read more')}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {hasModal && (
        <ArticleDetailModal
          article={selectedArticle}
          isLoading={isLoadingDetail}
          error={detailError}
          onClose={() => navigate('/bai-viet')}
          t={t}
          locale={locale}
        />
      )}
    </div>
  );
}
