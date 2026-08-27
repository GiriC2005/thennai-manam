import { Link, useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { validateCoupon } from '@/services/api';
import { formatPrice } from '@/lib/utils';
import type { Coupon } from '@/lib/types';

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalSavings,
    clearCart,
  } = useCart();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [validating, setValidating] = useState(false);

  const deliveryCharge =
    subtotal >= 500 ? 0 : subtotal > 0 ? 50 : 0;

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? (subtotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0;

  const total = Math.max(
    0,
    subtotal - couponDiscount + deliveryCharge
  );

  /*
   * IMPORTANT:
   * Old cart data may contain:
   *
   * size: { label: "1 L", price: 499 }
   *
   * instead of:
   *
   * size: "1 L"
   *
   * So convert it safely before rendering.
   */
  function getSizeLabel(size: unknown): string {
    if (typeof size === 'string') {
      return size;
    }

    if (size && typeof size === 'object') {
      const value = size as {
        label?: unknown;
        name?: unknown;
        value?: unknown;
      };

      if (typeof value.label === 'string') {
        return value.label;
      }

      if (typeof value.name === 'string') {
        return value.name;
      }

      if (typeof value.value === 'string') {
        return value.value;
      }
    }

    return 'Standard';
  }

  function getItemKey(item: any) {
    return `${item.product_id}-${getSizeLabel(item.size)}`;
  }

  async function handleApplyCoupon(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!couponCode.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }

    setValidating(true);

    try {
      const coupon = await validateCoupon(
        couponCode.trim()
      );

      if (coupon) {
        setAppliedCoupon(coupon);

        showToast(
          `Coupon ${coupon.code} applied!`,
          'success'
        );
      } else {
        showToast(
          'Invalid or expired coupon',
          'error'
        );
      }
    } catch (error) {
      console.error('Coupon error:', error);

      showToast(
        'Failed to validate coupon',
        'error'
      );
    } finally {
      setValidating(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
  }

  function handleRemoveItem(
    productId: string,
    size: unknown
  ) {
    /*
     * CartContext expects a string.
     * Convert object size into its label.
     */
    const sizeLabel = getSizeLabel(size);

    removeFromCart(productId, sizeLabel);

    showToast(
      'Item removed from cart',
      'info'
    );
  }

  function handleUpdateQuantity(
    productId: string,
    size: unknown,
    quantity: number
  ) {
    const sizeLabel = getSizeLabel(size);

    if (quantity < 1) return;

    updateQuantity(
      productId,
      sizeLabel,
      quantity
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-ink-soft" />
        </div>

        <h1 className="font-heading text-3xl text-ink mb-2">
          Your cart is empty
        </h1>

        <p className="text-ink-soft mb-8">
          Looks like you haven't added anything yet.
        </p>

        <Link
          to="/shop"
          className="btn-primary"
        >
          Start Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-8">
        Your Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* =========================
            CART ITEMS
        ========================== */}

        <div className="lg:col-span-2 space-y-4">

          {items.map((item) => {
            const sizeLabel = getSizeLabel(item.size);

            return (
              <div
                key={getItemKey(item)}
                className="card p-4 flex gap-4"
              >

                {/* Product Image */}
                <Link
                  to={`/product/${item.slug}`}
                  className="shrink-0"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-bg-warm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">

                  <Link
                    to={`/product/${item.slug}`}
                  >
                    <h3 className="font-heading text-base text-ink hover:text-palm transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>

                  {/* SAFE SIZE RENDER */}
                  <p className="text-xs text-ink-soft mt-0.5">
                    Size: {sizeLabel}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-2">

                    <span className="font-mono font-bold text-ink">
                      {formatPrice(
                        Number(item.price) || 0
                      )}
                    </span>

                    {Number(item.mrp) >
                      Number(item.price) && (
                      <span className="font-mono text-xs text-ink-soft line-through">
                        {formatPrice(
                          Number(item.mrp) || 0
                        )}
                      </span>
                    )}

                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between mt-3">

                    <div className="flex items-center border border-ink/15 rounded-full">

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:bg-ink/5 rounded-l-full transition-colors disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="px-3 font-mono text-sm w-10 text-center">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          item.quantity >= item.stock
                        }
                        className="p-1.5 hover:bg-ink/5 rounded-r-full transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveItem(
                          item.product_id,
                          item.size
                        )
                      }
                      className="p-2 rounded-full text-ink-soft hover:bg-copper/10 hover:text-copper transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right shrink-0 hidden sm:block">

                  <p className="font-mono font-bold text-ink">
                    {formatPrice(
                      (Number(item.price) || 0) *
                        item.quantity
                    )}
                  </p>

                </div>

              </div>
            );
          })}

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-2">

            <button
              type="button"
              onClick={() => {
                clearCart();

                showToast(
                  'Cart cleared',
                  'info'
                );
              }}
              className="text-sm text-ink-soft hover:text-copper transition-colors"
            >
              Clear cart
            </button>

            <Link
              to="/shop"
              className="text-sm text-palm font-medium hover:underline"
            >
              Continue shopping
            </Link>

          </div>

        </div>

        {/* =========================
            ORDER SUMMARY
        ========================== */}

        <div className="lg:col-span-1">

          <div className="card p-6 sticky top-24">

            <h2 className="font-heading text-xl text-ink mb-4">
              Order Summary
            </h2>

            {/* Coupon */}
            <div className="mb-6">

              {appliedCoupon ? (

                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-palm/10">

                  <div className="flex items-center gap-2">

                    <Tag className="w-4 h-4 text-palm" />

                    <span className="text-sm font-medium text-palm">
                      {appliedCoupon.code}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-full hover:bg-palm/10"
                  >
                    <X className="w-4 h-4 text-palm" />
                  </button>

                </div>

              ) : (

                <form
                  onSubmit={handleApplyCoupon}
                  className="flex gap-2"
                >

                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value)
                    }
                    placeholder="Coupon code"
                    className="input-field text-sm"
                  />

                  <button
                    type="submit"
                    disabled={validating}
                    className="btn-secondary px-4 py-3 text-sm shrink-0 disabled:opacity-50"
                  >
                    {validating
                      ? 'Checking...'
                      : 'Apply'}
                  </button>

                </form>

              )}

              <p className="text-xs text-ink-soft mt-2">
                Try code: WELCOME10
              </p>

            </div>

            {/* Summary Values */}
            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-ink-soft">
                  Subtotal
                </span>

                <span className="font-mono text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between">

                  <span className="text-ink-soft">
                    You Save
                  </span>

                  <span className="font-mono text-palm">
                    -{formatPrice(totalSavings)}
                  </span>

                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between">

                  <span className="text-ink-soft">
                    Coupon Discount
                  </span>

                  <span className="font-mono text-palm">
                    -{formatPrice(couponDiscount)}
                  </span>

                </div>
              )}

              <div className="flex justify-between">

                <span className="text-ink-soft">
                  Delivery
                </span>

                <span className="font-mono text-ink">
                  {deliveryCharge === 0
                    ? 'FREE'
                    : formatPrice(
                        deliveryCharge
                      )}
                </span>

              </div>

              {deliveryCharge > 0 && (
                <p className="text-xs text-gold">
                  Add{' '}
                  {formatPrice(
                    500 - subtotal
                  )}{' '}
                  more for free delivery
                </p>
              )}

            </div>

            {/* Total */}
            <div className="border-t border-ink/10 mt-4 pt-4 flex justify-between items-baseline">

              <span className="font-heading text-lg text-ink">
                Total
              </span>

              <span className="font-mono text-2xl font-bold text-ink">
                {formatPrice(total)}
              </span>

            </div>

            {/* Checkout */}
            <button
              type="button"
              onClick={() =>
                navigate('/checkout', {
                  state: {
                    couponDiscount,
                    couponCode:
                      appliedCoupon?.code,
                  },
                })
              }
              className="btn-primary w-full mt-6"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}