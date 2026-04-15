import { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldAlert, ShieldCheck, Plus, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  createAdminAuthor,
  createAdminProduct,
  deleteAdminAuthor,
  deleteAdminProduct,
  fetchAdminExploreDashboard,
  fetchAdminOrders,
  fetchAdminUsers,
  updateAdminAudiobook,
  updateAdminAuthor,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminUserRole,
  uploadAdminAudio,
  uploadAdminImage,
} from '../services/admin';

const EMPTY_PRODUCT = {
  id: '',
  name: '',
  category: 'CHARM',
  basePrice: '',
  imageUrl: '',
  isAvailable: true,
  audiobookTitle: '',
  audiobookAuthorId: '',
  audiobookAuthorName: '',
  audiobookNarrator: '',
  audiobookDurationMinutes: '',
  audiobookSummary: '',
  audiobookAudioFileUrl: '',
  audiobookAudioFormat: 'mp3',
};

const EMPTY_AUTHOR = {
  id: '',
  name: '',
  bio: '',
  avatarUrl: '',
  featuredWorks: '',
  infoImage1: '',
  infoImage2: '',
  infoImage3: '',
  displayOrder: '',
  isActive: true,
};

const EMPTY_AUDIOBOOK = {
  id: '',
  title: '',
  productId: '',
  productName: '',
  authorId: '',
  authorName: '',
  narrator: '',
  durationMinutes: '',
  summary: '',
  audioFileUrl: '',
  audioFormat: '',
  displayOrder: '0',
  isActive: true,
};

function toProductForm(item) {
  return {
    ...EMPTY_PRODUCT,
    id: item?.id ? String(item.id) : '',
    name: item?.name || '',
    category: item?.category || 'CHARM',
    basePrice: item?.basePrice != null ? String(item.basePrice) : '',
    imageUrl: item?.imageUrl || '',
    isAvailable: item?.isAvailable ?? true,
  };
}

function toAuthorForm(item) {
  return {
    ...EMPTY_AUTHOR,
    id: item?.id ? String(item.id) : '',
    name: item?.name || '',
    bio: item?.bio || '',
    avatarUrl: item?.avatarUrl || '',
    featuredWorks: item?.featuredWorks || '',
    infoImage1: item?.infoImage1 || '',
    infoImage2: item?.infoImage2 || '',
    infoImage3: item?.infoImage3 || '',
    displayOrder: item?.displayOrder != null ? String(item.displayOrder) : '',
    isActive: item?.isActive ?? true,
  };
}

function toAudiobookForm(item) {
  return {
    ...EMPTY_AUDIOBOOK,
    id: item?.id ? String(item.id) : '',
    title: item?.title || '',
    productId: item?.productId ? String(item.productId) : '',
    productName: item?.productName || '',
    authorId: item?.authorId ? String(item.authorId) : '',
    authorName: item?.authorName || '',
    narrator: item?.narrator || '',
    durationMinutes: item?.durationMinutes ? String(item.durationMinutes) : '',
    summary: item?.summary || '',
    audioFileUrl: item?.audioFileUrl || '',
    audioFormat: item?.audioFormat || '',
    displayOrder: String(item?.displayOrder ?? 0),
    isActive: Boolean(item?.isActive),
  };
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading, loginWithGoogle } = useAuth();
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const [tab, setTab] = useState('products');
  const [dashboard, setDashboard] = useState({ products: [], authors: [], audiobooks: [] });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [authorForm, setAuthorForm] = useState(EMPTY_AUTHOR);
  const [audiobookForm, setAudiobookForm] = useState(EMPTY_AUDIOBOOK);

  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadState, setUploadState] = useState({
    active: false,
    type: null,
    label: '',
    fileName: '',
    progress: 0,
    status: 'idle',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const statusAnchorRef = useRef(null);

  const resetFeedbackState = ({ includeUpload = true } = {}) => {
    setError('');
    setSuccess('');
    if (includeUpload) {
      setUploadState({
        active: false,
        type: null,
        label: '',
        fileName: '',
        progress: 0,
        status: 'idle',
        message: '',
      });
    }
  };

  const scrollToStatus = () => {
    requestAnimationFrame(() => {
      statusAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSelectProduct = (item) => {
    resetFeedbackState();
    setProductForm(toProductForm(item));
  };

  const handleCreateProductDraft = () => {
    resetFeedbackState();
    setProductForm(EMPTY_PRODUCT);
  };

  const selectedProduct = useMemo(
    () => dashboard.products.find((item) => String(item.id) === String(productForm.id)) || null,
    [dashboard.products, productForm.id]
  );

  const selectedAuthor = useMemo(
    () => dashboard.authors.find((item) => String(item.id) === String(authorForm.id)) || null,
    [dashboard.authors, authorForm.id]
  );

  const selectedAudiobook = useMemo(
    () => dashboard.audiobooks.find((item) => String(item.id) === String(audiobookForm.id)) || null,
    [dashboard.audiobooks, audiobookForm.id]
  );

  const loadAll = async () => {
    if (!user?.googleId) {
      return;
    }

    setIsFetching(true);
    setError('');
    try {
      const [exploreData, orderData, userData] = await Promise.all([
        fetchAdminExploreDashboard(user.googleId),
        fetchAdminOrders(user.googleId),
        fetchAdminUsers(user.googleId),
      ]);

      setDashboard(exploreData);
      setOrders(orderData);
      setUsers(userData);

      if (!productForm.id && exploreData.products[0]) {
        setProductForm(toProductForm(exploreData.products[0]));
      }
      if (!authorForm.id && exploreData.authors[0]) {
        setAuthorForm(toAuthorForm(exploreData.authors[0]));
      }
      if (!audiobookForm.id && exploreData.audiobooks[0]) {
        setAudiobookForm(toAudiobookForm(exploreData.audiobooks[0]));
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Không thể tải dashboard admin.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin && user?.googleId) {
      loadAll();
    }
  }, [isAuthenticated, isAdmin, user?.googleId]);

  const handleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại.');
    }
  };

  const handleUploadImage = async (file, onSuccess, label = 'Ảnh') => {
    if (!file || !user?.googleId) {
      return;
    }

    setIsSaving(true);
    setUploadState({
      active: true,
      type: 'image',
      label,
      fileName: file.name || '',
      progress: 0,
      status: 'uploading',
      message: 'Đang upload ảnh...',
    });
    setError('');
    setSuccess('');
    try {
      const result = await uploadAdminImage({
        googleId: user.googleId,
        file,
        onProgress: ({ progress }) => {
          const isUploadedToBackend = typeof progress === 'number' && progress >= 100;
          setUploadState((prev) => ({
            ...prev,
            progress: progress ?? prev.progress,
            message: progress == null
              ? 'Đang upload ảnh...'
              : isUploadedToBackend
                ? 'Đã upload 100%, đang xử lý và lưu ảnh trên server...'
                : `Đang upload ảnh... ${progress}%`,
          }));
        },
      });
      onSuccess(result.url);
      setSuccess('Upload ảnh thành công.');
      setUploadState((prev) => ({
        ...prev,
        active: false,
        progress: 100,
        status: 'success',
        message: 'Upload ảnh thành công.',
      }));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Upload ảnh thất bại.');
      const timeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
      setUploadState((prev) => ({
        ...prev,
        active: false,
        status: 'error',
        message: timeout
          ? 'Upload ảnh bị timeout. Vui lòng thử lại hoặc giảm dung lượng file.'
          : (err?.response?.data?.error || err?.message || 'Upload ảnh thất bại.'),
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAudio = async (file, onSuccess, label = 'Audio') => {
    if (!file || !user?.googleId) {
      return;
    }

    setIsSaving(true);
    setUploadState({
      active: true,
      type: 'audio',
      label,
      fileName: file.name || '',
      progress: 0,
      status: 'uploading',
      message: 'Đang upload audio...',
    });
    setError('');
    setSuccess('');
    try {
      const result = await uploadAdminAudio({
        googleId: user.googleId,
        file,
        onProgress: ({ progress }) => {
          const isUploadedToBackend = typeof progress === 'number' && progress >= 100;
          setUploadState((prev) => ({
            ...prev,
            progress: progress ?? prev.progress,
            message: progress == null
              ? 'Đang upload audio...'
              : isUploadedToBackend
                ? 'Đã upload 100%, đang xử lý và lưu audio trên server...'
                : `Đang upload audio... ${progress}%`,
          }));
        },
      });
      if (typeof onSuccess === 'function') {
        onSuccess(result.url);
      } else {
        setAudiobookForm((v) => ({ ...v, audioFileUrl: result.url }));
      }
      setSuccess('Upload audio thành công.');
      setUploadState((prev) => ({
        ...prev,
        active: false,
        progress: 100,
        status: 'success',
        message: 'Upload audio thành công.',
      }));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Upload audio thất bại.');
      const timeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
      setUploadState((prev) => ({
        ...prev,
        active: false,
        status: 'error',
        message: timeout
          ? 'Upload audio bị timeout. Vui lòng thử lại hoặc giảm dung lượng file.'
          : (err?.response?.data?.error || err?.message || 'Upload audio thất bại.'),
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const saveProduct = async (isCreate) => {
    if (!user?.googleId) {
      return;
    }

    const payload = {
      name: productForm.name,
      category: productForm.category,
      basePrice: productForm.basePrice ? Number(productForm.basePrice) : null,
      imageUrl: productForm.imageUrl,
      isAvailable: Boolean(productForm.isAvailable),
      audiobookTitle: productForm.audiobookTitle,
      audiobookAuthorId: productForm.audiobookAuthorId ? Number(productForm.audiobookAuthorId) : null,
      audiobookAuthorName: productForm.audiobookAuthorName,
      audiobookNarrator: productForm.audiobookNarrator,
      audiobookDurationMinutes: productForm.audiobookDurationMinutes ? Number(productForm.audiobookDurationMinutes) : null,
      audiobookSummary: productForm.audiobookSummary,
      audiobookAudioFileUrl: productForm.audiobookAudioFileUrl,
      audiobookAudioFormat: productForm.audiobookAudioFormat,
      audiobookCoverImageUrl: productForm.imageUrl,
    };

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isCreate) {
        const created = await createAdminProduct({ googleId: user.googleId, payload });
        setProductForm(toProductForm(created));
        setSuccess('Tạo sản phẩm thành công.');
        scrollToStatus();
      } else if (productForm.id) {
        const updated = await updateAdminProduct({
          googleId: user.googleId,
          productId: Number(productForm.id),
          payload,
        });
        setProductForm(toProductForm(updated));
        setSuccess('Cập nhật sản phẩm thành công.');
        scrollToStatus();
      }
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Lưu sản phẩm thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeProduct = async () => {
    if (!productForm.id || !user?.googleId) {
      return;
    }

    if (!window.confirm('Xóa sản phẩm này?')) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await deleteAdminProduct({ googleId: user.googleId, productId: Number(productForm.id) });
      setProductForm(EMPTY_PRODUCT);
      setSuccess('Đã xử lý xóa sản phẩm.');
      scrollToStatus();
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Xóa sản phẩm thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAuthor = async (isCreate) => {
    if (!user?.googleId) {
      return;
    }

    const payload = {
      name: authorForm.name,
      bio: authorForm.bio,
      avatarUrl: authorForm.avatarUrl,
      featuredWorks: authorForm.featuredWorks,
      infoImage1: authorForm.infoImage1,
      infoImage2: authorForm.infoImage2,
      infoImage3: authorForm.infoImage3,
      displayOrder: authorForm.displayOrder ? Number(authorForm.displayOrder) : null,
      isActive: Boolean(authorForm.isActive),
    };

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isCreate) {
        const created = await createAdminAuthor({ googleId: user.googleId, payload });
        setAuthorForm(toAuthorForm(created));
        setSuccess('Tạo tác giả thành công.');
      } else if (authorForm.id) {
        const updated = await updateAdminAuthor({
          googleId: user.googleId,
          authorId: Number(authorForm.id),
          payload,
        });
        setAuthorForm(toAuthorForm(updated));
        setSuccess('Cập nhật tác giả thành công.');
      }
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Lưu tác giả thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeAuthor = async () => {
    if (!authorForm.id || !user?.googleId) {
      return;
    }

    if (!window.confirm('Xóa tác giả này?')) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await deleteAdminAuthor({ googleId: user.googleId, authorId: Number(authorForm.id) });
      setAuthorForm(EMPTY_AUTHOR);
      setSuccess('Đã xóa tác giả.');
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Xóa tác giả thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAudiobook = async () => {
    if (!audiobookForm.id || !user?.googleId) {
      return;
    }

    const payload = {
      title: audiobookForm.title,
      productId: audiobookForm.productId ? Number(audiobookForm.productId) : null,
      productName: audiobookForm.productName,
      authorId: audiobookForm.authorId ? Number(audiobookForm.authorId) : null,
      authorName: audiobookForm.authorName,
      narrator: audiobookForm.narrator,
      durationMinutes: audiobookForm.durationMinutes ? Number(audiobookForm.durationMinutes) : null,
      summary: audiobookForm.summary,
      audioFileUrl: audiobookForm.audioFileUrl,
      audioFormat: audiobookForm.audioFormat,
      displayOrder: Number(audiobookForm.displayOrder || 0),
      isActive: Boolean(audiobookForm.isActive),
    };

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateAdminAudiobook({
        googleId: user.googleId,
        audiobookId: Number(audiobookForm.id),
        payload,
      });
      setSuccess('Cập nhật audiobook thành công.');
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Lưu audiobook thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const changeOrderStatus = async (orderId, status) => {
    if (!user?.googleId) {
      return;
    }
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateAdminOrderStatus({ googleId: user.googleId, orderId, status });
      setSuccess('Cập nhật trạng thái đơn hàng thành công.');
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Cập nhật đơn hàng thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const changeUserRole = async (userId, role) => {
    if (!user?.googleId) {
      return;
    }
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateAdminUserRole({ googleId: user.googleId, userId, role });
      setSuccess('Cập nhật role user thành công.');
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Cập nhật role thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <ShieldAlert className="mx-auto text-brand-amber mb-4" size={40} />
          <h1 className="font-golan text-2xl text-brand-charcoal mb-2">Admin Dashboard</h1>
          <p className="font-san text-sm text-brand-muted mb-6">Vui lòng đăng nhập tài khoản admin để truy cập.</p>
          <button type="button" onClick={handleLogin} disabled={isLoading} className="px-6 py-3 rounded-xl bg-brand-navy text-white font-san text-sm hover:bg-brand-deep-blue transition-colors disabled:opacity-50">
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google'}
          </button>
          {error && <p className="font-san text-sm text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <ShieldAlert className="mx-auto text-red-500 mb-4" size={40} />
          <h1 className="font-golan text-2xl text-brand-charcoal mb-2">Không có quyền truy cập</h1>
          <p className="font-san text-sm text-brand-muted">Tài khoản của bạn không có role ADMIN.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div ref={statusAnchorRef} />
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-green-600" size={22} />
        <h1 className="font-golan text-2xl text-brand-charcoal">Admin Data Dashboard</h1>
      </div>

      <div className="flex flex-wrap gap-2 bg-brand-cream rounded-xl p-1">
        {['products', 'authors', 'audiobooks', 'orders', 'users'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg font-san text-sm ${tab === key ? 'bg-white shadow text-brand-charcoal' : 'text-brand-muted'}`}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      {error && <p className="font-san text-sm text-red-500">{error}</p>}
      {success && <p className="font-san text-sm text-green-600">{success}</p>}
      {isFetching && <p className="font-san text-sm text-brand-muted">Đang tải dữ liệu...</p>}

      {(uploadState.active || uploadState.status === 'error' || uploadState.status === 'success') && (
        <div className="bg-white border border-brand-cream-dark rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <p className="font-san text-sm text-brand-charcoal">
              {uploadState.label || 'Upload'}
              {uploadState.fileName ? ` - ${uploadState.fileName}` : ''}
            </p>
            <span className={`font-san text-xs ${uploadState.status === 'error' ? 'text-red-500' : uploadState.status === 'success' ? 'text-green-600' : 'text-brand-muted'}`}>
              {uploadState.status === 'uploading' && (
                uploadState.progress >= 100
                  ? 'Đang xử lý server...'
                  : (uploadState.progress ? `${uploadState.progress}%` : 'Đang xử lý...')
              )}
              {uploadState.status === 'success' && 'Thành công'}
              {uploadState.status === 'error' && 'Lỗi'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-brand-cream overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${uploadState.status === 'error' ? 'bg-red-400' : uploadState.status === 'success' ? 'bg-green-500' : 'bg-brand-navy'}`}
              style={{ width: `${Math.max(5, uploadState.progress || 0)}%` }}
            />
          </div>
          <p className={`font-san text-xs ${uploadState.status === 'error' ? 'text-red-500' : 'text-brand-muted'}`}>
            {uploadState.message}
          </p>
        </div>
      )}

      {tab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-golan text-lg">Products</h2>
              <button type="button" className="text-brand-navy" onClick={handleCreateProductDraft}><Plus size={18} /></button>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-auto">
              {dashboard.products.map((p) => (
                <button key={p.id} type="button" onClick={() => handleSelectProduct(p)} className={`w-full text-left rounded-xl p-3 border ${String(productForm.id) === String(p.id) ? 'border-brand-amber bg-brand-amber/5' : 'border-brand-cream-dark'}`}>
                  <p className="font-san text-sm font-semibold">{p.name}</p>
                  <p className="font-san text-xs text-brand-muted">{p.category} - #{p.id}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-3">
            <h2 className="font-golan text-lg">Thông tin Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={productForm.name} onChange={(e) => setProductForm((v) => ({ ...v, name: e.target.value }))} placeholder="Tên sản phẩm" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <select value={productForm.category} onChange={(e) => setProductForm((v) => ({ ...v, category: e.target.value }))} className="border rounded-lg px-3 py-2 font-san text-sm">
                <option value="CHARM">CHARM</option>
                <option value="BOOKMARK">BOOKMARK</option>
                <option value="NOTEBOOK">NOTEBOOK</option>
              </select>
              <input type="number" min="1" value={productForm.basePrice} onChange={(e) => setProductForm((v) => ({ ...v, basePrice: e.target.value }))} placeholder="Giá" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <label className="inline-flex items-center gap-2 font-san text-sm"><input type="checkbox" checked={productForm.isAvailable} onChange={(e) => setProductForm((v) => ({ ...v, isAvailable: e.target.checked }))} /> Có sẵn</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <input value={productForm.imageUrl} onChange={(e) => setProductForm((v) => ({ ...v, imageUrl: e.target.value }))} placeholder="URL ảnh sản phẩm" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer font-san text-sm">
                <Upload size={16} /> Upload ảnh
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => setProductForm((v) => ({ ...v, imageUrl: url })), 'Ảnh sản phẩm')} />
              </label>
            </div>

            {productForm.category === 'CHARM' && (
              <div className="border rounded-xl p-3 space-y-3 bg-brand-cream/40">
                <p className="font-san text-sm font-semibold">Thông tin audiobook (bắt buộc khi tạo CHARM mới)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={productForm.audiobookTitle} onChange={(e) => setProductForm((v) => ({ ...v, audiobookTitle: e.target.value }))} placeholder="Tiêu đề audiobook" className="border rounded-lg px-3 py-2 font-san text-sm" />
                  <input value={productForm.audiobookNarrator} onChange={(e) => setProductForm((v) => ({ ...v, audiobookNarrator: e.target.value }))} placeholder="Người đọc" className="border rounded-lg px-3 py-2 font-san text-sm" />
                  <select value={productForm.audiobookAuthorId} onChange={(e) => setProductForm((v) => ({ ...v, audiobookAuthorId: e.target.value, audiobookAuthorName: '' }))} className="border rounded-lg px-3 py-2 font-san text-sm">
                    <option value="">Chọn tác giả có sẵn</option>
                    {dashboard.authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <input value={productForm.audiobookAuthorName} onChange={(e) => setProductForm((v) => ({ ...v, audiobookAuthorName: e.target.value, audiobookAuthorId: '' }))} placeholder="Hoặc nhập tác giả mới" className="border rounded-lg px-3 py-2 font-san text-sm" />
                  <input type="number" min="1" value={productForm.audiobookDurationMinutes} onChange={(e) => setProductForm((v) => ({ ...v, audiobookDurationMinutes: e.target.value }))} placeholder="Thời lượng (phút)" className="border rounded-lg px-3 py-2 font-san text-sm" />
                  <input value={productForm.audiobookAudioFormat} onChange={(e) => setProductForm((v) => ({ ...v, audiobookAudioFormat: e.target.value }))} placeholder="Định dạng audio" className="border rounded-lg px-3 py-2 font-san text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                  <input value={productForm.audiobookAudioFileUrl} onChange={(e) => setProductForm((v) => ({ ...v, audiobookAudioFileUrl: e.target.value }))} placeholder="URL file audio" className="w-full border rounded-lg px-3 py-2 font-san text-sm" />
                  <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer font-san text-sm">
                    <Upload size={16} /> Import mp3
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleUploadAudio(e.target.files?.[0], (url) => setProductForm((v) => ({ ...v, audiobookAudioFileUrl: url })), 'Audio CHARM mới')}
                    />
                  </label>
                </div>
                <textarea rows={3} value={productForm.audiobookSummary} onChange={(e) => setProductForm((v) => ({ ...v, audiobookSummary: e.target.value }))} placeholder="Tóm tắt audiobook" className="w-full border rounded-lg px-3 py-2 font-san text-sm" />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" disabled={isSaving} onClick={() => saveProduct(!productForm.id)} className="px-4 py-2 bg-brand-navy text-white rounded-lg font-san text-sm disabled:opacity-50">{productForm.id ? 'Cập nhật' : 'Tạo mới'}</button>
              {selectedProduct && <button type="button" disabled={isSaving} onClick={removeProduct} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-san text-sm inline-flex items-center gap-1"><Trash2 size={14} /> Xóa</button>}
            </div>
          </div>
        </div>
      )}

      {tab === 'authors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-golan text-lg">Book Authors</h2>
              <button type="button" className="text-brand-navy" onClick={() => setAuthorForm(EMPTY_AUTHOR)}><Plus size={18} /></button>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-auto">
              {dashboard.authors.map((a) => (
                <button key={a.id} type="button" onClick={() => setAuthorForm(toAuthorForm(a))} className={`w-full text-left rounded-xl p-3 border ${String(authorForm.id) === String(a.id) ? 'border-brand-amber bg-brand-amber/5' : 'border-brand-cream-dark'}`}>
                  <p className="font-san text-sm font-semibold">{a.name}</p>
                  <p className="font-san text-xs text-brand-muted">Order {a.displayOrder}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-3">
            <h2 className="font-golan text-lg">Thông tin Tác giả</h2>
            <input value={authorForm.name} onChange={(e) => setAuthorForm((v) => ({ ...v, name: e.target.value }))} placeholder="Tên tác giả" className="w-full border rounded-lg px-3 py-2 font-san text-sm" />
            <textarea rows={3} value={authorForm.bio} onChange={(e) => setAuthorForm((v) => ({ ...v, bio: e.target.value }))} placeholder="Bio" className="w-full border rounded-lg px-3 py-2 font-san text-sm" />
            <input value={authorForm.featuredWorks} onChange={(e) => setAuthorForm((v) => ({ ...v, featuredWorks: e.target.value }))} placeholder="Featured works (phân tách bằng |)" className="w-full border rounded-lg px-3 py-2 font-san text-sm" />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <input value={authorForm.avatarUrl} onChange={(e) => setAuthorForm((v) => ({ ...v, avatarUrl: e.target.value }))} placeholder="URL avatar" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer font-san text-sm">
                <Upload size={16} /> Upload avatar
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => setAuthorForm((v) => ({ ...v, avatarUrl: url })), 'Avatar tác giả')} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="space-y-2">
                  <input value={authorForm[`infoImage${idx}`]} onChange={(e) => setAuthorForm((v) => ({ ...v, [`infoImage${idx}`]: e.target.value }))} placeholder={`URL ảnh info ${idx}`} className="w-full border rounded-lg px-3 py-2 font-san text-sm" />
                  <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer font-san text-xs">
                    <Upload size={14} /> Upload ảnh {idx}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => setAuthorForm((v) => ({ ...v, [`infoImage${idx}`]: url })), `Ảnh info tác giả ${idx}`)} />
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={authorForm.displayOrder} onChange={(e) => setAuthorForm((v) => ({ ...v, displayOrder: e.target.value }))} placeholder="Display order" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <label className="inline-flex items-center gap-2 font-san text-sm"><input type="checkbox" checked={authorForm.isActive} onChange={(e) => setAuthorForm((v) => ({ ...v, isActive: e.target.checked }))} /> Active</label>
            </div>

            <div className="flex gap-2">
              <button type="button" disabled={isSaving} onClick={() => saveAuthor(!authorForm.id)} className="px-4 py-2 bg-brand-navy text-white rounded-lg font-san text-sm disabled:opacity-50">{authorForm.id ? 'Cập nhật' : 'Tạo mới'}</button>
              {selectedAuthor && <button type="button" disabled={isSaving} onClick={removeAuthor} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-san text-sm inline-flex items-center gap-1"><Trash2 size={14} /> Xóa</button>}
            </div>
          </div>
        </div>
      )}

      {tab === 'audiobooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-golan text-lg mb-3">Audiobooks</h2>
            <div className="space-y-2 max-h-[520px] overflow-auto">
              {dashboard.audiobooks.map((a) => (
                <button key={a.id} type="button" onClick={() => setAudiobookForm(toAudiobookForm(a))} className={`w-full text-left rounded-xl p-3 border ${String(audiobookForm.id) === String(a.id) ? 'border-brand-amber bg-brand-amber/5' : 'border-brand-cream-dark'}`}>
                  <p className="font-san text-sm font-semibold">{a.title}</p>
                  <p className="font-san text-xs text-brand-muted">#{a.id} - {a.productName}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-3">
            <h2 className="font-golan text-lg">Cập nhật Audiobook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={audiobookForm.title} onChange={(e) => setAudiobookForm((v) => ({ ...v, title: e.target.value }))} placeholder="Tiêu đề" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <select value={audiobookForm.productId} onChange={(e) => setAudiobookForm((v) => ({ ...v, productId: e.target.value }))} className="border rounded-lg px-3 py-2 font-san text-sm">
                <option value="">Chọn CHARM</option>
                {dashboard.products.filter((p) => p.category === 'CHARM').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={audiobookForm.authorId} onChange={(e) => setAudiobookForm((v) => ({ ...v, authorId: e.target.value, authorName: '' }))} className="border rounded-lg px-3 py-2 font-san text-sm">
                <option value="">Chọn tác giả</option>
                {dashboard.authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input value={audiobookForm.authorName} onChange={(e) => setAudiobookForm((v) => ({ ...v, authorName: e.target.value, authorId: '' }))} placeholder="Hoặc nhập tác giả" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <input value={audiobookForm.narrator} onChange={(e) => setAudiobookForm((v) => ({ ...v, narrator: e.target.value }))} placeholder="Người đọc" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <input type="number" min="1" value={audiobookForm.durationMinutes} onChange={(e) => setAudiobookForm((v) => ({ ...v, durationMinutes: e.target.value }))} placeholder="Thời lượng" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <input value={audiobookForm.audioFormat} onChange={(e) => setAudiobookForm((v) => ({ ...v, audioFormat: e.target.value }))} placeholder="Format" className="border rounded-lg px-3 py-2 font-san text-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <input value={audiobookForm.audioFileUrl} onChange={(e) => setAudiobookForm((v) => ({ ...v, audioFileUrl: e.target.value }))} placeholder="URL audio" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer font-san text-sm">
                <Upload size={16} /> Upload audio
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleUploadAudio(e.target.files?.[0], null, 'Audio audiobook')} />
              </label>
            </div>

            <textarea rows={4} value={audiobookForm.summary} onChange={(e) => setAudiobookForm((v) => ({ ...v, summary: e.target.value }))} placeholder="Summary" className="w-full border rounded-lg px-3 py-2 font-san text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={audiobookForm.displayOrder} onChange={(e) => setAudiobookForm((v) => ({ ...v, displayOrder: e.target.value }))} placeholder="Display order" className="border rounded-lg px-3 py-2 font-san text-sm" />
              <label className="inline-flex items-center gap-2 font-san text-sm"><input type="checkbox" checked={audiobookForm.isActive} onChange={(e) => setAudiobookForm((v) => ({ ...v, isActive: e.target.checked }))} /> Active</label>
            </div>
            <button type="button" disabled={isSaving || !selectedAudiobook} onClick={saveAudiobook} className="px-4 py-2 bg-brand-navy text-white rounded-lg font-san text-sm disabled:opacity-50">Cập nhật audiobook</button>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm overflow-auto">
          <h2 className="font-golan text-lg mb-4">Order Management</h2>
          <table className="w-full min-w-[900px] font-san text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="py-2">#{order.id}</td>
                  <td>{order.customerName || order.customerEmail}</td>
                  <td>{Number(order.totalAmount || 0).toLocaleString('vi-VN')}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <select value={order.status} onChange={(e) => changeOrderStatus(order.id, e.target.value)} className="border rounded px-2 py-1">
                      {['PENDING', 'PAID', 'SHIPPED'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm overflow-auto">
          <h2 className="font-golan text-lg mb-4">User Management</h2>
          <table className="w-full min-w-[900px] font-san text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="py-2">{item.name || '-'}</td>
                  <td>{item.email}</td>
                  <td>{item.role}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '-'}</td>
                  <td>
                    <select value={item.role} onChange={(e) => changeUserRole(item.id, e.target.value)} className="border rounded px-2 py-1">
                      {['CUSTOMER', 'ADMIN'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
