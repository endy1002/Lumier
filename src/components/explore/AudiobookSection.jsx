import { useState } from 'react';
import { Lock, Unlock, Play, Clock } from 'lucide-react';
import { AUDIOBOOKS, validateAudiobookCode } from '../../data/audiobooks';

export default function AudiobookSection() {
  const [code, setCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (validateAudiobookCode(code)) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Mã code không hợp lệ. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div>
      {/* Header with illustration */}
      <div className="bg-gradient-to-b from-brand-navy to-brand-deep-blue rounded-2xl p-8 mb-8 text-center">
        <h2 className="font-golan text-3xl font-bold text-white mb-3 italic">
          Sách Nói
        </h2>
        <p className="font-san text-base text-white/75 max-w-xl mx-auto leading-relaxed">
          Với sách nói, Lumier không giúp bạn lắng nghe những con chữ từ tác giả, mà là lắng
          nghe những cảm xúc của bản thân
        </p>
      </div>

      {/* Code input */}
      {!isUnlocked ? (
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-brand-amber" />
            <h3 className="font-san text-base font-semibold text-brand-charcoal">
              Nhập code từ bookcharm để truy cập vào kho thư viện sách nói đặc quyền
            </h3>
          </div>

          <form onSubmit={handleCodeSubmit} className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="Nhập code độc quyền..."
              className="flex-1 px-4 py-3 border-2 border-brand-cream-dark rounded-xl font-monoht text-sm uppercase tracking-wider"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand-navy text-white font-san text-sm font-medium rounded-xl hover:bg-brand-deep-blue transition-colors"
            >
              Xác nhận
            </button>
          </form>

          {error && (
            <p className="font-san text-sm text-red-500 mt-2">{error}</p>
          )}

          <p className="font-san text-sm text-brand-muted mt-3 leading-relaxed">
            Với sách nói, Lumier không giúp bạn lắng nghe những con chữ từ tác giả, mà là lắng nghe những cảm xúc của bản thân
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 mb-8">
          <Unlock size={16} />
          <p className="font-san text-sm font-medium">
            Đã mở khóa thư viện sách nói!
          </p>
        </div>
      )}

      {/* Audiobook grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AUDIOBOOKS.map((book) => (
          <div
            key={book.id}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all ${
              !isUnlocked ? 'opacity-60 grayscale' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex gap-4 p-4">
              {/* Cover */}
              <div className="w-20 h-28 rounded-lg overflow-hidden bg-brand-cream-dark flex-shrink-0 relative">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="flex items-center justify-center h-full text-3xl">🎧</div>
                    `;
                  }}
                />
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock size={20} className="text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h4 className="font-golan text-base font-semibold text-brand-charcoal">
                  {book.title}
                </h4>
                <p className="font-san text-sm text-brand-muted mt-0.5">
                  {book.author}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-brand-muted">
                    <Clock size={12} />
                    <span className="font-san text-sm">{book.duration}</span>
                  </div>
                  <span className="font-san text-sm text-brand-muted">
                    Đọc: {book.narrator}
                  </span>
                </div>
                <p className="font-san text-sm text-brand-muted mt-2 line-clamp-2">
                  {book.summary}
                </p>

                {isUnlocked && (
                  <button className="mt-3 flex items-center gap-1.5 text-brand-navy font-san text-sm font-medium hover:text-brand-amber transition-colors">
                    <Play size={14} />
                    Nghe ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
