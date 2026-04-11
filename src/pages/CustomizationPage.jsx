import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Product3DPreview from '../components/products/Product3DPreview';
import CustomizationControls from '../components/products/CustomizationControls';
import CustomizePopup from '../components/products/CustomizePopup';
import { CHARM_TYPES, SPINE_COLORS, PRICING } from '../config/constants';
import { fetchProductById } from '../services/products';

const SELECTION_DRAFT_KEY = 'lumier-products-selection-draft';
const CUSTOMIZE_PAYLOAD_KEY = 'lumier-customize-payload';

function createDraftKey(productId) {
  return `custom:${productId}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
}

export default function CustomizationPage() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const draftKeyFromQuery = searchParams.get('draftKey') || null;
  const returnToProducts = searchParams.get('returnTo') === 'products';

  const initialPayload = useMemo(() => {
    try {
      const raw = window.sessionStorage.getItem(CUSTOMIZE_PAYLOAD_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      return parsed?.customization || null;
    } catch {
      return null;
    }
  }, []);

  // State Management
  const [charmType, setCharmType] = useState(initialPayload?.charmType || CHARM_TYPES[0].id);
  const [engravedText, setEngravedText] = useState(initialPayload?.engravedText || '');
  const [spineColor, setSpineColor] = useState(initialPayload?.spineColor || SPINE_COLORS[0].id);
  const [showFinalizePopup, setShowFinalizePopup] = useState(false);
  const [focusSpinePreview, setFocusSpinePreview] = useState(false);
  
  const [customCover, setCustomCover] = useState(initialPayload?.customCover ? { mocked: true } : null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(initialPayload?.customCover || null);

  const nextAction = searchParams.get('next') === 'checkout' ? 'checkout' : 'cart';

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const data = await fetchProductById(productId);
        if (mounted) {
          setProduct(data);
        }
      } catch {
        if (mounted) {
          setProduct(null);
        }
      } finally {
        if (mounted) {
          setIsLoadingProduct(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  if (isLoadingProduct) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <p className="font-san text-brand-muted text-lg mb-4">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
       <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <p className="font-san text-brand-muted text-lg mb-4">Không tìm thấy sản phẩm</p>
          <button onClick={() => navigate('/san-pham')} className="px-6 py-2 bg-brand-navy text-white rounded-full">
            Quay lại tủ sách
          </button>
       </div>
    );
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomCover(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const totalPrice = useMemo(() => {
    let price = product.basePrice || PRICING.BASE_CHARM;
    if (customCover) price += PRICING.CUSTOM_COVER;
    if (engravedText.trim()) price += PRICING.CUSTOMIZE_ADDON;
    return price;
  }, [customCover, engravedText, product?.basePrice]);

  const handleConfirm = () => {
    setShowFinalizePopup(true);
  };

  const handleFinalizeAccept = () => {
    const customization = {
      charmType,
      engravedText: engravedText.trim() || null,
      spineColor,
      customCover: coverPreviewUrl,
    };

    if (returnToProducts) {
      let savedToDraft = false;

      try {
        const raw = window.sessionStorage.getItem(SELECTION_DRAFT_KEY);
        const currentDraft = raw ? JSON.parse(raw) : [];
        const draftArray = Array.isArray(currentDraft) ? currentDraft : [];

        let nextDraft = draftArray;
        if (draftKeyFromQuery) {
          let updated = false;
          nextDraft = draftArray.map((entry) => {
            if (entry?.draftKey === draftKeyFromQuery) {
              updated = true;
              return {
                ...entry,
                customization,
              };
            }

            return entry;
          });

          if (!updated) {
            nextDraft = [
              ...nextDraft,
              {
                draftKey: createDraftKey(product.id),
                product,
                customization,
                quantity: 1,
              },
            ];
          }
        } else {
          nextDraft = [
            ...draftArray,
            {
              draftKey: createDraftKey(product.id),
              product,
              customization,
              quantity: 1,
            },
          ];
        }

        window.sessionStorage.setItem(SELECTION_DRAFT_KEY, JSON.stringify(nextDraft));
        window.sessionStorage.removeItem(CUSTOMIZE_PAYLOAD_KEY);
        savedToDraft = true;
      } catch {
        savedToDraft = false;
      }

      if (savedToDraft) {
        showToast(`${product.name} (đã tùy chỉnh) đã lưu vào mục Đang chọn.`);
        setShowFinalizePopup(false);
        navigate('/san-pham');
        return;
      }

      // Fallback: if draft save fails unexpectedly, keep user action by adding to cart.
      addItem(product, customization);
      showToast(`${product.name} (đã tùy chỉnh) đã được thêm vào giỏ hàng!`);
      setShowFinalizePopup(false);
      navigate('/san-pham');
      return;
    }

    addItem(product, customization);
    showToast(`${product.name} (đã thiết kế 3D) đã được thêm vào giỏ hàng!`);
    setShowFinalizePopup(false);

    if (nextAction === 'checkout') {
      navigate('/thanh-toan');
      return;
    }

    navigate('/san-pham');
  };

  const handleFinalizeDecline = () => {
    setShowFinalizePopup(false);
    window.sessionStorage.removeItem(CUSTOMIZE_PAYLOAD_KEY);
    navigate('/san-pham');
  };

  const handleCancel = () => {
    navigate('/san-pham');
  };

  return (
    <div className="bg-brand-cream overflow-hidden h-full">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left: 3D Canvas */}
        <div className="flex-1 min-h-[500px] lg:min-h-0 relative h-full">
           <Product3DPreview 
              charmTypeId={charmType}
              spineColorId={spineColor}
              engravedText={engravedText}
              coverPreviewUrl={coverPreviewUrl}
              fallbackCoverUrl={product.image}
              focusSpine={focusSpinePreview}
           />
        </div>

        {/* Right: Controls Panel */}
        <div className="w-full lg:w-[450px] xl:w-[500px] h-auto lg:h-full shadow-2xl lg:shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)] z-10 relative bg-white">
           <CustomizationControls 
              product={product}
              charmType={charmType} setCharmType={setCharmType}
              engravedText={engravedText} setEngravedText={setEngravedText}
              spineColor={spineColor} setSpineColor={setSpineColor}
              handleCoverUpload={handleCoverUpload}
              totalPrice={totalPrice}
                onEngravingFocusChange={setFocusSpinePreview}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
           />
        </div>
      </div>

      {showFinalizePopup && (
        <CustomizePopup
          product={product}
          title="Hoàn tất thiết kế và thêm vào giỏ?"
          description="Bạn có muốn lưu phiên bản đã tùy chỉnh này không?"
          acceptLabel="Đồng ý"
          declineLabel="Hủy"
          hintText="Hủy sẽ quay lại kệ sách và không lưu bản tùy chỉnh hiện tại"
          onAccept={handleFinalizeAccept}
          onDecline={handleFinalizeDecline}
          onClose={handleFinalizeDecline}
        />
      )}
    </div>
  );
}
