import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const AUTH_EVENT = 'lumier-auth-changed';
const USER_STORAGE_KEY = 'lumier_user';
const ORDER_STORAGE_KEY = 'lumier_orders';

function readStoredUser() {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

function readAllOrders() {
  const stored = localStorage.getItem(ORDER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

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
  const [user, setUser] = useState(() => readStoredUser());

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(readStoredUser());
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener(AUTH_EVENT, syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener(AUTH_EVENT, syncUser);
    };
  }, []);

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
        phone: data.user.phone || '',
        shippingAddress: data.user.shippingAddress || '',
        marketingOptIn: Boolean(data.user.marketingOptIn),
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      emitAuthChanged();
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    emitAuthChanged();
  }, []);

  const updateUserProfile = useCallback((patch) => {
    setUser((current) => {
      if (!current) {
        return current;
      }

      const updated = { ...current, ...patch };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      emitAuthChanged();
      return updated;
    });
  }, []);

  const getOrderHistory = useCallback(() => {
    if (!user?.email) {
      return [];
    }

    return readAllOrders().filter((order) => order.userEmail === user.email);
  }, [user]);

  const saveOrder = useCallback(
    (order) => {
      const orders = readAllOrders();
      const newOrder = {
        ...order,
        id: order.id || 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        status: order.status || 'pending',
        userEmail: user?.email || order.email,
      };
      orders.unshift(newOrder);
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
      return newOrder;
    },
    [user]
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    updateUserProfile,
    getOrderHistory,
    saveOrder,
  };
}
