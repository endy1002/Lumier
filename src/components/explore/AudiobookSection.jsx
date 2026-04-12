import { useEffect, useState } from 'react';
import { Lock, Unlock, Play, Clock } from 'lucide-react';
import { fetchExploreAudiobooks, verifyExploreAudiobookCode } from '../../services/explore';

export default function AudiobookSection({ googleId }) {
  const [code, setCode] = useState('');
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const unlockedCount = books.filter((book) => book.unlocked).length;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchExploreAudiobooks(googleId);
        if (mounted) {
          setBooks(data);
        }
      } catch {
        if (mounted) {
          setBooks([]);
          setError('Không thể tải dữ liệu audiobook.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [googleId]);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    if (!googleId) {
      setError('Vui lòng đăng nhập để kích hoạt audiobook.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await verifyExploreAudiobookCode({ googleId, code });
      const data = await fetchExploreAudiobooks(googleId);
      setBooks(data);
      setCode('');
      setSuccess('Kích hoạt thành công. Bạn có thể nghe ngay sách đã mở khóa.');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Mã code không hợp lệ. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
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
      {!googleId ? (
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-brand-amber" />
            <h3 className="font-san text-base font-semibold text-brand-charcoal">
              Đăng nhập để nhập code và mở khóa audiobook.
            </h3>
          </div>
          <p className="font-san text-sm text-brand-muted">
            Code audiobook được phát hành theo từng giao dịch và chỉ dùng được với tài khoản đã mua.
          </p>
        </div>
      ) : (
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
                setSuccess('');
              }}
              placeholder="Nhập code độc quyền..."
              className="flex-1 px-4 py-3 border-2 border-brand-cream-dark rounded-xl font-monoht text-sm uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="px-6 py-3 bg-brand-navy text-white font-san text-sm font-medium rounded-xl hover:bg-brand-deep-blue transition-colors"
            >
              {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận'}
            </button>
          </form>

          {error && (
            <p className="font-san text-sm text-red-500 mt-2">{error}</p>
          )}

          {success && (
            <p className="font-san text-sm text-green-600 mt-2">{success}</p>
          )}

          <p className="font-san text-sm text-brand-muted mt-3 leading-relaxed">
            Với sách nói, Lumier không giúp bạn lắng nghe những con chữ từ tác giả, mà là lắng nghe những cảm xúc của bản thân
          </p>
        </div>
      )}

      {unlockedCount > 0 && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 mb-8">
          <Unlock size={16} />
          <p className="font-san text-sm font-medium">
            Bạn đã mở khóa {unlockedCount}/{books.length} audiobook.
          </p>
        </div>
      )}

      {/* Audiobook grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all ${
              !book.unlocked ? 'opacity-60 grayscale' : 'hover:shadow-lg'
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
                {!book.unlocked && (
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
                    <span className="font-san text-sm">{book.duration || '--'}</span>
                  </div>
                  <span className="font-san text-sm text-brand-muted">
                    Đọc: {book.narrator}
                  </span>
                </div>
                <p className="font-san text-sm text-brand-muted mt-2 line-clamp-2">
                  {book.summary}
                </p>

                {book.unlocked && book.audioFileUrl && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-brand-navy font-san text-sm font-medium">
                      <Play size={14} />
                      Nghe ngay
                    </div>
                    <audio controls className="w-full">
                      <source src={book.audioFileUrl} type={book.audioFormat ? `audio/${book.audioFormat}` : undefined} />
                    </audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && books.length === 0 && (
        <div className="bg-white rounded-2xl p-8 mt-6 text-center shadow-sm">
          <p className="font-san text-sm text-brand-muted">Chưa có audiobook nào trong thư viện.</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-2xl p-8 mt-6 text-center shadow-sm">
          <p className="font-san text-sm text-brand-muted">Đang tải danh sách audiobook...</p>
        </div>
      )}
    </div>
  );
}
