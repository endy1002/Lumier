import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, Package, BookOpen } from 'lucide-react';
import api from '../services/api';
import { SPINE_COLORS } from '../config/constants';

const ORDER_STATUS_MAP = {
  PENDING: { label: 'Đang xử lý', color: 'text-amber-700 bg-amber-100' },
  PAID: { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-50' },
  SHIPPED: { label: 'Đã giao thành công', color: 'text-green-700 bg-green-100' },
};

const ORDER_TIMELINE_STEPS = ['Đặt hàng', 'Xác nhận', 'Đang giao', 'Hoàn tất'];

const POLICY_CONTENT = {
  terms: {
    title: 'Điều khoản sử dụng (Terms of Use)',
    sections: [
      {
        heading: '1. Mục đích của trang web',
        body: 'Chào mừng bạn đến với LUMIER. Website này được xây dựng và vận hành hoàn toàn nhằm phục vụ cho dự án môn học Digital Marketing của sinh viên Đại học Kinh tế Thành phố Hồ Chí Minh (UEH). Nền tảng này tuyệt đối không phục vụ cho bất kỳ mục đích thương mại nào.',
      },
      {
        heading: '2. Giao dịch và Đặt hàng',
        body: 'Tất cả các sản phẩm (Bookcharm, Bookmark, Sổ note) cùng quy trình giỏ hàng và thanh toán trên website đều là mô phỏng (mockup). Việc bạn nhấn nút "Đặt hàng" sẽ không tạo ra bất kỳ giao dịch tài chính thực tế nào và cũng sẽ không có sản phẩm thực tế nào được giao đến bạn.',
      },
      {
        heading: '3. Tài khoản người dùng',
        body: 'Để trải nghiệm đầy đủ các tính năng như tùy biến sản phẩm 3D, nhận mã truy cập sách nói (Audiobook) hoặc theo dõi đơn hàng, bạn có thể được yêu cầu đăng nhập thông qua Google hoặc tạo tài khoản bằng Email. Bằng việc đăng nhập, bạn đồng ý tham gia trải nghiệm luồng tương tác của dự án.',
      },
      {
        heading: '4. Quyền sở hữu trí tuệ',
        body: 'Các hình ảnh, mô hình 3D, phong cách thiết kế và nội dung văn bản trên website được sử dụng cho mục đích giáo dục. Người dùng không được phép sao chép hay sử dụng các tài nguyên này cho các mục đích kinh doanh bên ngoài.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật (Privacy Policy)',
    sections: [
      {
        heading: '1. Thông tin chúng tôi thu thập',
        body: 'Khi bạn truy cập, đăng nhập hoặc tương tác với website, hệ thống sẽ thu thập các thông tin cơ bản gồm: họ tên, email, ảnh đại diện (khi đăng nhập Google OAuth2), thông tin liên lạc mô phỏng (số điện thoại, địa chỉ giao hàng bạn chủ động nhập), và dữ liệu hành vi/hệ thống như cấu hình sản phẩm trong giỏ hàng, UTM parameters, lịch sử tương tác chatbot AI.',
      },
      {
        heading: '2. Mục đích sử dụng dữ liệu',
        body: 'Dữ liệu chỉ được nhóm sinh viên UEH sử dụng trong khuôn khổ thực hành môn Digital Marketing: phân tích hành vi người dùng, đánh giá hiệu suất chiến dịch qua UTM, thiết lập email mô phỏng (ví dụ abandoned cart), và cá nhân hóa trải nghiệm như lịch sử mua hàng giả định/gợi ý sách.',
      },
      {
        heading: '3. Cam kết bảo vệ dữ liệu',
        body: 'Chúng tôi cam kết tôn trọng quyền riêng tư của bạn. Dữ liệu được lưu trữ an toàn trên máy chủ dự án và sẽ không bán, trao đổi hoặc chia sẻ cho bên thứ ba ngoài mục đích phục vụ chấm điểm và đánh giá học thuật của giảng viên.',
      },
      {
        heading: '4. Quyền của người dùng',
        body: 'Vì đây là hệ thống thử nghiệm, nếu bạn muốn xóa toàn bộ email hoặc dữ liệu trải nghiệm khỏi cơ sở dữ liệu dự án, bạn có thể liên hệ trực tiếp đội ngũ phát triển (sinh viên quản trị dự án) để được hỗ trợ xóa dữ liệu ngay lập tức.',
      },
    ],
  },
};

function getStatusStepIndex(status) {
  switch (String(status || '').toUpperCase()) {
    case 'PAID':
      return 1;
    case 'SHIPPED':
      return 3;
    case 'PENDING':
    default:
      return 0;
  }
}

function normalizeHexColor(value) {
  if (!value) return '';
  const normalized = String(value).trim().toUpperCase();
  return normalized.startsWith('#') ? normalized : `#${normalized}`;
}

const SPINE_COLOR_BY_HEX = SPINE_COLORS.reduce((acc, color) => {
  acc[normalizeHexColor(color.hex)] = color.label;
  return acc;
}, {});

const HARDWARE_TYPE_LABELS = {
  SILVER: 'Charm Bạc',
  GOLD: 'Charm Vàng',
};

function resolveSpineColorName(spineColorHex) {
  const normalized = normalizeHexColor(spineColorHex);
  return SPINE_COLOR_BY_HEX[normalized] || normalized || null;
}

function resolveHardwareLabel(hardwareType) {
  if (!hardwareType) return null;
  return HARDWARE_TYPE_LABELS[String(hardwareType).toUpperCase()] || hardwareType;
}

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, loginWithGoogle, logout } =
    useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState('orders');
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [revealedCodeRows, setRevealedCodeRows] = useState({});
  const [orderCodeLoadingRows, setOrderCodeLoadingRows] = useState({});
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState(null);

  useEffect(() => {
    const policyParam = String(searchParams.get('policy') || '').toLowerCase();
    if (policyParam === 'terms' || policyParam === 'privacy') {
      setActivePolicyModal(policyParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const userGoogleId = user?.googleId || user?.id;

    if (!isAuthenticated || !userGoogleId) {
      setOrders([]);
      setRevealedCodeRows({});
      return;
    }

    let mounted = true;
    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const { data } = await api.get('/orders/history', {
          params: { googleId: userGoogleId },
        });

        if (!mounted) {
          return;
        }

        const mapped = (data || []).map((order) => ({
          id: order.orderId,
          date: order.createdAt,
          status: String(order.status || 'PENDING').toUpperCase(),
          total: Number(order.totalAmount || 0),
          hasAudiobookCode: Boolean(order.hasAudiobookCode),
          audiobookCodes: Array.isArray(order.audiobookCodes) ? order.audiobookCodes.filter(Boolean) : [],
          items: (order.items || []).map((item) => ({
            id: item.id,
            productName: item.productName,
            quantity: item.quantity,
            subtotal: Number(item.itemSubtotal || 0),
            spineColorHex: item.spineColorHex,
            spineColorName: resolveSpineColorName(item.spineColorHex),
            engravedText: item.engravedText,
            hardwareType: item.hardwareType,
            hardwareLabel: resolveHardwareLabel(item.hardwareType),
            hasExtraChain: item.hasExtraChain,
            hasUploadedCover: item.hasUploadedCover,
            hasAudiobookCode: Boolean(item.hasAudiobookCode),
            audiobookCodes: Array.isArray(item.audiobookCodes) ? item.audiobookCodes.filter(Boolean) : [],
          })),
        }));

        setOrders(mapped);
        setRevealedCodeRows({});
      } catch (error) {
        if (mounted) {
          setOrdersError(error?.response?.data?.error || error?.message || 'Khong the tai lich su don hang');
        }
      } finally {
        if (mounted) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.googleId, user?.id]);

  const toggleCodeReveal = (orderId, itemId) => {
    const key = `${orderId}:${itemId}`;
    setRevealedCodeRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleOrderCodeReveal = async (orderId) => {
    const key = `${orderId}:order`;
    const isOpen = Boolean(revealedCodeRows[key]);

    if (isOpen) {
      setRevealedCodeRows((prev) => ({ ...prev, [key]: false }));
      return;
    }

    setOrderCodeLoadingRows((prev) => ({ ...prev, [orderId]: true }));
    try {
      const userGoogleId = user?.googleId || user?.id;
      const { data } = await api.get(`/orders/${orderId}/audiobook-codes`, {
        params: { googleId: userGoogleId },
      });

      const nextCodes = Array.isArray(data) ? data.filter(Boolean) : [];
      setOrders((prev) => prev.map((order) => (
        order.id === orderId
          ? {
            ...order,
            hasAudiobookCode: nextCodes.length > 0,
            audiobookCodes: nextCodes,
          }
          : order
      )));

      setRevealedCodeRows((prev) => ({ ...prev, [key]: true }));
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404) {
        try {
          const userGoogleId = user?.googleId || user?.id;
          const { data } = await api.get('/orders/history', {
            params: { googleId: userGoogleId },
          });

          const refreshedOrder = (data || []).find((o) => Number(o.orderId) === Number(orderId));
          const refreshedCodes = Array.isArray(refreshedOrder?.audiobookCodes)
            ? refreshedOrder.audiobookCodes.filter(Boolean)
            : [];

          setOrders((prev) => prev.map((order) => (
            order.id === orderId
              ? {
                ...order,
                hasAudiobookCode: refreshedCodes.length > 0,
                audiobookCodes: refreshedCodes,
              }
              : order
          )));
          setRevealedCodeRows((prev) => ({ ...prev, [key]: true }));
          return;
        } catch (fallbackError) {
          setOrdersError(fallbackError?.response?.data?.error || fallbackError?.message || 'Khong the tai code audio book');
        }
      } else {
        setOrdersError(error?.response?.data?.error || error?.message || 'Khong the tai code audio book');
      }

      setRevealedCodeRows((prev) => ({ ...prev, [key]: true }));
    } finally {
      setOrderCodeLoadingRows((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasAcceptedPolicies) {
      setLoginError('Vui lòng đọc và đồng ý Điều khoản sử dụng + Chính sách bảo mật trước khi đăng nhập.');
      return;
    }

    setLoginError('');
    try {
      await loginWithGoogle();
    } catch (error) {
      setLoginError(error?.message || 'Dang nhap Google that bai');
    }
  };

  const openPolicyModal = (policyType) => {
    setActivePolicyModal(policyType);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('policy', policyType);
      return next;
    }, { replace: true });
  };

  const closePolicyModal = () => {
    setActivePolicyModal(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('policy');
      return next;
    }, { replace: true });
  };

  const policy = activePolicyModal ? POLICY_CONTENT[activePolicyModal] : null;

  // === Login Screen ===
  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn size={32} className="text-brand-navy" />
            </div>
            <h1 className="font-golan text-2xl font-bold text-brand-charcoal mb-3">
              Đăng nhập
            </h1>
            <p className="font-san text-sm text-brand-muted mb-6">
              Đăng nhập để xem lịch sử mua hàng và quản lý tài khoản
            </p>

            <div className="mb-6 p-5 rounded-2xl border border-brand-cream-dark bg-brand-cream/35">
              <label className="mx-auto flex max-w-xl items-center justify-center gap-3 font-san text-base text-brand-charcoal leading-relaxed text-center">
                <input
                  type="checkbox"
                  checked={hasAcceptedPolicies}
                  onChange={(e) => setHasAcceptedPolicies(e.target.checked)}
                  className="w-5 h-5 shrink-0"
                />
                <span>
                  Tôi đã đọc và đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => openPolicyModal('terms')}
                    className="text-brand-navy underline font-semibold"
                  >
                    Điều khoản sử dụng
                  </button>{' '}
                  và{' '}
                  <button
                    type="button"
                    onClick={() => openPolicyModal('privacy')}
                    className="text-brand-navy underline font-semibold"
                  >
                    Chính sách bảo mật
                  </button>
                  .
                </span>
              </label>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-brand-cream-dark rounded-xl font-san text-sm font-medium hover:border-brand-amber hover:bg-brand-amber/5 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-brand-amber border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Đăng nhập bằng Google
                </>
              )}
            </button>

            {loginError && (
              <p className="font-san text-xs text-red-500 mt-3">{loginError}</p>
            )}
          </div>
        </div>

        {policy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-brand-cream-dark flex items-center justify-between">
                <h2 className="font-golan text-xl text-brand-charcoal">{policy.title}</h2>
                <button
                  type="button"
                  onClick={closePolicyModal}
                  className="font-san text-sm text-brand-muted hover:text-brand-charcoal"
                >
                  Đóng
                </button>
              </div>
              <div className="px-6 py-5 overflow-y-auto space-y-5">
                {policy.sections.map((section) => (
                  <section key={section.heading}>
                    <h3 className="font-san font-semibold text-sm text-brand-charcoal mb-1">{section.heading}</h3>
                    <p className="font-san text-sm text-brand-muted leading-relaxed">{section.body}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // === Dashboard ===
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* User header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-navy rounded-full flex items-center justify-center">
            <span className="font-golan text-xl text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-golan text-xl font-bold text-brand-charcoal">
              {user.name}
            </h1>
            <p className="font-san text-sm text-brand-muted">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-san text-sm transition-colors"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>

      {String(user?.role || '').toUpperCase() === 'ADMIN' && (
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-navy text-white font-san text-sm hover:bg-brand-deep-blue transition-colors"
          >
            Vào Admin Dashboard
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-brand-cream rounded-xl p-1 mb-8">
        {[
          { id: 'orders', label: 'Lịch sử mua hàng', icon: Package },
          { id: 'preferences', label: 'Gu sách gần đây', icon: BookOpen },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-san text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-brand-charcoal shadow-sm'
                : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <p className="font-san text-sm text-brand-muted">Dang tai lich su don hang...</p>
            </div>
          ) : ordersError ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <p className="font-san text-sm text-red-500">{ordersError}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <Package size={48} className="text-brand-cream-dark mx-auto mb-4" />
              <p className="font-san text-sm text-brand-muted">
                Bạn chưa có đơn hàng nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.PENDING;
                const activeStepIndex = getStatusStepIndex(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <p className="font-monoht text-sm font-bold text-brand-navy">
                          {order.id}
                        </p>
                        <span
                          className={`font-san text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="font-san text-xs text-brand-muted">
                        {new Date(order.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    {/* Order timeline */}
                    <div className="flex items-center gap-2 mb-4">
                      {ORDER_TIMELINE_STEPS.map(
                        (step, i) => (
                          <div key={step} className="flex items-center gap-2 flex-1">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                i <= activeStepIndex
                                  ? order.status === 'SHIPPED'
                                    ? 'bg-green-500'
                                    : 'bg-brand-amber'
                                  : 'bg-brand-cream-dark'
                              }`}
                            />
                            <span className="font-san text-[10px] text-brand-muted hidden sm:inline">
                              {step}
                            </span>
                            {i < 3 && (
                              <div
                                className={`flex-1 h-px ${
                                  i < activeStepIndex
                                    ? order.status === 'SHIPPED'
                                      ? 'bg-green-400'
                                      : 'bg-brand-amber/70'
                                    : 'bg-brand-cream-dark'
                                }`}
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-san text-xs text-brand-muted space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id}>
                            <p>
                              {item.productName} x{item.quantity}
                            </p>
                            {(item.spineColorHex || item.engravedText || item.hardwareType || item.hasExtraChain || item.hasUploadedCover) && (
                              <p className="text-[11px] text-brand-muted/80">
                                Màu:{' '}
                                {[
                                  item.hardwareLabel || null,
                                  item.spineColorName ? `Màu gáy: ${item.spineColorName}` : null,
                                  item.engravedText ? `Khắc: "${item.engravedText}"` : null,
                                  item.hasExtraChain ? 'Thêm dây xích' : null,
                                  item.hasUploadedCover ? 'Có ảnh cover tải lên' : null,
                                ].filter(Boolean).join(' | ')}
                              </p>
                            )}
                          </div>
                        ))}

                        {(order.status === 'SHIPPED' || order.hasAudiobookCode) && (
                          <div className="mt-2 pt-2 border-t border-brand-cream-dark/70">
                            {order.status === 'SHIPPED' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleOrderCodeReveal(order.id)}
                                  className="text-[11px] text-green-700 font-semibold hover:underline"
                                >
                                  {revealedCodeRows[`${order.id}:order`]
                                    ? 'Ẩn code audio book của giao dịch'
                                    : 'Xem code audio book của giao dịch'}
                                </button>
                                {orderCodeLoadingRows[order.id] && (
                                  <p className="mt-1 text-[11px] text-brand-muted">Đang tải code audio book...</p>
                                )}
                                {revealedCodeRows[`${order.id}:order`] && order.audiobookCodes.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {order.audiobookCodes.map((code) => (
                                      <span
                                        key={`${order.id}-${code}`}
                                        className="inline-block px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 text-[11px] font-monoht"
                                      >
                                        {code}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {revealedCodeRows[`${order.id}:order`] && order.audiobookCodes.length === 0 && (
                                  <p className="mt-1 text-[11px] text-brand-muted">
                                    Chưa có code audio khả dụng cho giao dịch này. Vui lòng tải lại trang sau vài giây.
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-[11px] text-amber-700">
                                Code audio book sẽ mở khi đơn ở trạng thái SHIPPED.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="font-golan text-lg font-bold text-brand-amber">
                        {order.total.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'preferences' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <BookOpen size={48} className="text-brand-cream-dark mx-auto mb-4" />
          <h3 className="font-golan text-lg font-bold text-brand-charcoal mb-2">
            Gu sách của bạn chọn gần đây
          </h3>
          <p className="font-san text-sm text-brand-muted">
            Tính năng này sẽ cập nhật sau khi bạn mua sản phẩm đầu tiên
          </p>
        </div>
      )}
      </div>

      {policy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-brand-cream-dark flex items-center justify-between">
              <h2 className="font-golan text-xl text-brand-charcoal">{policy.title}</h2>
              <button
                type="button"
                onClick={closePolicyModal}
                className="font-san text-sm text-brand-muted hover:text-brand-charcoal"
              >
                Đóng
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto space-y-5">
              {policy.sections.map((section) => (
                <section key={section.heading}>
                  <h3 className="font-san font-semibold text-sm text-brand-charcoal mb-1">{section.heading}</h3>
                  <p className="font-san text-sm text-brand-muted leading-relaxed">{section.body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
