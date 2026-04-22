import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../config/constants';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import SearchBar from '../search/SearchBar';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopNavigation({ onCartClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const navLabels = {
    '/': t('Trang chủ', 'Home'),
    '/san-pham': t('Sản phẩm', 'Products'),
    '/kham-pha': t('Khám phá', 'Explore'),
    '/bai-viet': t('Bài viết', 'Articles'),
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur-md border-b border-brand-cream-dark/50">
      <nav className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="relative flex items-center justify-between h-16">
          {/* Left section: Mobile toggle + Left Links */}
          <div className="flex-1 flex items-center justify-start">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-brand-charcoal hover:text-brand-amber transition-colors mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* All nav links (desktop) */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-san text-[13px] tracking-wide uppercase transition-all duration-300 hover:text-brand-amber relative group ${location.pathname === link.path
                    ? 'text-brand-amber font-medium'
                    : 'text-brand-charcoal'
                    }`}
                >
                  {navLabels[link.path] || link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-brand-amber transition-all duration-300 ${location.pathname === link.path
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                      }`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Center section: Logo (absolute to ensure exact center) */}
          <Link
            to="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-shrink-0 mix-blend-multiply"
          >
            <img
              src="/images/lumier-logo.png"
              alt="LUMIER"
              className="h-12 md:h-12 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span
              className="font-golan text-2xl font-bold text-brand-navy tracking-wider hidden"
              style={{ display: 'none' }}
            >
              LUMIER
            </span>
          </Link>

          {/* Right section: Icons */}
          <div className="flex-1 flex items-center justify-end">

            {/* Action icons */}
            <div className="flex items-center gap-3 md:gap-5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 text-brand-charcoal hover:text-brand-amber transition-colors"
                aria-label={t('Tìm kiếm', 'Search')}
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              {/* Cart (Middle) */}
              <button
                onClick={onCartClick}
                className="p-1.5 text-brand-charcoal hover:text-brand-amber transition-colors relative"
                aria-label={t('Giỏ hàng', 'Cart')}
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute 0 -right-1 bg-brand-amber text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Account (Rightmost) */}
              <Link
                to="/tai-khoan"
                className="flex items-center gap-2 p-1.5 text-brand-charcoal hover:text-brand-amber transition-colors"
                aria-label={t('Tài khoản', 'Account')}
              >
                <User size={20} strokeWidth={1.5} />
                <span className="hidden sm:block font-san text-[13px] font-medium uppercase tracking-wide">
                  {isAuthenticated ? (user?.name || user?.email || 'User') : 'User'}
                </span>
              </Link>

              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Search Bar (expandable) */}
        {searchOpen && (
          <SearchBar
            onClose={() => setSearchOpen(false)}
            onNavigate={(path) => {
              setSearchOpen(false);
              navigate(path);
            }}
          />
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-cream-dark py-4 animate-fade-in-up">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 px-2 font-san text-sm uppercase tracking-wide transition-colors ${location.pathname === link.path
                  ? 'text-brand-amber font-medium'
                  : 'text-brand-charcoal hover:text-brand-amber'
                  }`}
              >
                {navLabels[link.path] || link.label}
              </Link>
            ))}

            <div className="mt-3 px-2">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
