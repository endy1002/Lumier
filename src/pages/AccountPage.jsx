import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, Package, Clock, BookOpen, ChevronRight } from 'lucide-react';

const ORDER_STATUS_MAP = {
  pending: { label: 'Đang xử lý', color: 'text-yellow-600 bg-yellow-50' },
  confirmed: { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-50' },
  shipping: { label: 'Đang giao', color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Đã giao', color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Đã hủy', color: 'text-red-600 bg-red-50' },
};

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, loginWithGoogle, logout, getOrderHistory } =
    useAuth();
  const [tab, setTab] = useState('orders');
  const [loginError, setLoginError] = useState('');

  const orders = getOrderHistory();

  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      await loginWithGoogle();
    } catch (error) {
      setLoginError(error?.message || 'Dang nhap Google that bai');
    }
  };

  // === Login Screen ===
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm">
          <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn size={32} className="text-brand-navy" />
          </div>
          <h1 className="font-golan text-2xl font-bold text-brand-charcoal mb-3">
            Đăng nhập
          </h1>
          <p className="font-san text-sm text-brand-muted mb-8">
            Đăng nhập để xem lịch sử mua hàng và quản lý tài khoản
          </p>

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
    );
  }

  // === Dashboard ===
  return (
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
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <Package size={48} className="text-brand-cream-dark mx-auto mb-4" />
              <p className="font-san text-sm text-brand-muted">
                Bạn chưa có đơn hàng nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
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
                      {['Đặt hàng', 'Xác nhận', 'Đang giao', 'Hoàn tất'].map(
                        (step, i) => (
                          <div key={step} className="flex items-center gap-2 flex-1">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                i === 0
                                  ? 'bg-brand-amber'
                                  : 'bg-brand-cream-dark'
                              }`}
                            />
                            <span className="font-san text-[10px] text-brand-muted hidden sm:inline">
                              {step}
                            </span>
                            {i < 3 && (
                              <div className="flex-1 h-px bg-brand-cream-dark" />
                            )}
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-san text-xs text-brand-muted">
                        {order.items.length} sản phẩm
                      </p>
                      <p className="font-golan text-lg font-bold text-brand-amber">
                        {order.total.toLocaleString('vi-VN')}đ
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
  );
}
