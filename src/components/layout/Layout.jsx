import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MarqueeBanner from './MarqueeBanner';
import TopNavigation from './TopNavigation';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import ChatbotWidget from '../chatbot/ChatbotWidget';
import Toast from '../common/Toast';

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const isCustomizePage = location.pathname.includes('/customize');
  const isPurchasePage =
    location.pathname.includes('/san-pham') ||
    location.pathname.includes('/customize') ||
    location.pathname.includes('/thanh-toan');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`flex flex-col ${isCustomizePage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <MarqueeBanner />
      <TopNavigation onCartClick={() => setCartOpen(true)} />

      <main className={`flex-1 overflow-y-auto ${isCustomizePage ? 'flex flex-col' : ''}`}>
        <Outlet context={{ showToast }} />
      </main>

      {!isCustomizePage && <Footer />}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      {/* Chatbot Widget */}
      {!isPurchasePage && <ChatbotWidget />}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
