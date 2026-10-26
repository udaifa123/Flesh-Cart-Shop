
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'freshcart-cart';

const getId = (product) =>
  String(product.id ?? product.product_id ?? '');

const getStock = (product) =>
  Math.max(
    0,
    Number(product.stock ?? product.stock_quantity ?? 0)
  );

function readCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product) => {
    const id = getId(product);
    const stock = getStock(product);

    if (!id) {
      return { ok: false, message: 'Product ID is missing.' };
    }

    if (stock <= 0) {
      return { ok: false, message: 'Product is out of stock.' };
    }

    const existing = cartItems.find(
      (item) => getId(item) === id
    );

    if (existing && existing.quantity >= stock) {
      return { ok: false, message: 'Available stock limit reached.' };
    }

    setCartItems((current) => {
      const found = current.find(
        (item) => getId(item) === id
      );

      if (found) {
        return current.map((item) =>
          getId(item) === id
            ? {
                ...item,
                ...product,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    return { ok: true, message: 'Product added to cart.' };
  }, [cartItems]);

  const updateQuantity = useCallback((productId, quantity) => {
    const id = String(productId);

    setCartItems((current) =>
      current
        .map((item) => {
          if (getId(item) !== id) return item;

          return {
            ...item,
            quantity: Math.min(
              getStock(item),
              Math.max(0, Number(quantity) || 0)
            ),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    const id = String(productId);

    setCartItems((current) =>
      current.filter((item) => getId(item) !== id)
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const totalItems = useMemo(
    () => cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    ),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * item.quantity,
      0
    ),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider.');
  }

  return context;
}
