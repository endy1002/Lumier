import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-8xl mb-6">📖</div>
      <h1 className="font-golan text-6xl font-bold text-brand-navy mb-4">404</h1>
      <p className="font-san text-lg text-brand-charcoal mb-2">
        {t('Trang bạn tìm không tồn tại', 'The page you are looking for does not exist.')}
      </p>
      <p className="font-san text-sm text-brand-muted mb-8">
        {t(
          'Có vẻ cuốn sách này đã bị lạc mất trên kệ. Hãy quay về trang chủ nhé!',
          'Looks like this book got lost on the shelf. Return to the homepage.'
        )}
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-san text-sm font-medium rounded-xl hover:bg-brand-deep-blue transition-colors"
        >
          <Home size={16} />
          {t('Trang chủ', 'Home')}
        </Link>
        <Link
          to="/san-pham"
          className="flex items-center gap-2 px-6 py-3 border-2 border-brand-cream-dark text-brand-charcoal font-san text-sm font-medium rounded-xl hover:border-brand-amber transition-colors"
        >
          <ArrowLeft size={16} />
          {t('Sản phẩm', 'Products')}
        </Link>
      </div>
    </div>
  );
}
