import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });
}

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
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setIsLoading(false);
      throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
    }

    await loadGoogleIdentityScript();

    try {
      const credential = await new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (!response?.credential) {
              reject(new Error('Google credential is missing'));
              return;
            }
            resolve(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google sign-in prompt was not displayed'));
          }
        });
      });

      const { data } = await api.post('/auth/google', { idToken: credential });
      const authenticatedUser = {
        id: data.user.googleId,
        email: data.user.email,
        name: data.user.name || data.user.email,
        avatar: data.user.picture || null,
        googleId: data.user.googleId,
      };

      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
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
