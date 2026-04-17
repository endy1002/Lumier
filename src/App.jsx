import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { useUTM } from './hooks/useUTM';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ExplorePage from './pages/ExplorePage';
import ArticlesPage from './pages/ArticlesPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomizationPage from './pages/CustomizationPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  // Capture UTM params on first load
  useUTM();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="san-pham" element={<ProductsPage />} />
        <Route path="customize/:productId" element={<CustomizationPage />} />
        <Route path="kham-pha" element={<ExplorePage />} />
        <Route path="bai-viet" element={<ArticlesPage />} />
        <Route path="bai-viet/:slug" element={<ArticlesPage />} />
        <Route path="thanh-toan" element={<CheckoutPage />} />
        <Route path="tai-khoan" element={<AccountPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
    const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';

    if (!websiteId || document.getElementById('umami-analytics-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'umami-analytics-script';
    script.defer = true;
    script.src = scriptUrl;
    script.setAttribute('data-website-id', websiteId);
    document.head.appendChild(script);
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}
