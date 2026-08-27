import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Check,
  CreditCard,
  MapPin,
  User,
  Truck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  createCodOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '@/services/api';
import { formatPrice } from '@/lib/utils';

export default function Checkout() {
  const { items, subtotal, totalSavings, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const couponDiscount =
    (location.state as { couponDiscount?: number })?.couponDiscount ?? 0;

  const couponCode =
    (location.state as { couponCode?: string })?.couponCode;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    fullName: profile?.full_name ?? '',
    email: profile?.email ?? user?.email ?? '',
    phone: profile?.phone ?? '',
  });

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal - couponDiscount + deliveryCharge;

  // --------------------------------------------------
  // Convert size safely to text
  // --------------------------------------------------
  function getSizeLabel(size: unknown): string {
    if (typeof size === 'string') {
      return size;
    }

    if (size && typeof size === 'object') {
      const value = size as {
        label?: unknown;
        price?: unknown;
      };

      if (typeof value.label === 'string') {
        return value.label;
      }
    }

    return 'Standard';
  }

  // --------------------------------------------------
  // Safe numeric price
  // --------------------------------------------------
  function getNumericPrice(price: unknown): number {
    if (typeof price === 'number') {
      return price;
    }

    if (typeof price === 'string') {
      const parsed = Number(price);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    if (price && typeof price === 'object') {
      const value = price as {
        price?: unknown;
      };

      if (typeof value.price === 'number') {
        return value.price;
      }

      if (typeof value.price === 'string') {
        const parsed = Number(value.price);
        return Number.isFinite(parsed) ? parsed : 0;
      }
    }

    return 0;
  }

  // --------------------------------------------------
  // Empty cart
  // --------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-heading text-2xl text-ink mb-2">
          Your cart is empty
        </h1>

        <button
          onClick={() => navigate('/shop')}
          className="btn-primary mt-4"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // Step validation
  // --------------------------------------------------
  function validateStep1(): boolean {
    return !!(
      customerInfo.fullName.trim() &&
      customerInfo.email.trim() &&
      customerInfo.phone.trim()
    );
  }

  function validateStep2(): boolean {
    return !!(
      address.line1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.pincode.trim()
    );
  }

  // --------------------------------------------------
  // Place Order
  // --------------------------------------------------
  async function handlePlaceOrder() {
    if (!user) {
      showToast('Please sign in to place an order', 'error');

      navigate('/login', {
        state: { from: '/checkout' },
      });

      return;
    }

    if (
      !customerInfo.fullName.trim() ||
      !customerInfo.email.trim() ||
      !customerInfo.phone.trim() ||
      !validateStep2()
    ) {
      showToast('Please complete your delivery details', 'error');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          image: item.image,
          price: getNumericPrice(item.price),
          quantity: item.quantity,
          size: getSizeLabel(item.size),
        })),

        subtotal,
        discount: couponDiscount + totalSavings,
        delivery_charge: deliveryCharge,
        total,

        address: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
      };

      // ------------------------------------------------
      // CASH ON DELIVERY
      // ------------------------------------------------
      if (paymentMethod === 'cod') {
        const { order } = await createCodOrder(orderPayload);

        clearCart();

        showToast(
          'Order placed successfully!',
          'success'
        );

        navigate('/order-success', {
          state: {
            orderId: order.id,
          },
        });

        return;
      }

      // ------------------------------------------------
      // RAZORPAY
      // ------------------------------------------------
      const razor = await createRazorpayOrder(total);

      await new Promise<void>((resolve, reject) => {
        const openCheckout = () => {
          const Razorpay = (window as any).Razorpay;

          if (!Razorpay) {
            reject(
              new Error(
                'Razorpay checkout failed to load'
              )
            );

            return;
          }

          const rzp = new Razorpay({
            key: razor.keyId,
            amount: razor.amount,
            currency: razor.currency,

            name: 'Pollachi Coconut Oil',

            description:
              'Fresh traditional coconut oil order',

            order_id: razor.id,

            prefill: {
              name: customerInfo.fullName,
              email: customerInfo.email,
              contact: customerInfo.phone,
            },

            theme: {
              color: '#2f6b3f',
            },

            handler: async (response: any) => {
              try {
                const result =
                  await verifyRazorpayPayment({
                    ...response,
                    order: orderPayload,
                  });

                clearCart();

                showToast(
                  'Payment successful — order confirmed!',
                  'success'
                );

                navigate('/order-success', {
                  state: {
                    orderId: result.order.id,
                  },
                });

                resolve();
              } catch (error) {
                reject(error);
              }
            },

            modal: {
              ondismiss: () =>
                reject(
                  new Error('Payment cancelled')
                ),
            },
          });

          rzp.open();
        };

        // Razorpay already loaded
        if ((window as any).Razorpay) {
          openCheckout();
        } else {
          // Load Razorpay script
          const script =
            document.createElement('script');

         script.src =
            'https://checkout.razorpay.com/v1/checkout.js';

          script.onload = openCheckout;

          script.onerror = () =>
            reject(
              new Error(
                'Unable to load Razorpay'
              )
            );

          document.body.appendChild(script);
        }
      });
    } catch (err: any) {
      console.error(
        'Payment/order error:',
        err
      );

      showToast(
        err?.message ||
          'Payment/order failed. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Steps
  // --------------------------------------------------
  const steps = [
    {
      num: 1,
      label: 'Information',
      icon: User,
    },
    {
      num: 2,
      label: 'Address',
      icon: MapPin,
    },
    {
      num: 3,
      label: 'Summary',
      icon: Truck,
    },
    {
      num: 4,
      label: 'Payment',
      icon: CreditCard,
    },
  ];

  return (
    <div className="container-page py-8">
      <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-8">
        Checkout
      </h1>

      {/* =========================================
          STEP INDICATOR
      ========================================== */}
      <div className="flex items-center justify-between mb-8 max-w-2xl">
        {steps.map((s, i) => (
          <div
            key={s.num}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  step >= s.num
                    ? 'bg-palm text-white'
                    : 'bg-ink/5 text-ink-soft'
                }`}
              >
                {step > s.num ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>

              <span
                className={`text-xs font-medium hidden sm:block ${
                  step >= s.num
                    ? 'text-palm'
                    : 'text-ink-soft'
                }`}
              >
                {s.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  step > s.num
                    ? 'bg-palm'
                    : 'bg-ink/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* =========================================
              STEP 1
          ========================================== */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-heading text-xl text-ink mb-4">
                Customer Information
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) =>
                      setCustomerInfo((f) => ({
                        ...f,
                        fullName: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo((f) => ({
                        ...f,
                        email: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo((f) => ({
                        ...f,
                        phone: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="9876543210"
                  />
                </div>

              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() =>
                    validateStep1()
                      ? setStep(2)
                      : showToast(
                          'Please fill all fields',
                          'error'
                        )
                  }
                  className="btn-primary"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================
              STEP 2
          ========================================== */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-heading text-xl text-ink mb-4">
                Delivery Address
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Address Line 1
                  </label>

                  <input
                    type="text"
                    value={address.line1}
                    onChange={(e) =>
                      setAddress((a) => ({
                        ...a,
                        line1: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="House no, Street name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Address Line 2 (Optional)
                  </label>

                  <input
                    type="text"
                    value={address.line2}
                    onChange={(e) =>
                      setAddress((a) => ({
                        ...a,
                        line2: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="Apartment, Landmark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      City
                    </label>

                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          city: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="Pollachi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      State
                    </label>

                    <select
                      value={address.state}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          state: e.target.value,
                        }))
                      }
                      className="input-field"
                    >
                      <option>Tamil Nadu</option>
                      <option>Kerala</option>
                      <option>Karnataka</option>
                      <option>Andhra Pradesh</option>
                      <option>Telangana</option>
                      <option>Maharashtra</option>
                      <option>Delhi</option>
                      <option>Other</option>
                    </select>
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress((a) => ({
                        ...a,
                        pincode: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="642001"
                    maxLength={6}
                  />
                </div>

              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={() =>
                    validateStep2()
                      ? setStep(3)
                      : showToast(
                          'Please fill all required fields',
                          'error'
                        )
                  }
                  className="btn-primary"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================
              STEP 3 - SUMMARY
          ========================================== */}
          {step === 3 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-heading text-xl text-ink mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">

                {items.map((item) => {
                  const sizeLabel = getSizeLabel(
                    item.size
                  );

                  const itemPrice =
                    getNumericPrice(item.price);

                  return (
                    <div
                      key={`${item.product_id}-${sizeLabel}`}
                      className="flex gap-3 items-center"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-warm shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink line-clamp-1">
                          {item.name}
                        </p>

                        {/* FIXED: object size is converted to string */}
                        <p className="text-xs text-ink-soft">
                          {sizeLabel} × {item.quantity}
                        </p>
                      </div>

                      <p className="font-mono text-sm font-medium text-ink">
                        {formatPrice(
                          itemPrice * item.quantity
                        )}
                      </p>
                    </div>
                  );
                })}

              </div>

              <div className="flex justify-between mt-6">

                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={() => setStep(4)}
                  className="btn-primary"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          )}

          {/* =========================================
              STEP 4 - PAYMENT
          ========================================== */}
          {step === 4 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-heading text-xl text-ink mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'border-palm bg-palm/5'
                      : 'border-ink/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={
                      paymentMethod === 'razorpay'
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="accent-palm"
                  />

                  <CreditCard className="w-5 h-5 text-palm" />

                  <div>
                    <p className="font-medium text-ink">
                      Online Payment
                    </p>

                    <p className="text-xs text-ink-soft">
                      UPI, Cards, Net Banking &
                      Wallets via Razorpay
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-palm bg-palm/5'
                      : 'border-ink/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={
                      paymentMethod === 'cod'
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="accent-palm"
                  />

                  <Truck className="w-5 h-5 text-palm" />

                  <div>
                    <p className="font-medium text-ink">
                      Cash on Delivery
                    </p>

                    <p className="text-xs text-ink-soft">
                      Pay when your order arrives
                    </p>
                  </div>
                </label>

              </div>

              <div className="flex justify-between mt-6">

                <button
                  onClick={() => setStep(3)}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading
                    ? 'Placing order...'
                    : 'Place Order'}
                </button>

              </div>
            </div>
          )}

        </div>

        {/* =========================================
            PRICE SUMMARY SIDEBAR
        ========================================== */}
        <div className="lg:col-span-1">

          <div className="card p-6 sticky top-24">

            <h2 className="font-heading text-lg text-ink mb-4">
              Price Details
            </h2>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-ink-soft">
                  Subtotal ({items.length} items)
                </span>

                <span className="font-mono text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-soft">
                    Product Discount
                  </span>

                  <span className="font-mono text-palm">
                    -{formatPrice(totalSavings)}
                  </span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-soft">
                    Coupon ({couponCode})
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

              <div className="border-t border-ink/10 pt-3 flex justify-between items-baseline">

                <span className="font-heading text-base text-ink">
                  Total
                </span>

                <span className="font-mono text-xl font-bold text-ink">
                  {formatPrice(total)}
                </span>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}