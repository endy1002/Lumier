import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail } from 'lucide-react';
import { BRAND } from '../../config/constants';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = [
    { label: t('Trang chủ', 'Home'), path: '/' },
    { label: t('Sản phẩm', 'Products'), path: '/san-pham' },
    { label: t('Khám phá', 'Explore'), path: '/kham-pha' },
    { label: t('Bài viết', 'Articles'), path: '/bai-viet' },
  ];

  return (
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <h3 className="font-golan text-2xl font-bold text-brand-amber mb-4">
              {BRAND.name}
            </h3>
            <p className="font-san text-sm text-gray-400 leading-relaxed mb-6">
              {t(
                'Con người dù ít, dù nhiều chắc chắn vẫn có những cuốn sách yêu thích, những cuốn sách “gối đầu giường” cho riêng mình. Nó có thể định hình được cách cư xử, nhân sinh quan, hay đến cả mindset, skillset của bản thân.',
                'Everyone has their own favorite books, their own "bedside" books. They can shape our behavior, worldview, and even mindset and skillset.'
              )}
            </p>
            <div className="space-y-2 mb-6">
              <h4 className="font-san text-sm font-semibold uppercase tracking-wider text-brand-gold">
                {t('Thông tin liên hệ', 'Contact Information')}
              </h4>
              <p className="font-san text-sm text-gray-300">
                {t(
                  'Địa chỉ: 279 Nguyễn Tri Phương, phường Diên Hồng, TPHCM',
                  'Address: 279 Nguyen Tri Phuong, Dien Hong Ward, HCMC'
                )}
              </p>
              <p className="font-san text-sm text-gray-300">
                {t('Số điện thoại: 0368534407', 'Phone: 0368534407')}
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-brand-amber transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-brand-amber transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-brand-amber transition-colors"
                aria-label="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.43v-7.15a8.16 8.16 0 005.58 2.18V11.3a4.85 4.85 0 01-2.18-.52 4.83 4.83 0 01-1.82-1.79V6.69h3.99z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links column */}
          <div>
            <h4 className="font-san text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4">
              {t('Liên kết', 'Quick links')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="font-san text-sm text-gray-400 hover:text-brand-amber transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h4 className="font-san text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4">
              {t('Pháp lý', 'Legal')}
            </h4>
            <ul className="space-y-3">
              {[
                {
                  label: t('Chính sách bảo mật', 'Privacy Policy'),
                  path: '/tai-khoan?policy=privacy',
                },
                {
                  label: t('Điều khoản dịch vụ', 'Terms of Service'),
                  path: '/tai-khoan?policy=terms',
                },
                {
                  label: t('Vận chuyển', 'Shipping'),
                  path: '/thanh-toan',
                },
                {
                  label: t('Đổi trả', 'Returns'),
                  path: '/thanh-toan',
                },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="font-san text-sm text-gray-400 hover:text-brand-amber transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div>
            <h4 className="font-san text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4">
              {t('Đăng ký bản tin', 'Newsletter')}
            </h4>
            <p className="font-san text-sm text-gray-400 mb-4">
              {t(
                'Nhận thông báo về các bản sách gốc hẹn xem nhất',
                'Get updates on new premium editions.'
              )}
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.target.querySelector('input');
                if (input.value) {
                  alert(t('Cảm ơn bạn đã đăng ký!', 'Thanks for subscribing!'));
                  input.value = '';
                }
              }}
            >
              <input
                type="email"
                placeholder={t('Email của bạn', 'Your email')}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-amber"
                required
              />
              <button
                type="submit"
                className="bg-brand-amber hover:bg-brand-gold text-brand-charcoal px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {t('Gửi', 'Send')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="font-san text-xs text-gray-500">
            © {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
