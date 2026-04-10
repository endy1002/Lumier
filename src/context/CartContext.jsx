import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { PRICING } from '../config/constants';

const CartContext = createContext(null);
const AUTH_EVENT = 'lumier-auth-changed';
const USER_STORAGE_KEY = 'lumier_user';

// ===== Cart Actions =====
const ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  APPLY_PROMO: 'APPLY_PROMO',
  REMOVE_PROMO: 'REMOVE_PROMO',
};

// ===== Calculate item price with customizations =====
function calculateItemPrice(item) {
  let price = item.basePrice;

  if (item.customization) {
    const c = item.customization;
    if (c.customCover) price += PRICING.CUSTOM_COVER;
    if (c.engravedText) price += PRICING.CUSTOMIZE_ADDON;
    if (c.chainType) price += PRICING.CUSTOMIZE_ADDON;
  }

  return price;
}

// ===== Promo Codes (mock) =====
const PROMO_CODES = {
  'LUMIER10': { type: 'percent', value: 10 },
  'UEH2024': { type: 'percent', value: 15 },
  'FREESHIP': { type: 'fixed', value: 30000 },
};

// ===== Cart Reducer =====
function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_ITEM: {
      const newItem = action.payload;
      const itemKey = newItem.customization
        ? `${newItem.id}-${JSON.stringify(newItem.customization)}`
        : newItem.id;

      const existingIndex = state.items.findIndex(
        (item) => item.cartKey === itemKey
      );

      let newItems;
      if (existingIndex >= 0) {
        newItems = state.items.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            ...newItem,
            cartKey: itemKey,
            quantity: 1,
            unitPrice: calculateItemPrice(newItem),
          },
        ];
      }

      return { ...state, items: newItems };
    }

    case ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter((item) => item.cartKey !== action.payload),
      };

    case ACTIONS.UPDATE_QUANTITY: {
      const { cartKey, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.cartKey !== cartKey),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity } : item
        ),
      };
    }

    case ACTIONS.APPLY_PROMO: {
      const code = action.payload.toUpperCase();
      const promo = PROMO_CODES[code];
      if (!promo) return { ...state, promoError: 'Mã khuyến mãi không hợp lệ' };
      return { ...state, promo: { code, ...promo }, promoError: null };
    }

    case ACTIONS.REMOVE_PROMO:
      return { ...state, promo: null, promoError: null };

    case ACTIONS.CLEAR_CART:
      return { ...state, items: [], promo: null, promoError: null };

    default:
      return state;
  }
}

const initialState = {
  items: [],
  promo: null,
  promoError: null,
};

// ===== Cart Provider =====
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const syncCartWithAuth = () => {
      const hasUser = Boolean(localStorage.getItem(USER_STORAGE_KEY));
      if (!hasUser) {
        dispatch({ type: ACTIONS.CLEAR_CART });
      }
    };

    window.addEventListener('storage', syncCartWithAuth);
    window.addEventListener(AUTH_EVENT, syncCartWithAuth);

    return () => {
      window.removeEventListener('storage', syncCartWithAuth);
      window.removeEventListener(AUTH_EVENT, syncCartWithAuth);
    };
  }, []);

  const addItem = useCallback((product, customization = null) => {
    dispatch({
      type: ACTIONS.ADD_ITEM,
      payload: { ...product, customization },
    });
  }, []);

  const removeItem = useCallback((cartKey) => {
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: cartKey });
  }, []);

  const updateQuantity = useCallback((cartKey, quantity) => {
    dispatch({
      type: ACTIONS.UPDATE_QUANTITY,
      payload: { cartKey, quantity },
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CART });
  }, []);

  const applyPromo = useCallback((code) => {
    dispatch({ type: ACTIONS.APPLY_PROMO, payload: code });
  }, []);

  const removePromo = useCallback(() => {
    dispatch({ type: ACTIONS.REMOVE_PROMO });
  }, []);

  // Computed values
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  let discount = 0;
  if (state.promo) {
    if (state.promo.type === 'percent') {
      discount = Math.round(subtotal * (state.promo.value / 100));
    } else {
      discount = state.promo.value;
    }
  }

  const total = Math.max(0, subtotal - discount);

  const value = {
    items: state.items,
    promo: state.promo,
    promoError: state.promoError,
    itemCount,
    subtotal,
    discount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromo,
    removePromo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
