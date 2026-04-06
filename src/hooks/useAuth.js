import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for Google OAuth2 authentication (mock for MVP).
 * Will be replaced with real Google SSO when backend is ready.
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('lumier_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lumier_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lumier_user');
    }
  }, [user]);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    // Mock Google OAuth - simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const mockUser = {
      id: 'user_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Người dùng LUMIER',
      avatar: null,
      googleId: 'google_mock_id',
    };

    setUser(mockUser);
    setIsLoading(false);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const getOrderHistory = useCallback(() => {
    // Mock order history
    const stored = localStorage.getItem('lumier_orders');
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveOrder = useCallback(
    (order) => {
      const orders = getOrderHistory();
      const newOrder = {
        ...order,
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        status: 'pending',
        userEmail: user?.email || order.email,
      };
      orders.unshift(newOrder);
      localStorage.setItem('lumier_orders', JSON.stringify(orders));
      return newOrder;
    },
    [user, getOrderHistory]
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    getOrderHistory,
    saveOrder,
  };
}
