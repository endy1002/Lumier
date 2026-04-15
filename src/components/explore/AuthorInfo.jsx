import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
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
  const [activeId, setActiveId] = useState(null);
  const { t, translateText } = useLanguage();

  const activeAuthor = useMemo(
    () => authors.find((item) => item.id === activeId) || null,
    [authors, activeId]
  );

  return (
    <div>
      <h2 className="font-golan text-3xl font-bold text-brand-charcoal mb-2 italic">
        {t('Tác giả', 'Authors')}
      </h2>
      <p className="font-san text-base text-brand-muted mb-8">
        {t('Những ngòi bút một thời của văn học Việt.', 'Classic voices of Vietnamese literature.')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {authors.map((author) => {
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
