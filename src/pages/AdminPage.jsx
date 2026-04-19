import { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldAlert, ShieldCheck, Plus, Trash2, Upload, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import {
  createAdminBlog,
  createAdminAuthor,
  createAdminProduct,
  deleteAdminBlog,
  deleteAdminAuthor,
  deleteAdminProduct,
  fetchAdminChatbotInsights,
  fetchAdminBlogs,
  fetchAdminExploreDashboard,
  fetchAdminUmamiAnalytics,
  fetchAdminOrders,
  fetchAdminUsers,
  updateAdminBlog,
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

const EMPTY_BLOG = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '',
  coverImageUrl: '',
  sourceName: 'Lumier',
  seoTitle: '',
  seoDescription: '',
  isPublished: false,
  publishedAt: '',
};

const ANALYTICS_PERIOD_OPTIONS = [
  { value: 'last-24-hours', labelVi: '24 giờ qua', labelEn: 'Last 24 hours' },
  { value: 'last-3-days', labelVi: '3 ngày qua', labelEn: 'Last 3 days' },
  { value: 'last-7-days', labelVi: '7 ngày qua', labelEn: 'Last 7 days' },
  { value: 'last-30-days', labelVi: '30 ngày qua', labelEn: 'Last 30 days' },
  { value: 'custom', labelVi: 'Tuỳ chọn', labelEn: 'Custom range' },
];

const COUNTRY_NAME_RESOLVER = typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['vi', 'en'], { type: 'region' })
  : null;

function getCountryDisplayName(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '-';
  }

  const normalized = raw.toUpperCase();
  if (COUNTRY_NAME_RESOLVER && /^[A-Z]{2}$/.test(normalized)) {
    const resolved = COUNTRY_NAME_RESOLVER.of(normalized);
    if (resolved && resolved !== normalized) {
      return resolved;
    }
  }

  return raw;
}

function toDatetimeLocalInput(ms) {
  if (!ms) {
    return '';
  }
  const date = new Date(ms);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getPresetDurationMs(period) {
  switch (period) {
    case 'last-24-hours':
      return 24 * 60 * 60 * 1000;
    case 'last-3-days':
      return 3 * 24 * 60 * 60 * 1000;
    case 'last-7-days':
      return 7 * 24 * 60 * 60 * 1000;
    case 'last-30-days':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function formatTimelineTick(timestamp, durationMs) {
  if (!timestamp) {
    return '-';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  if (durationMs != null && durationMs <= 48 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

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

function toBlogForm(item) {
  const normalizedDate = item?.publishedAt
    ? new Date(item.publishedAt).toISOString().slice(0, 16)
    : '';

  return {
    ...EMPTY_BLOG,
    id: item?.id ? String(item.id) : '',
    title: item?.title || '',
    slug: item?.slug || '',
    excerpt: item?.excerpt || '',
    contentHtml: item?.contentHtml || '',
    coverImageUrl: item?.coverImageUrl || '',
    sourceName: item?.sourceName || 'Lumier',
    seoTitle: item?.seoTitle || '',
    seoDescription: item?.seoDescription || '',
    isPublished: Boolean(item?.isPublished),
    publishedAt: normalizedDate,
  };
}

export default function AdminPage() {
  const isAnalyticsEnabled = true;
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading, loginWithGoogle } = useAuth();
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const [tab, setTab] = useState('products');
  const [dashboard, setDashboard] = useState({ products: [], authors: [], audiobooks: [] });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [chatbotInsights, setChatbotInsights] = useState({
    totalProfilesWithPreferences: 0,
    questions: [],
    entries: [],
  });
  const [umamiAnalytics, setUmamiAnalytics] = useState({
    configured: false,
    message: null,
    startAt: null,
    endAt: null,
    visitors: 0,
    pageviews: 0,
    visits: 0,
    bounces: 0,
    totalTime: 0,
    bounceRate: null,
    timeline: [],
    pages: [],
    referrers: [],
    browsers: [],
    operatingSystems: [],
    devices: [],
    channels: [],
    countries: [],
  });
  const [analyticsPeriod, setAnalyticsPeriod] = useState('last-24-hours');
  const [analyticsCustomStart, setAnalyticsCustomStart] = useState('');
  const [analyticsCustomEnd, setAnalyticsCustomEnd] = useState('');
  const [analyticsHoveredBar, setAnalyticsHoveredBar] = useState(null);
  const [isAnalyticsFetching, setIsAnalyticsFetching] = useState(false);
  const [analyticsLastFetchedAt, setAnalyticsLastFetchedAt] = useState(null);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [authorForm, setAuthorForm] = useState(EMPTY_AUTHOR);
  const [audiobookForm, setAudiobookForm] = useState(EMPTY_AUDIOBOOK);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG);

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

  const chatbotQuestionLabels = useMemo(
    () => ({
      genre: t('Thể loại sách yêu thích', 'Favorite book genres'),
      readingTime: t('Thời điểm đọc sách', 'Reading time preference'),
      recentBook: t('Cuốn sách gần nhất', 'Latest book read'),
    }),
    [t]
  );

  const chatbotOptionLabels = useMemo(
    () => ({
      classic: t('Văn học kinh điển', 'Classic literature'),
      selfhelp: t('Self-help', 'Self-help'),
      novel: t('Tiểu thuyết', 'Novels'),
      science: t('Khoa học', 'Science'),
      poetry: t('Thơ ca', 'Poetry'),
      morning: t('Buổi sáng', 'Morning'),
      noon: t('Trưa', 'Noon'),
      evening: t('Chiều tối', 'Evening'),
      'before-sleep': t('Trước khi ngủ', 'Before sleeping'),
      anytime: t('Bất kỳ lúc nào', 'Anytime'),
      alchemist: t('Nhà Giả Kim', 'The Alchemist'),
      'how-to-win': t('Đắc Nhân Tâm', 'How to Win Friends and Influence People'),
      'yellow-flowers': t('Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Yellow Flowers on the Green Grass'),
      'youth-worth': t('Tuổi Trẻ Đáng Giá Bao Nhiêu', 'How Much Is Youth Worth?'),
      other: t('Sách khác', 'Other book'),
    }),
    [t]
  );

  const hasValidCustomRange = useMemo(() => {
    if (analyticsPeriod !== 'custom') {
      return true;
    }
    if (!analyticsCustomStart || !analyticsCustomEnd) {
      return false;
    }
    const start = new Date(analyticsCustomStart);
    const end = new Date(analyticsCustomEnd);
    return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start < end;
  }, [analyticsPeriod, analyticsCustomStart, analyticsCustomEnd]);

  const analyticsView = useMemo(() => {
    const timeline = Array.isArray(umamiAnalytics.timeline)
      ? umamiAnalytics.timeline.map((item, index) => ({
        index,
        label: item?.timestamp ? new Date(item.timestamp).toLocaleString('vi-VN') : `#${index + 1}`,
        timestamp: item?.timestamp || null,
        pageviews: Number(item?.pageviews || 0),
        sessions: Number(item?.sessions || 0),
      }))
      : [];

    const timelinePeak = Math.max(
      ...timeline.map((item) => Math.max(item.sessions, item.pageviews)),
      1
    );
    const roundedPeak = timelinePeak <= 4 ? 4 : Math.ceil(timelinePeak / 5) * 5;
    const avgVisitDurationSeconds = umamiAnalytics.visits > 0
      ? Math.round((umamiAnalytics.totalTime || 0) / umamiAnalytics.visits)
      : null;

    const chartWidth = 980;
    const chartHeight = 320;
    const chartPadding = { top: 20, right: 24, bottom: 42, left: 24 };
    const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
    const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    const barGap = 10;
    const barWidth = timeline.length > 0
      ? Math.max(10, (innerWidth - barGap * Math.max(0, timeline.length - 1)) / timeline.length)
      : 14;
    const selectedDurationMs = analyticsPeriod === 'custom' && hasValidCustomRange
      ? (new Date(analyticsCustomEnd).getTime() - new Date(analyticsCustomStart).getTime())
      : getPresetDurationMs(analyticsPeriod);

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      ratio,
      value: Math.round(roundedPeak * (1 - ratio)),
      y: chartPadding.top + innerHeight * ratio,
    }));

    const xTickStep = Math.max(1, Math.ceil(timeline.length / 8));
    const chartBars = timeline.map((item, index) => {
      const pageviewsHeight = roundedPeak > 0 ? Math.max(2, (item.pageviews / roundedPeak) * innerHeight) : 2;
      const visitorsHeight = roundedPeak > 0 ? Math.max(2, (item.sessions / roundedPeak) * innerHeight) : 2;
      const x = chartPadding.left + index * (barWidth + barGap);
      const pageviewsY = chartPadding.top + innerHeight - pageviewsHeight;
      const visitorsY = chartPadding.top + innerHeight - visitorsHeight;
      const showTick = index % xTickStep === 0 || index === timeline.length - 1;

      return {
        ...item,
        x,
        width: barWidth,
        pageviewsHeight,
        visitorsHeight,
        pageviewsY,
        visitorsY,
        showTick,
        tickLabel: formatTimelineTick(item.timestamp, selectedDurationMs),
      };
    });

    return {
      timeline,
      timelinePeak: roundedPeak,
      avgVisitDurationSeconds,
      chartWidth,
      chartHeight,
      chartPadding,
      innerHeight,
      chartBars,
      yTicks,
      selectedDurationMs,
    };
  }, [umamiAnalytics, analyticsPeriod, analyticsCustomStart, analyticsCustomEnd, hasValidCustomRange]);

  const canShiftForward = useMemo(() => {
    if (analyticsPeriod !== 'custom' || !hasValidCustomRange) {
      return false;
    }

    const end = new Date(analyticsCustomEnd).getTime();
    return end < Date.now() - 60 * 1000;
  }, [analyticsPeriod, analyticsCustomEnd, hasValidCustomRange]);

  const renderBreakdownRows = (rows, options = {}) => {
    const showFullCountry = options.type === 'country';
    if (!Array.isArray(rows) || rows.length === 0) {
      return (
        <p className="font-san text-sm text-brand-muted">
          {t('Chưa có dữ liệu.', 'No data available yet.')}
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {rows.map((row, index) => {
          const visitors = Number(row?.visitors || 0);
          const displayName = showFullCountry
            ? getCountryDisplayName(row?.name)
            : (row?.name || '-');

          return (
            <div key={`${row?.name || 'item'}-${index}`} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b last:border-b-0 py-2">
              <p className="font-san text-sm text-brand-charcoal truncate" title={displayName}>{displayName}</p>
              <p className="font-san text-sm font-medium text-brand-charcoal min-w-[100px] text-right">
                {visitors.toLocaleString('vi-VN')} {t('visitors', 'visitors')}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds || 0);
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
      return '--';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainSeconds}s`;
    }
    return `${remainSeconds}s`;
  };

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

  const selectedBlog = useMemo(
    () => blogs.find((item) => String(item.id) === String(blogForm.id)) || null,
    [blogs, blogForm.id]
  );

  const loadCoreData = async () => {
    if (!user?.googleId) {
      return;
    }

    setIsFetching(true);
    setError('');
    try {
      const [exploreData, orderData, userData, blogData, chatbotData] = await Promise.all([
        fetchAdminExploreDashboard(user.googleId),
        fetchAdminOrders(user.googleId),
        fetchAdminUsers(user.googleId),
        fetchAdminBlogs(user.googleId),
        fetchAdminChatbotInsights(user.googleId),
      ]);

      setDashboard(exploreData);
      setOrders(orderData);
      setUsers(userData);
      setBlogs(blogData);
      setChatbotInsights(chatbotData);

      if (!productForm.id && exploreData.products[0]) {
        setProductForm(toProductForm(exploreData.products[0]));
      }
      if (!authorForm.id && exploreData.authors[0]) {
        setAuthorForm(toAuthorForm(exploreData.authors[0]));
      }
      if (!audiobookForm.id && exploreData.audiobooks[0]) {
        setAudiobookForm(toAudiobookForm(exploreData.audiobooks[0]));
      }
      if (!blogForm.id && blogData[0]) {
        setBlogForm(toBlogForm(blogData[0]));
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Không thể tải dashboard admin.');
    } finally {
      setIsFetching(false);
    }
  };

  const loadAnalyticsData = async () => {
    if (!user?.googleId) {
      return;
    }

    setIsAnalyticsFetching(true);
    setError('');
    try {
      let startAt;
      let endAt;
      if (analyticsPeriod === 'custom') {
        const startDate = analyticsCustomStart ? new Date(analyticsCustomStart) : null;
        const endDate = analyticsCustomEnd ? new Date(analyticsCustomEnd) : null;
        if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) {
          setError(t('Vui lòng chọn khoảng thời gian hợp lệ cho custom range.', 'Please select a valid custom time range.'));
          setIsAnalyticsFetching(false);
          return;
        }
        startAt = startDate.getTime();
        endAt = endDate.getTime();
      }

      const analyticsData = await fetchAdminUmamiAnalytics({
        googleId: user.googleId,
        period: analyticsPeriod === 'custom' ? undefined : analyticsPeriod,
        startAt,
        endAt,
      });
      setUmamiAnalytics(analyticsData);
      setAnalyticsLastFetchedAt(new Date());
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Không thể tải Umami analytics.');
    } finally {
      setIsAnalyticsFetching(false);
    }
  };

  const shiftAnalyticsWindow = (direction) => {
    const now = Date.now();
    const customStartMs = analyticsCustomStart ? new Date(analyticsCustomStart).getTime() : null;
    const customEndMs = analyticsCustomEnd ? new Date(analyticsCustomEnd).getTime() : null;

    let baseStart = customStartMs;
    let baseEnd = customEndMs;
    let duration = (baseStart != null && baseEnd != null) ? (baseEnd - baseStart) : null;

    if (analyticsPeriod !== 'custom' || !hasValidCustomRange || duration == null || duration <= 0) {
      duration = getPresetDurationMs(analyticsPeriod);
      if (duration == null) {
        return;
      }
      baseEnd = now;
      baseStart = now - duration;
    }

    let nextStart = baseStart + (duration * direction);
    let nextEnd = baseEnd + (duration * direction);

    if (nextEnd > now) {
      nextEnd = now;
      nextStart = now - duration;
    }

    setAnalyticsPeriod('custom');
    setAnalyticsCustomStart(toDatetimeLocalInput(nextStart));
    setAnalyticsCustomEnd(toDatetimeLocalInput(nextEnd));
  };

  const loadAll = async () => {
    await loadCoreData();
    if (isAnalyticsEnabled && tab === 'analytics') {
      await loadAnalyticsData();
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin && user?.googleId) {
      loadCoreData();
    }
  }, [isAuthenticated, isAdmin, user?.googleId]);

  useEffect(() => {
    if (isAnalyticsEnabled && isAuthenticated && isAdmin && user?.googleId && tab === 'analytics' && hasValidCustomRange) {
      loadAnalyticsData();
    }
  }, [isAnalyticsEnabled, tab, analyticsPeriod, isAuthenticated, isAdmin, user?.googleId, hasValidCustomRange]);

  useEffect(() => {
    if (!(isAnalyticsEnabled && isAuthenticated && isAdmin && user?.googleId && tab === 'analytics' && hasValidCustomRange)) {
      return;
    }

    const timer = setInterval(() => {
      loadAnalyticsData();
    }, 60000);

    return () => clearInterval(timer);
  }, [isAnalyticsEnabled, isAuthenticated, isAdmin, user?.googleId, tab, analyticsPeriod, hasValidCustomRange]);

  useEffect(() => {
    if (analyticsPeriod !== 'custom') {
      return;
    }

    if (analyticsCustomStart && analyticsCustomEnd) {
      return;
    }

    const defaultEnd = umamiAnalytics.endAt || Date.now();
    const defaultStart = umamiAnalytics.startAt || (defaultEnd - 24 * 60 * 60 * 1000);
    setAnalyticsCustomStart(toDatetimeLocalInput(defaultStart));
    setAnalyticsCustomEnd(toDatetimeLocalInput(defaultEnd));
  }, [analyticsPeriod, analyticsCustomStart, analyticsCustomEnd, umamiAnalytics.startAt, umamiAnalytics.endAt]);

  useEffect(() => {
    if (!isAnalyticsEnabled && tab === 'analytics') {
      setTab('products');
    }
  }, [isAnalyticsEnabled, tab]);

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

  const slugify = (value) => (
    (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  );

  const handleCreateBlogDraft = () => {
    resetFeedbackState();
    setBlogForm(EMPTY_BLOG);
  };

  const handleSelectBlog = (item) => {
    resetFeedbackState();
    setBlogForm(toBlogForm(item));
  };

  const saveBlog = async (isCreate) => {
    if (!user?.googleId) {
      return;
    }

    const computedSlug = slugify(blogForm.slug || blogForm.title);
    if (!computedSlug) {
      setError('Vui lòng nhập tiêu đề hoặc slug hợp lệ.');
      return;
    }

    const payload = {
      title: blogForm.title,
      slug: computedSlug,
      excerpt: blogForm.excerpt,
      contentHtml: blogForm.contentHtml,
      coverImageUrl: blogForm.coverImageUrl,
      sourceName: blogForm.sourceName,
      seoTitle: blogForm.seoTitle,
      seoDescription: blogForm.seoDescription,
      isPublished: Boolean(blogForm.isPublished),
      publishedAt: blogForm.isPublished && blogForm.publishedAt
        ? new Date(blogForm.publishedAt).toISOString()
        : null,
    };

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isCreate) {
        const created = await createAdminBlog({ googleId: user.googleId, payload });
        setBlogForm(toBlogForm(created));
        setSuccess('Tạo bài viết thành công.');
      } else if (blogForm.id) {
        const updated = await updateAdminBlog({
          googleId: user.googleId,
          blogId: Number(blogForm.id),
          payload,
        });
        setBlogForm(toBlogForm(updated));
        setSuccess('Cập nhật bài viết thành công.');
      }
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Lưu bài viết thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeBlog = async () => {
    if (!blogForm.id || !user?.googleId) {
      return;
    }

    if (!window.confirm('Xóa bài viết này?')) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await deleteAdminBlog({ googleId: user.googleId, blogId: Number(blogForm.id) });
      setBlogForm(EMPTY_BLOG);
      setSuccess('Đã xóa bài viết.');
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Xóa bài viết thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadBlogContentImage = async (file) => {
    await handleUploadImage(
      file,
      (url) => {
        setBlogForm((prev) => {
          const content = prev.contentHtml || '';
          const imageTag = `<p><img src="${url}" alt="Blog image" /></p>`;
          return {
            ...prev,
            contentHtml: content ? `${content}\n${imageTag}` : imageTag,
          };
        });
      },
      'Ảnh trong nội dung blog'
    );
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
        {[
          'products',
          'authors',
          'audiobooks',
          'blogs',
          'orders',
          'users',
          'chatbot',
          ...(isAnalyticsEnabled ? ['analytics'] : []),
        ].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg font-san text-sm ${tab === key ? 'bg-white shadow text-brand-charcoal' : 'text-brand-muted'}`}
          >
            {key === 'chatbot' ? 'CHATBOT' : key === 'analytics' ? 'ANALYTICS' : key.toUpperCase()}
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

      {tab === 'blogs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-golan text-lg">Blogs</h2>
              <button type="button" className="text-brand-navy" onClick={handleCreateBlogDraft}><Plus size={18} /></button>
            </div>
            <div className="space-y-2 max-h-[560px] overflow-auto">
              {blogs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectBlog(item)}
                  className={`w-full text-left rounded-xl p-3 border ${String(blogForm.id) === String(item.id) ? 'border-brand-amber bg-brand-amber/5' : 'border-brand-cream-dark'}`}
                >
                  <p className="font-san text-sm font-semibold line-clamp-2">{item.title}</p>
                  <p className="font-san text-xs text-brand-muted mt-1">
                    /{item.slug} {item.isPublished ? '· Published' : '· Draft'}
                  </p>
                </button>
              ))}
              {blogs.length === 0 && (
                <p className="font-san text-sm text-brand-muted">Chưa có bài viết nào.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-3">
            <h2 className="font-golan text-lg">Tạo/Cập nhật bài viết</h2>

            <input
              value={blogForm.title}
              onChange={(e) => setBlogForm((v) => ({ ...v, title: e.target.value }))}
              placeholder="Tiêu đề bài viết"
              className="w-full border rounded-lg px-3 py-2 font-san text-sm"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={blogForm.slug}
                onChange={(e) => setBlogForm((v) => ({ ...v, slug: e.target.value }))}
                placeholder="Slug (vd: bai-viet-seo-lumier)"
                className="border rounded-lg px-3 py-2 font-san text-sm"
              />
              <input
                value={blogForm.sourceName}
                onChange={(e) => setBlogForm((v) => ({ ...v, sourceName: e.target.value }))}
                placeholder="Nguồn hiển thị (vd: Lumier, BaiLearn)"
                className="border rounded-lg px-3 py-2 font-san text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <input
                value={blogForm.coverImageUrl}
                onChange={(e) => setBlogForm((v) => ({ ...v, coverImageUrl: e.target.value }))}
                placeholder="URL ảnh bìa"
                className="border rounded-lg px-3 py-2 font-san text-sm"
              />
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer font-san text-sm">
                <Upload size={16} /> Upload ảnh bìa
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => setBlogForm((v) => ({ ...v, coverImageUrl: url })), 'Ảnh bìa blog')}
                />
              </label>
            </div>

            <textarea
              rows={3}
              value={blogForm.excerpt}
              onChange={(e) => setBlogForm((v) => ({ ...v, excerpt: e.target.value }))}
              placeholder="Mô tả ngắn"
              className="w-full border rounded-lg px-3 py-2 font-san text-sm"
            />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <textarea
                rows={11}
                value={blogForm.contentHtml}
                onChange={(e) => setBlogForm((v) => ({ ...v, contentHtml: e.target.value }))}
                placeholder="Nội dung HTML của blog"
                className="w-full border rounded-lg px-3 py-2 font-san text-sm"
              />
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer font-san text-sm">
                <Upload size={16} /> Upload ảnh vào nội dung
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadBlogContentImage(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={blogForm.seoTitle}
                onChange={(e) => setBlogForm((v) => ({ ...v, seoTitle: e.target.value }))}
                placeholder="SEO title (optional)"
                className="border rounded-lg px-3 py-2 font-san text-sm"
              />
              <input
                value={blogForm.seoDescription}
                onChange={(e) => setBlogForm((v) => ({ ...v, seoDescription: e.target.value }))}
                placeholder="SEO description (optional)"
                className="border rounded-lg px-3 py-2 font-san text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="inline-flex items-center gap-2 font-san text-sm">
                <input
                  type="checkbox"
                  checked={blogForm.isPublished}
                  onChange={(e) => setBlogForm((v) => ({ ...v, isPublished: e.target.checked }))}
                />
                Published
              </label>
              <input
                type="datetime-local"
                value={blogForm.publishedAt}
                onChange={(e) => setBlogForm((v) => ({ ...v, publishedAt: e.target.value }))}
                className="border rounded-lg px-3 py-2 font-san text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => saveBlog(!blogForm.id)}
                className="px-4 py-2 bg-brand-navy text-white rounded-lg font-san text-sm disabled:opacity-50"
              >
                {blogForm.id ? 'Cập nhật' : 'Tạo mới'}
              </button>
              {selectedBlog && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={removeBlog}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-san text-sm inline-flex items-center gap-1"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              )}
            </div>
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

      {tab === 'chatbot' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-golan text-lg mb-2">
              {t('Tổng hợp lựa chọn từ Chatbot', 'Chatbot Preference Insights')}
            </h2>
            <p className="font-san text-sm text-brand-muted">
              {t('Số tài khoản đã lưu lựa chọn: ', 'Accounts with saved preferences: ')}
              <span className="font-semibold text-brand-charcoal">{chatbotInsights.totalProfilesWithPreferences}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-1 gap-4">
              {chatbotInsights.questions.map((question) => (
                <div key={question.questionKey} className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-san text-base font-semibold text-brand-charcoal">
                    {chatbotQuestionLabels[question.questionKey] || question.questionKey}
                  </h3>
                  <p className="font-san text-xs text-brand-muted mt-1 mb-3">
                    {t('Số phản hồi: ', 'Responses: ')}
                    {question.responses || 0}
                  </p>
                  <div className="space-y-2">
                    {question.options?.map((option) => {
                      const responses = Number(question.responses || 0);
                      const count = Number(option.count || 0);
                      const ratio = responses > 0 ? Math.round((count / responses) * 100) : 0;

                      return (
                        <div key={option.optionKey}>
                          <div className="flex items-center justify-between font-san text-sm text-brand-charcoal">
                            <span>{chatbotOptionLabels[option.optionKey] || option.optionKey}</span>
                            <span>{count} ({ratio}%)</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-brand-cream">
                            <div className="h-full rounded-full bg-brand-navy" style={{ width: `${ratio}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-golan text-lg mb-3">
                {t('Danh sách user đã chọn trong chatbot', 'User Preference List From Chatbot')}
              </h3>
              <div className="overflow-auto max-h-[640px]">
                <table className="w-full min-w-[760px] font-san text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">{t('User', 'User')}</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">{t('Thể loại', 'Genre')}</th>
                      <th className="py-2 pr-3">{t('Thời điểm đọc', 'Reading time')}</th>
                      <th className="py-2 pr-3">{t('Sách gần nhất', 'Recent book')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatbotInsights.entries?.map((entry) => (
                      <tr key={entry.userId || `${entry.email}-${entry.updatedAt || 'na'}`} className="border-b last:border-b-0">
                        <td className="py-2 pr-3">{entry.name || '-'}</td>
                        <td className="py-2 pr-3">{entry.email || '-'}</td>
                        <td className="py-2 pr-3">{chatbotOptionLabels[entry.genreOption] || entry.genreOption || '-'}</td>
                        <td className="py-2 pr-3">{chatbotOptionLabels[entry.readingTimeOption] || entry.readingTimeOption || '-'}</td>
                        <td className="py-2 pr-3">{chatbotOptionLabels[entry.recentBookOption] || entry.recentBookOption || '-'}</td>
                      </tr>
                    ))}
                    {(!chatbotInsights.entries || chatbotInsights.entries.length === 0) && (
                      <tr>
                        <td className="py-4 text-brand-muted" colSpan={5}>
                          {t('Chưa có dữ liệu lựa chọn từ chatbot.', 'No chatbot preference data yet.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 text-slate-700 font-san text-sm"
            >
              <Filter size={14} />
              {t('Filter', 'Filter')}
            </button>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => shiftAnalyticsWindow(-1)}
                className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:opacity-50"
                aria-label="Previous analytics window"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => shiftAnalyticsWindow(1)}
                disabled={!canShiftForward && analyticsPeriod === 'custom'}
                className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:opacity-50"
                aria-label="Next analytics window"
              >
                <ChevronRight size={16} />
              </button>

              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="h-10 min-w-[180px] border border-slate-300 rounded-md px-3 py-2 font-san text-sm"
              >
                {ANALYTICS_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelVi, option.labelEn)}
                  </option>
                ))}
              </select>
              {analyticsPeriod === 'custom' && (
                <>
                  <input
                    type="datetime-local"
                    value={analyticsCustomStart}
                    onChange={(e) => setAnalyticsCustomStart(e.target.value)}
                    className="h-10 border border-slate-300 rounded-md px-3 py-2 font-san text-sm"
                    aria-label="Analytics custom start"
                  />
                  <input
                    type="datetime-local"
                    value={analyticsCustomEnd}
                    onChange={(e) => setAnalyticsCustomEnd(e.target.value)}
                    className="h-10 border border-slate-300 rounded-md px-3 py-2 font-san text-sm"
                    aria-label="Analytics custom end"
                  />
                </>
              )}
              <button
                type="button"
                onClick={loadAnalyticsData}
                className="h-10 px-4 py-2 bg-brand-navy text-white rounded-md font-san text-sm"
              >
                {t('Làm mới', 'Refresh')}
              </button>
            </div>
          </div>

          <p className="font-san text-xs text-brand-muted px-1">
            {isAnalyticsFetching
              ? t('Đang tải analytics...', 'Refreshing analytics...')
              : t('Lần cập nhật gần nhất: ', 'Last updated: ')
                + (analyticsLastFetchedAt
                  ? analyticsLastFetchedAt.toLocaleString('vi-VN')
                  : '--')}
          </p>

          {umamiAnalytics.configured && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <p className="font-san text-sm text-brand-muted">{t('Visitors', 'Visitors')}</p>
                  <p className="font-golan text-5xl leading-none text-brand-charcoal mt-4">
                    {Number(umamiAnalytics.visitors || 0).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <p className="font-san text-sm text-brand-muted">{t('Visits', 'Visits')}</p>
                  <p className="font-golan text-5xl leading-none text-brand-charcoal mt-4">
                    {Number(umamiAnalytics.visits || 0).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <p className="font-san text-sm text-brand-muted">{t('Views', 'Views')}</p>
                  <p className="font-golan text-5xl leading-none text-brand-charcoal mt-4">
                    {Number(umamiAnalytics.pageviews || 0).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <p className="font-san text-sm text-brand-muted">{t('Visit duration', 'Visit duration')}</p>
                  <p className="font-golan text-5xl leading-none text-brand-charcoal mt-4">
                    {formatDuration(analyticsView.avgVisitDurationSeconds)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <p className="font-san text-sm text-brand-muted">{t('Bounce rate', 'Bounce rate')}</p>
                  <p className="font-golan text-5xl leading-none text-brand-charcoal mt-4">
                    {umamiAnalytics.bounceRate == null
                      ? '--'
                      : `${Number(umamiAnalytics.bounceRate).toFixed(1)}%`}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-golan text-lg">{t('Traffic', 'Traffic')}</h3>
                  <p className="font-san text-xs text-brand-muted">
                    {t('Khoảng dữ liệu', 'Data window')}: {' '}
                    {umamiAnalytics.startAt ? new Date(umamiAnalytics.startAt).toLocaleString('vi-VN') : '-'}
                    {' '}→{' '}
                    {umamiAnalytics.endAt ? new Date(umamiAnalytics.endAt).toLocaleString('vi-VN') : '-'}
                  </p>
                </div>

                {analyticsView.chartBars.length > 0 ? (
                  <div className="space-y-3">
                    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white px-2 py-2">
                      <svg
                        viewBox={`0 0 ${analyticsView.chartWidth} ${analyticsView.chartHeight}`}
                        className="w-full min-w-[760px] h-[320px]"
                        role="img"
                        aria-label="Traffic timeline chart"
                      >
                        {analyticsView.yTicks.map((tick, idx) => (
                          <g key={`tick-${idx}`}>
                            <line
                              x1={analyticsView.chartPadding.left}
                              y1={tick.y}
                              x2={analyticsView.chartWidth - analyticsView.chartPadding.right}
                              y2={tick.y}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                            <text
                              x={analyticsView.chartPadding.left - 8}
                              y={tick.y + 4}
                              textAnchor="end"
                              className="fill-slate-500"
                              style={{ fontSize: 11 }}
                            >
                              {tick.value}
                            </text>
                          </g>
                        ))}

                        {analyticsView.chartBars.map((bar) => (
                          <g
                            key={bar.index}
                            onMouseEnter={() => setAnalyticsHoveredBar(bar)}
                            onMouseLeave={() => setAnalyticsHoveredBar(null)}
                          >
                            <rect
                              x={bar.x}
                              y={bar.pageviewsY}
                              width={bar.width}
                              height={bar.pageviewsHeight}
                              rx="4"
                              fill="#93c5fd"
                              fillOpacity="0.9"
                            />
                            <rect
                              x={bar.x}
                              y={bar.visitorsY}
                              width={bar.width}
                              height={bar.visitorsHeight}
                              rx="4"
                              fill="#2563eb"
                              fillOpacity="0.9"
                            />
                          </g>
                        ))}

                        {analyticsView.chartBars.map((bar) => (
                          bar.showTick ? (
                            <text
                              key={`xlabel-${bar.index}`}
                              x={bar.x + bar.width / 2}
                              y={analyticsView.chartHeight - 12}
                              textAnchor="middle"
                              className="fill-slate-500"
                              style={{ fontSize: 11 }}
                            >
                              {bar.tickLabel}
                            </text>
                          ) : null
                        ))}
                      </svg>
                    </div>

                    <div className="flex items-center gap-4 font-san text-sm text-brand-charcoal">
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />{t('Visitors', 'Visitors')}</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-300" />{t('Views', 'Views')}</span>
                    </div>

                    {analyticsHoveredBar && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-san text-sm text-brand-charcoal">
                        <p className="text-xs text-slate-500">{analyticsHoveredBar.label}</p>
                        <p>{t('Visitors', 'Visitors')}: {analyticsHoveredBar.sessions.toLocaleString('vi-VN')}</p>
                        <p>{t('Views', 'Views')}: {analyticsHoveredBar.pageviews.toLocaleString('vi-VN')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-san text-sm text-brand-muted">
                    {t('Chưa có timeline analytics cho khoảng thời gian đã chọn.', 'No analytics timeline available for selected range.')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <h3 className="font-golan text-lg mb-3">{t('Pages', 'Pages')}</h3>
                  {renderBreakdownRows(umamiAnalytics.pages)}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <h3 className="font-golan text-lg mb-3">{t('Referrers', 'Referrers')}</h3>
                  {renderBreakdownRows(umamiAnalytics.referrers)}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <h3 className="font-golan text-lg mb-3">{t('Environment', 'Environment')}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-san text-xs uppercase tracking-wide text-brand-muted mb-2">{t('Browsers', 'Browsers')}</p>
                      {renderBreakdownRows(umamiAnalytics.browsers)}
                    </div>
                    <div>
                      <p className="font-san text-xs uppercase tracking-wide text-brand-muted mb-2">{t('Operating Systems', 'Operating Systems')}</p>
                      {renderBreakdownRows(umamiAnalytics.operatingSystems)}
                    </div>
                    <div>
                      <p className="font-san text-xs uppercase tracking-wide text-brand-muted mb-2">{t('Devices', 'Devices')}</p>
                      {renderBreakdownRows(umamiAnalytics.devices)}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <h3 className="font-golan text-lg mb-3">{t('Traffic', 'Traffic')}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-san text-xs uppercase tracking-wide text-brand-muted mb-2">{t('Channels', 'Channels')}</p>
                      {renderBreakdownRows(umamiAnalytics.channels)}
                    </div>
                    <div>
                      <p className="font-san text-xs uppercase tracking-wide text-brand-muted mb-2">{t('Countries', 'Countries')}</p>
                      {renderBreakdownRows(umamiAnalytics.countries, { type: 'country' })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
