
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { CartItem, Product } from '@/lib/types';

const STORAGE_KEY = 'pollachi_cart';

interface CartContextValue {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity: number,
    size: string
  ) => void;
  removeFromCart: (
    productId: string,
    size: string
  ) => void;
  updateQuantity: (
    productId: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalSavings: number;
}

const CartContext =
  createContext<CartContextValue | undefined>(undefined);

/* ---------------------------------------
   NORMALIZE SIZE
--------------------------------------- */

function normalizeSize(size: any): string {
  if (typeof size === 'string') {
    return size.trim();
  }

  if (size && typeof size === 'object') {
    return String(
      size.label ??
      size.name ??
      size.value ??
      'Standard'
    ).trim();
  }

  return 'Standard';
}

/* ---------------------------------------
   CART KEY
--------------------------------------- */

function getCartKey(
  productId: string,
  size: any
): string {
  return `${productId}-${normalizeSize(size)}`;
}

/* ---------------------------------------
   NORMALIZE OLD CART
--------------------------------------- */

function normalizeCartItems(
  cart: any[]
): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const rawItem of cart) {
    if (!rawItem || !rawItem.product_id) {
      continue;
    }

    const size = normalizeSize(rawItem.size);

    const item: CartItem = {
      ...rawItem,

      product_id: String(rawItem.product_id),

      name: rawItem.name || 'Product',

      slug: rawItem.slug || '',

      image: rawItem.image || '',

      price: Number(rawItem.price) || 0,

      mrp:
        Number(rawItem.mrp) ||
        Number(rawItem.price) ||
        0,

      quantity: Math.max(
        1,
        Number(rawItem.quantity) || 1
      ),

      size,

      stock:
        Number(rawItem.stock) > 0
          ? Number(rawItem.stock)
          : 999,
    };

    const key = getCartKey(
      item.product_id,
      item.size
    );

    const existing = merged.get(key);

    if (existing) {
      const stock =
        Number(existing.stock) > 0
          ? Number(existing.stock)
          : 999;

      existing.quantity = Math.min(
        existing.quantity + item.quantity,
        stock
      );
    } else {
      merged.set(key, item);
    }
  }

  return Array.from(merged.values());
}

/* ---------------------------------------
   PROVIDER
--------------------------------------- */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }

      /*
       * Important:
       * Existing duplicate cart items are merged here.
       */
      const cleanedCart =
        normalizeCartItems(parsed);

      /*
       * Immediately save cleaned cart.
       */
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cleanedCart)
      );

      return cleanedCart;
    } catch (error) {
      console.error(
        'Cart loading error:',
        error
      );

      localStorage.removeItem(STORAGE_KEY);

      return [];
    }
  });

  /* ---------------------------------------
     SAVE CART
  --------------------------------------- */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        'Cart save error:',
        error
      );
    }
  }, [items]);

  /* ---------------------------------------
     ADD TO CART
  --------------------------------------- */

  function addToCart(
    product: Product,
    quantity: number = 1,
    size: string = 'Standard'
  ) {
    if (!product || !product.id) {
      console.error(
        'Invalid product:',
        product
      );
      return;
    }

    const safeSize =
      normalizeSize(size);

    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    const stock =
      Number(product.stock) > 0
        ? Number(product.stock)
        : 999;

    const image =
      Array.isArray(product.images) &&
      product.images.length > 0
        ? product.images[0]
        : '';

    const cartKey = getCartKey(
      product.id,
      safeSize
    );

    setItems((prev) => {
      /*
       * First clean any existing duplicates.
       */
      const cleaned =
        normalizeCartItems(prev);

      const existing =
        cleaned.find(
          (item) =>
            getCartKey(
              item.product_id,
              item.size
            ) === cartKey
        );

      /*
       * Existing item
       */
      if (existing) {
        const newQuantity =
          Math.min(
            existing.quantity +
              safeQuantity,
            stock
          );

        return cleaned.map((item) =>
          getCartKey(
            item.product_id,
            item.size
          ) === cartKey
            ? {
                ...item,
                quantity: newQuantity,
                stock,
                price:
                  Number(product.price) ||
                  item.price ||
                  0,
                mrp:
                  Number(product.mrp) ||
                  Number(product.price) ||
                  item.mrp ||
                  0,
                image:
                  image || item.image,
              }
            : item
        );
      }

      /*
       * New item
       */
      const newItem: CartItem = {
        product_id: String(product.id),

        name: product.name,

        slug: product.slug,

        image,

        price:
          Number(product.price) || 0,

        mrp:
          Number(product.mrp) ||
          Number(product.price) ||
          0,

        quantity:
          Math.min(
            safeQuantity,
            stock
          ),

        size: safeSize,

        stock,
      };

      return [
        ...cleaned,
        newItem,
      ];
    });

    console.log(
      'Added to cart:',
      {
        product: product.name,
        productId: product.id,
        quantity: safeQuantity,
        size: safeSize,
        cartKey,
      }
    );
  }

  /* ---------------------------------------
     REMOVE FROM CART
  --------------------------------------- */

  function removeFromCart(
    productId: string,
    size: string
  ) {
    const safeSize =
      normalizeSize(size);

    const cartKey =
      getCartKey(
        productId,
        safeSize
      );

    setItems((prev) =>
      prev.filter(
        (item) =>
          getCartKey(
            item.product_id,
            item.size
          ) !== cartKey
      )
    );
  }

  /* ---------------------------------------
     UPDATE QUANTITY
  --------------------------------------- */

  function updateQuantity(
    productId: string,
    size: string,
    quantity: number
  ) {
    const safeSize =
      normalizeSize(size);

    const cartKey =
      getCartKey(
        productId,
        safeSize
      );

    const safeQuantity =
      Number(quantity);

    /*
     * Quantity 0 or below = remove
     */
    if (
      !Number.isFinite(safeQuantity) ||
      safeQuantity < 1
    ) {
      removeFromCart(
        productId,
        safeSize
      );
      return;
    }

    setItems((prev) => {
      const cleaned =
        normalizeCartItems(prev);

      return cleaned.map((item) => {
        const itemKey =
          getCartKey(
            item.product_id,
            item.size
          );

        if (itemKey !== cartKey) {
          return item;
        }

        const stock =
          Number(item.stock) > 0
            ? Number(item.stock)
            : 999;

        return {
          ...item,
          quantity: Math.min(
            safeQuantity,
            stock
          ),
        };
      });
    });
  }

  /* ---------------------------------------
     CLEAR CART
  --------------------------------------- */

  function clearCart() {
    setItems([]);

    localStorage.removeItem(
      STORAGE_KEY
    );
  }

  /* ---------------------------------------
     TOTAL ITEMS
  --------------------------------------- */

  const totalItems =
    items.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0),
      0
    );

  /* ---------------------------------------
     SUBTOTAL
  --------------------------------------- */

  const subtotal =
    items.reduce(
      (total, item) =>
        total +
        (Number(item.price) || 0) *
          (Number(item.quantity) || 0),
      0
    );

  /* ---------------------------------------
     TOTAL SAVINGS
  --------------------------------------- */

  const totalSavings =
    items.reduce(
      (total, item) => {
        const mrp =
          Number(item.mrp) || 0;

        const price =
          Number(item.price) || 0;

        const quantity =
          Number(item.quantity) || 0;

        return (
          total +
          Math.max(
            0,
            mrp - price
          ) *
            quantity
        );
      },
      0
    );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ---------------------------------------
   HOOK
--------------------------------------- */

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    );
  }

  return context;
}

