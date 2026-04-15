import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Minus, Plus, Trash2, Sparkles, X } from 'lucide-react';
import BookshelfUI from '../components/products/BookshelfUI';
import ProductRanking from '../components/products/ProductRanking';
import CustomizePopup from '../components/products/CustomizePopup';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchProducts } from '../services/products';

const SELECTION_DRAFT_KEY = 'lumier-products-selection-draft';
const CUSTOMIZE_PRODUCT_KEY = 'lumier-customize-product';

function createDraftKey(productId, customization) {
  if (!customization) return `default:${productId}`;
  return `custom:${productId}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
}

function readDraftSelection() {
  try {
    const raw = window.sessionStorage.getItem(SELECTION_DRAFT_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry) => entry?.product?.id)
      .map((entry) => ({
        draftKey: entry.draftKey || createDraftKey(entry.product.id, entry.customization || null),
        product: entry.product,
        customization: entry.customization || null,
        quantity: Math.max(1, Number(entry.quantity) || 1),
      }));
  } catch {
    return [];
  }
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const { showToast } = useOutletContext();
  const { addItem } = useCart();
  const { t, formatCurrency } = useLanguage();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [showCustomizePopup, setShowCustomizePopup] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Check if redirected from search with no results
  const shouldCustomize = searchParams.get('customize') === 'true';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const draft = readDraftSelection();
    setSelectedItems(draft);
    setHasHydratedDraft(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await fetchProducts();
        if (mounted) {
          setProducts(data);
        }
      } catch {
        if (mounted) {
          setProducts([]);
          showToast(
            t(
              'Không thể tải danh sách sản phẩm từ hệ thống.',
              'Unable to load product list from the system.'
            )
          );
        }
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    if (!hasHydratedDraft) return;
    window.sessionStorage.setItem(SELECTION_DRAFT_KEY, JSON.stringify(selectedItems));
  }, [selectedItems, hasHydratedDraft]);

  const selectedQuantities = useMemo(
    () =>
      selectedItems.reduce((acc, item) => {
        if (!item?.product?.id) return acc;
        acc[item.product.id] = (acc[item.product.id] || 0) + item.quantity;
        return acc;
      }, {}),
    [selectedItems]
  );

  const totalSelectedCount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item?.quantity || 0), 0),
    [selectedItems]
  );

  const totalSelectedPrice = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + (item?.product?.basePrice || 0) * (item?.quantity || 0),
        0
      ),
    [selectedItems]
  );

  const charmCustomizationSummary = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        if (item?.product?.category !== 'CHARM') return acc;

        const qty = Math.max(1, Number(item?.quantity) || 1);
        acc.total += qty;
        if (item.customization) {
          acc.customized += qty;
        }
        return acc;
      },
      { total: 0, customized: 0 }
    );
  }, [selectedItems]);

  const addItemToSelection = (product, customization = null, replaceDraftKey = null) => {
    setSelectedItems((prev) => {
      if (replaceDraftKey) {
        return prev.map((entry) =>
          entry.draftKey === replaceDraftKey
            ? {
                ...entry,
                product,
                customization,
              }
            : entry
        );
      }

      const found = prev.find(
        (entry) =>
          entry.product.id === product.id &&
          JSON.stringify(entry.customization || null) === JSON.stringify(customization || null)
      );

      if (found && !customization) {
        return prev.map((entry) =>
          entry.draftKey === found.draftKey
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [
        ...prev,
        {
          draftKey: createDraftKey(product.id, customization),
          product,
          customization,
          quantity: 1,
        },
      ];
    });

    setShowSelectionModal(false);
  };

  const handleProductClick = (product) => {
    if (product.category === 'CHARM') {
      setPendingProduct(product);
      setShowCustomizePopup(true);
      return;
    }

    addItemToSelection(product);
  };

  const updateSelectionQuantity = (draftKey, nextQuantity) => {
    setSelectedItems((prev) => {
      if (nextQuantity <= 0) {
        return prev.filter((entry) => entry.draftKey !== draftKey);
      }

      return prev.map((entry) =>
        entry.draftKey === draftKey
          ? { ...entry, quantity: nextQuantity }
          : entry
      );
    });
  };

  const removeSelectedItem = (draftKey) => {
    setSelectedItems((prev) => prev.filter((entry) => entry.draftKey !== draftKey));
  };

  const handleCustomizeSelected = (entry) => {
    if (entry.product.category !== 'CHARM') return;

    window.sessionStorage.setItem(
      CUSTOMIZE_PRODUCT_KEY,
      JSON.stringify(entry.product)
    );

    window.sessionStorage.setItem(
      'lumier-customize-payload',
      JSON.stringify({
        draftKey: entry.draftKey,
        customization: entry.customization || null,
      })
    );

    navigate(`/customize/${entry.product.id}?returnTo=products&draftKey=${encodeURIComponent(entry.draftKey)}`);
  };

  const handleCustomizeAccept = () => {
    if (!pendingProduct) return;

    window.sessionStorage.setItem(
      CUSTOMIZE_PRODUCT_KEY,
      JSON.stringify(pendingProduct)
    );

    window.sessionStorage.removeItem('lumier-customize-payload');
    setShowCustomizePopup(false);
    navigate(`/customize/${pendingProduct.id}?returnTo=products`);
  };

  const handleCustomizeDecline = () => {
    if (pendingProduct) {
      addItemToSelection(pendingProduct);
    }

    setShowCustomizePopup(false);
    setPendingProduct(null);
  };

  const handleConfirmAddAll = () => {
    if (selectedItems.length === 0) return;

    selectedItems.forEach((entry) => {
      for (let i = 0; i < entry.quantity; i += 1) {
        addItem(entry.product, entry.customization || null);
      }
    });

    showToast(
      t(
        'Đã thêm {count} sản phẩm vào giỏ hàng!',
        'Added {count} items to cart!',
        { count: totalSelectedCount }
      )
    );
    setSelectedItems([]);
    setPendingProduct(null);
    setShowSelectionModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-golan text-3xl md:text-4xl font-bold text-brand-charcoal mb-3">
          {t('Sản phẩm', 'Products')}
        </h1>
        <p className="font-san text-sm text-brand-muted">
          {t(
            'Khám phá kệ sách Lumier — nơi mỗi cuốn sách là một tác phẩm nghệ thuật',
            'Explore the Lumier bookshelf, where every book becomes a crafted artwork.'
          )}
        </p>
      </div>

      {/* Local search in products page */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t(
              'Tìm nhanh sản phẩm ngay trong kệ sách...',
              'Quick search products right from the shelf...'
            )}
            className="w-full rounded-2xl border-2 border-brand-cream-dark bg-white py-3.5 pl-11 pr-4 font-san text-sm"
          />
        </div>
      </div>

      {/* "Not found" message from search redirect */}
      {shouldCustomize && searchQuery && (
        <div className="bg-brand-amber/10 border border-brand-amber/30 rounded-xl px-5 py-4 mb-8">
          <p className="font-san text-sm text-brand-charcoal">
            {t(
              'Sản phẩm "{q}" đang tìm không có sẵn.',
              'The product "{q}" is not available right now.',
              { q: searchQuery }
            )}{' '}
            <span className="text-brand-amber font-medium">
              {t('Cùng customize nhé! ✨', "Let's customize one! ✨")}
            </span>
          </p>
        </div>
      )}

      {/* Main layout: Shelf + Ranking sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Bookshelf */}
        {productsLoading ? (
          <div className="rounded-2xl border border-brand-cream-dark bg-white p-8 text-center">
            <p className="font-san text-sm text-brand-muted">
              {t('Đang tải sản phẩm...', 'Loading products...')}
            </p>
          </div>
        ) : (
          <BookshelfUI
            products={products}
            onProductClick={handleProductClick}
            selectedProductId={pendingProduct?.id}
            selectedQuantities={selectedQuantities}
            searchTerm={searchTerm}
          />
        )}

        {/* Sidebar: Bestseller Ranking */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ProductRanking products={products} />
          </div>
        </aside>
      </div>

      {/* === Pricing Table === */}
      <div className="mt-6 bg-white rounded-2xl p-8 shadow-sm mb-24">
        <h2 className="font-golan text-2xl font-bold text-brand-charcoal mb-6">
          {t('Bảng Giá', 'Pricing Table')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full font-san text-sm">
            <thead>
              <tr className="border-b-2 border-brand-cream-dark">
                <th className="text-left py-3 px-4 font-semibold text-brand-charcoal uppercase tracking-wider text-xs">
                  {t('Phân loại', 'Category')}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-brand-charcoal uppercase tracking-wider text-xs">
                  {t('Giá', 'Price')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-brand-charcoal uppercase tracking-wider text-xs">
                  {t('Chú thích', 'Notes')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-cream">
                <td className="py-3 px-4">{t('Sách có sẵn', 'Ready-made Bookcharm')}</td>
                <td className="py-3 px-4 text-right font-semibold text-brand-amber">
                  {formatCurrency(100000)}
                </td>
                <td className="py-3 px-4 text-brand-muted">
                  {t('Bookcharm với bìa có sẵn', 'Bookcharm with ready-made cover')}
                </td>
              </tr>
              <tr className="border-b border-brand-cream">
                <td className="py-3 px-4">{t('Sách tự tay lựa', 'Custom Cover Bookcharm')}</td>
                <td className="py-3 px-4 text-right font-semibold text-brand-amber">
                  {formatCurrency(150000)}
                </td>
                <td className="py-3 px-4 text-brand-muted">
                  {t(
                    'Upload hoặc chọn bìa tùy ý (+50.000đ)',
                    'Upload or pick your own cover (+50,000 VND)'
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">{t('Customize khác', 'Other customization')}</td>
                <td className="py-3 px-4 text-right font-semibold text-brand-amber">
                  {t('50.000đ/lần', '50,000 VND / option')}
                </td>
                <td className="py-3 px-4 text-brand-muted">
                  {t('Khắc tên, chọn màu gáy...', 'Name engraving, spine color, and more...')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* === Modals === */}
      {showCustomizePopup && pendingProduct && (
        <CustomizePopup
          product={pendingProduct}
          title={t('Tùy chỉnh những dấu ấn riêng của bạn chứ?', 'Do you want to personalize this item?')}
          description={t(
            '{name} sẽ nổi bật hơn nếu bạn cá nhân hóa ngay bây giờ.',
            '{name} will stand out even more with your personal touch.',
            { name: pendingProduct.name }
          )}
          acceptLabel={t('Đồng ý', 'Yes')}
          declineLabel={t('Để sau', 'Maybe later')}
          hintText={t(
            'Bạn vẫn có thể thêm bản mặc định vào danh sách Đang chọn và xác nhận ở bước cuối',
            'You can still keep the default version in your selection and confirm at the final step.'
          )}
          onAccept={handleCustomizeAccept}
          onDecline={handleCustomizeDecline}
          onClose={() => {
            setShowCustomizePopup(false);
            setPendingProduct(null);
          }}
        />
      )}

      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[85] w-[min(96vw,980px)] bg-white/95 backdrop-blur-md border border-brand-cream-dark rounded-2xl shadow-2xl">
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-san text-xs uppercase tracking-wider text-brand-muted">
                {t('Đang chọn', 'Selected')}
              </p>
              <p className="font-golan text-lg font-bold text-brand-charcoal">
                {t('{count} sản phẩm', '{count} items', { count: totalSelectedCount })} • {formatCurrency(totalSelectedPrice)}
              </p>
              {charmCustomizationSummary.total > 0 && (
                <p className="font-san text-xs text-brand-muted mt-0.5">
                  {t('Charm đã customize', 'Customized charms')}: {charmCustomizationSummary.customized}/{charmCustomizationSummary.total}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSelectionModal(true)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-brand-cream-dark font-san text-xs md:text-sm text-brand-charcoal hover:border-brand-amber"
              >
                {t('Chi tiết', 'Details')}
              </button>
              <button
                onClick={handleConfirmAddAll}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy text-white font-san text-xs md:text-sm font-medium hover:bg-brand-deep-blue"
              >
                <ShoppingBag size={14} />
                {t('Xác nhận thêm vào giỏ', 'Confirm add to cart')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSelectionModal && selectedItems.length > 0 && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setShowSelectionModal(false)}
          />

          <div className="relative bg-white rounded-2xl border border-brand-cream-dark shadow-2xl w-[min(96vw,920px)] max-h-[86vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-cream-dark flex items-center justify-between">
              <div>
                <p className="font-san text-xs uppercase tracking-wider text-brand-muted">
                  {t('Đang chọn', 'Selected')}
                </p>
                <p className="font-golan text-lg font-bold text-brand-charcoal">
                  {t('{count} sản phẩm', '{count} items', { count: totalSelectedCount })} • {formatCurrency(totalSelectedPrice)}
                </p>
                {charmCustomizationSummary.total > 0 && (
                  <p className="font-san text-xs text-brand-muted mt-0.5">
                    {t('Charm đã customize', 'Customized charms')}: {charmCustomizationSummary.customized}/{charmCustomizationSummary.total}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="w-9 h-9 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-charcoal hover:border-brand-amber"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 md:p-5 max-h-[58vh] overflow-y-auto">
              <div className="space-y-2">
                {selectedItems.filter((entry) => entry?.product?.id).map((entry) => (
                  <div key={entry.draftKey} className="flex items-center justify-between gap-3 border border-brand-cream rounded-xl px-3 py-2">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-11 h-14 rounded-md overflow-hidden bg-brand-cream-dark flex items-center justify-center text-sm font-semibold text-brand-navy">
                        {entry.product.image ? (
                          <img
                            src={entry.product.image}
                            alt={entry.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          'L'
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-san text-sm font-medium text-brand-charcoal truncate">{entry.product.name}</p>
                        <p className="font-san text-xs text-brand-muted">
                          {formatCurrency(entry.product.basePrice)} / {t('sản phẩm', 'item')}
                        </p>
                        {entry.product.category === 'CHARM' && (
                          <span
                            className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-[11px] font-san ${
                              entry.customization
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {entry.customization ? t('Đã customize', 'Customized') : t('Chưa customize', 'Not customized yet')}
                          </span>
                        )}
                        {entry.product.category === 'CHARM' && (
                          <button
                            onClick={() => handleCustomizeSelected(entry)}
                            className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-brand-cream-dark text-xs font-san text-brand-charcoal hover:border-brand-amber"
                          >
                            <Sparkles size={12} />
                            Customize
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSelectionQuantity(entry.draftKey, entry.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-charcoal hover:border-brand-amber"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-san text-sm font-semibold text-brand-charcoal min-w-6 text-center">{entry.quantity}</span>
                      <button
                        onClick={() => updateSelectionQuantity(entry.draftKey, entry.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-charcoal hover:border-brand-amber"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeSelectedItem(entry.draftKey)}
                        className="w-7 h-7 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-muted hover:text-red-500 hover:border-red-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSelectionModal(false)}
                className="px-4 py-2.5 rounded-xl border border-brand-cream-dark font-san text-sm text-brand-charcoal"
              >
                {t('Đóng', 'Close')}
              </button>
              <button
                onClick={handleConfirmAddAll}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy text-white font-san text-sm font-medium hover:bg-brand-deep-blue"
              >
                <ShoppingBag size={14} />
                {t('Xác nhận thêm vào giỏ', 'Confirm add to cart')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
