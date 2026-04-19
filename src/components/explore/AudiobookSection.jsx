import { useEffect, useState } from 'react';
import { Lock, Unlock, Play, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchExploreAudiobooks, verifyExploreAudiobookCode } from '../../services/explore';
import { useLanguage } from '../../context/LanguageContext';

export default function AudiobookSection({ googleId }) {
  const PAGE_SIZE = 4;
  const { t, translateText } = useLanguage();
  const [code, setCode] = useState('');
  const [books, setBooks] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [activePlayerBookId, setActivePlayerBookId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const unlockedCount = books.filter((book) => book.unlocked).length;
  const pageCount = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  const visibleBooks = books.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageIndex, pageCount]);

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
          setError(t('Không thể tải dữ liệu audiobook.', 'Unable to load audiobook data.'));
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
      setError(t('Vui lòng đăng nhập để kích hoạt audiobook.', 'Please sign in to activate audiobooks.'));
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
      setSuccess(
        t(
          'Kích hoạt thành công. Bạn có thể nghe ngay sách đã mở khóa.',
          'Activation successful. You can now listen to unlocked books.'
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.error
        || err?.message
        || t('Mã code không hợp lệ. Vui lòng kiểm tra lại.', 'Invalid code. Please verify and try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header with illustration */}
      <div className="bg-gradient-to-b from-brand-navy to-brand-deep-blue rounded-2xl p-8 mb-8 text-center">
        <h2 className="font-golan text-3xl font-bold text-white mb-3 italic">
          {t('Sách Nói', 'Audiobooks')}
        </h2>
        <p className="font-san text-base text-white/75 max-w-xl mx-auto leading-relaxed">
          {t(
            'Với sách nói, Lumier không giúp bạn lắng nghe những con chữ từ tác giả, mà là lắng nghe những cảm xúc của bản thân',
            'With audiobooks, Lumier is not just about hearing words from authors, but listening to your own emotions.'
          )}
        </p>
      </div>

      {/* Code input */}
      {!googleId ? (
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-brand-amber" />
            <h3 className="font-san text-base font-semibold text-brand-charcoal">
              {t('Đăng nhập để nhập code và mở khóa audiobook.', 'Sign in to enter code and unlock audiobooks.')}
            </h3>
          </div>
          <p className="font-san text-sm text-brand-muted">
            {t(
              'Code audiobook được phát hành theo từng giao dịch và chỉ dùng được với tài khoản đã mua.',
              'Audiobook codes are issued per purchase and can only be used with the purchasing account.'
            )}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-brand-amber" />
            <h3 className="font-san text-base font-semibold text-brand-charcoal">
              {t(
                'Nhập code từ bookcharm để truy cập vào kho thư viện sách nói đặc quyền',
                'Enter your bookcharm code to access the exclusive audiobook library'
              )}
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
              placeholder={t('Nhập code độc quyền...', 'Enter exclusive code...')}
              className="flex-1 px-4 py-3 border-2 border-brand-cream-dark rounded-xl font-monoht text-sm uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="px-6 py-3 bg-brand-navy text-white font-san text-sm font-medium rounded-xl hover:bg-brand-deep-blue transition-colors"
            >
              {isSubmitting ? t('Đang xác nhận...', 'Verifying...') : t('Xác nhận', 'Confirm')}
            </button>
          </form>

          {error && (
            <p className="font-san text-sm text-red-500 mt-2">{error}</p>
          )}

          {success && (
            <p className="font-san text-sm text-green-600 mt-2">{success}</p>
          )}

          <p className="font-san text-sm text-brand-muted mt-3 leading-relaxed">
            {t(
              'Với sách nói, Lumier không giúp bạn lắng nghe những con chữ từ tác giả, mà là lắng nghe những cảm xúc của bản thân',
              'With audiobooks, Lumier is not just about hearing words from authors, but listening to your own emotions.'
            )}
          </p>
        </div>
      )}

      {unlockedCount > 0 && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 mb-8">
          <Unlock size={16} />
          <p className="font-san text-sm font-medium">
            {t('Bạn đã mở khóa {count}/{total} audiobook.', 'You have unlocked {count}/{total} audiobooks.', {
              count: unlockedCount,
              total: books.length,
            })}
          </p>
        </div>
      )}

      {/* Audiobook grid */}
      {books.length > PAGE_SIZE && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleBooks.map((book) => (
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
                  {translateText(book.title)}
                </h4>
                <p className="font-san text-sm text-brand-muted mt-0.5">
                  {translateText(book.author)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-brand-muted">
                    <Clock size={12} />
                    <span className="font-san text-sm">{book.duration || '--'}</span>
                  </div>
                  <span className="font-san text-sm text-brand-muted">
                    {t('Đọc:', 'Narrated by:')} {translateText(book.narrator)}
                  </span>
                </div>
                <p className="font-san text-sm text-brand-muted mt-2 line-clamp-2">
                  {translateText(book.summary)}
                </p>

                {book.unlocked && book.audioFileUrl && (
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => setActivePlayerBookId((prev) => (prev === book.id ? null : book.id))}
                      className="inline-flex items-center gap-1.5 text-brand-navy font-san text-sm font-medium hover:underline"
                    >
                      <Play size={14} />
                      {activePlayerBookId === book.id
                        ? t('Ẩn trình phát', 'Hide player')
                        : t('Nghe ngay', 'Play now')}
                    </button>

                    {activePlayerBookId === book.id && (
                      <audio controls autoPlay className="w-full">
                        <source src={book.audioFileUrl} type={book.audioFormat ? `audio/${book.audioFormat}` : undefined} />
                      </audio>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && books.length === 0 && (
        <div className="bg-white rounded-2xl p-8 mt-6 text-center shadow-sm">
          <p className="font-san text-sm text-brand-muted">
            {t('Chưa có audiobook nào trong thư viện.', 'No audiobooks in the library yet.')}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-2xl p-8 mt-6 text-center shadow-sm">
          <p className="font-san text-sm text-brand-muted">
            {t('Đang tải danh sách audiobook...', 'Loading audiobook library...')}
          </p>
        </div>
      )}
    </div>
  );
}
