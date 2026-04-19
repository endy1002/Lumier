import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

function AuthorModal({ author, onClose }) {
  if (!author) {
    return null;
  }

  const images = [0, 1, 2].map((idx) => (author.infoImages || [])[idx] || author.avatarUrl || '/images/authors/01.jpeg');

  return (
    <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose}>
      <div className="w-full h-full bg-brand-charcoal/90 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-black/45 border-b border-white/10">
          <h3 className="font-golan text-2xl text-white">{author.name}</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="h-[calc(100vh-73px)] overflow-y-auto snap-y snap-mandatory">
          {images.map((src, idx) => (
            <section key={idx} className="snap-start min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-6">
              <div className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl bg-black/20 border border-white/10">
                <img
                  src={src}
                  alt={`${author.name}-info-${idx + 1}`}
                  className="w-full h-auto object-cover"
                />
                <div className="px-4 py-2 text-center bg-black/45">
                  <span className="font-san text-xs tracking-[0.25em] text-white/80">SLIDE {idx + 1} / 3</span>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuthorInfo({ authors = [] }) {
  const PAGE_SIZE = 3;
  const [activeId, setActiveId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const { t, translateText } = useLanguage();

  const pageCount = Math.max(1, Math.ceil(authors.length / PAGE_SIZE));
  const visibleAuthors = useMemo(
    () => authors.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE),
    [authors, pageIndex]
  );

  const activeAuthor = useMemo(
    () => authors.find((item) => item.id === activeId) || null,
    [authors, activeId]
  );

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageCount, pageIndex]);

  return (
    <div>
      <h2 className="font-golan text-3xl font-bold text-brand-charcoal mb-2 italic">
        {t('Tác giả', 'Authors')}
      </h2>
      <p className="font-san text-base text-brand-muted mb-8">
        {t('Những ngòi bút lừng danh.', 'Classic voices of literature.')}
      </p>

      {authors.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mb-4">
          <p className="font-san text-sm text-brand-muted">
            {t('Trang {current}/{total}', 'Page {current}/{total}', { current: pageIndex + 1, total: pageCount })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={pageIndex === 0}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-brand-cream-dark font-san text-sm text-brand-charcoal disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              {t('Trước', 'Back')}
            </button>
            <button
              type="button"
              onClick={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
              disabled={pageIndex >= pageCount - 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-brand-cream-dark font-san text-sm text-brand-charcoal disabled:opacity-40"
            >
              {t('Tiếp', 'Next')}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleAuthors.map((author) => {
          const avatarSrc = author.avatarUrl || '/images/authors/01.jpeg';
          return (
            <button
              key={author.id}
              type="button"
              onClick={() => setActiveId(author.id)}
              className="text-left bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-brand-cream"
            >
              <div className="h-48 bg-gradient-to-b from-brand-navy to-brand-deep-blue flex items-center justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
                  <img src={avatarSrc} alt={author.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-golan text-xl font-bold text-brand-charcoal mb-2">{author.name}</h3>
                <p className="font-san text-sm text-brand-muted line-clamp-3 mb-4">{translateText(author.bio)}</p>
                <span className="font-san text-sm text-brand-navy font-medium">
                  {t('Xem chi tiết', 'View details')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {authors.length === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <p className="font-san text-sm text-brand-muted">
            {t('Chưa có dữ liệu tác giả.', 'No author data yet.')}
          </p>
        </div>
      )}

      <AuthorModal author={activeAuthor} onClose={() => setActiveId(null)} />
    </div>
  );
}
