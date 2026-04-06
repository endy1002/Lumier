import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MarqueeBanner from './MarqueeBanner';
import TopNavigation from './TopNavigation';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import ChatbotWidget from '../chatbot/ChatbotWidget';
import Toast from '../common/Toast';

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MarqueeBanner />
      <TopNavigation onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        <Outlet context={{ showToast }} />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      {/* Chatbot Widget */}
      <ChatbotWidget />

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
