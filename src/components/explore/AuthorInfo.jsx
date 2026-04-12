import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function AuthorInfo({ authors = [] }) {
  const [activeAuthorId, setActiveAuthorId] = useState(authors[0]?.id || null);

  useEffect(() => {
    if (!activeAuthorId && authors.length > 0) {
      setActiveAuthorId(authors[0].id);
    }
  }, [activeAuthorId, authors]);

  return (
    <div>
      <h2 className="font-golan text-3xl font-bold text-brand-charcoal mb-2 italic">
        Tác giả
      </h2>
      <p className="font-san text-base text-brand-muted mb-8">
        Những ngòi bút một thời của văn học Việt.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {authors.map((author) => {
          const isOpen = activeAuthorId === author.id;
          const avatarSrc = author.avatarUrl || '/images/authors/01.jpeg';

          return (
            <button
              key={author.id}
              type="button"
              onClick={() => setActiveAuthorId((prev) => (prev === author.id ? null : author.id))}
              className="text-left bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-brand-cream"
            >
              <div className="h-48 bg-gradient-to-b from-brand-navy to-brand-deep-blue flex items-center justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
                  <img
                    src={avatarSrc}
                    alt={author.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="flex items-center justify-center h-full bg-brand-amber/20 text-3xl">✍️</div>
                      `;
                    }}
                  />
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-golan text-xl font-bold text-brand-charcoal">
                    {author.name}
                  </h3>
                  <ChevronDown
                    size={16}
                    className={`text-brand-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>

                {isOpen && (
                  <>
                    <p className="font-san text-sm text-brand-muted leading-relaxed mb-4 mt-3">
                      {author.bio}
                    </p>

                    <div>
                      <p className="font-san text-sm font-semibold text-brand-navy mb-2 uppercase tracking-wider">
                        Tác phẩm tiêu biểu
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                          {(author.works || []).map((work) => (
                          <span
                            key={work}
                            className="font-san text-xs bg-brand-cream px-2.5 py-1 rounded-full text-brand-charcoal"
                          >
                            {work}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {authors.length === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <p className="font-san text-sm text-brand-muted">Chưa có dữ liệu tác giả.</p>
        </div>
      )}
    </div>
  );
}
