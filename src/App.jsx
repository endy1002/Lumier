import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { CartProvider } from './context/CartContext';
import { useUTM } from './hooks/useUTM';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ExplorePage from './pages/ExplorePage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomizationPage from './pages/CustomizationPage';

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
        <Route path="bai-viet" element={<NotFoundPage />} />
        <Route path="thanh-toan" element={<CheckoutPage />} />
        <Route path="tai-khoan" element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
        <Analytics />
        <SpeedInsights />
      </CartProvider>
    </BrowserRouter>
  );
}
