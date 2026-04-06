import { useEffect } from 'react';

/**
 * Hook to capture UTM parameters from URL and store in sessionStorage.
 * UTM params are sent with order data to the backend for marketing analytics.
 */
export function useUTM() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        sessionStorage.setItem(key, value);
      }
    });
  }, []);

  const getUTMData = () => {
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const data = {};
    utmKeys.forEach((key) => {
      const value = sessionStorage.getItem(key);
      if (value) data[key] = value;
    });
    return data;
  };

  return { getUTMData };
}
