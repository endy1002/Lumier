import { AUTHORS } from '../../data/audiobooks';

export default function AuthorInfo() {
  return (
    <div>
      <h2 className="font-golan text-2xl font-bold text-brand-charcoal mb-2 italic">
        Những ngòi bút một thời của văn học Việt
      </h2>
      <p className="font-san text-sm text-brand-muted mb-8">
        Tìm hiểu về những tác giả đã tạo nên kho tàng văn học Việt Nam
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AUTHORS.map((author) => (
          <div
            key={author.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* Avatar */}
            <div className="h-48 bg-gradient-to-b from-brand-navy to-brand-deep-blue flex items-center justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
                <img
                  src={author.avatar}
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

            {/* Info */}
            <div className="p-5">
              <h3 className="font-golan text-lg font-bold text-brand-charcoal mb-2">
                {author.name}
              </h3>
              <p className="font-san text-xs text-brand-muted leading-relaxed mb-4">
                {author.bio}
              </p>

              {/* Works */}
              <div>
                <p className="font-san text-xs font-semibold text-brand-navy mb-2 uppercase tracking-wider">
                  Tác phẩm tiêu biểu
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {author.works.map((work) => (
                    <span
                      key={work}
                      className="font-san text-[10px] bg-brand-cream px-2.5 py-1 rounded-full text-brand-charcoal"
                    >
                      {work}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
