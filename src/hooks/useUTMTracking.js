import { useEffect, useCallback } from 'react';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];

export function useUTMTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) {
        sessionStorage.setItem(key, value);
      }
    });
  }, []);

  const getUTMData = useCallback(() => {
    return {
      utm_source: sessionStorage.getItem('utm_source') || null,
      utm_medium: sessionStorage.getItem('utm_medium') || null,
      utm_campaign: sessionStorage.getItem('utm_campaign') || null,
    };
  }, []);

  return { getUTMData };
}
