import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOrderById } from '@/services/api';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';

interface OrderSuccessState {
  orderId?: string;
  order?: Order | null;
}

export default function OrderSuccess() {
  const location = useLocation();

  const state = (location.state as OrderSuccessState) || {};

  const orderId = state.orderId;
  const [order, setOrder] = useState<Order | null>(state.order ?? null);
  const [loading, setLoading] = useState(!state.order);

  useEffect(() => {
    if (!orderId || state.order) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadOrder() {
      try {
        const data = await getOrderById(orderId!);

        if (mounted) {
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="max-w-lg mx-auto text-center">

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-palm/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle2 className="w-10 h-10 text-palm" />
        </div>

        <h1 className="font-heading text-3xl text-ink mb-2">
          Order Placed Successfully!
        </h1>

        <p className="text-ink-soft mb-8">
          Thank you for your purchase. We'll get your coconut oil bottled and
          shipped right away.
        </p>

        {/* Loading */}
        {loading && (
          <div className="card p-6 text-center mb-8">
            <p className="text-ink-soft">
              Loading your order details...
            </p>
          </div>
        )}

        {/* Order Details */}
        {!loading && order && (
          <div className="card p-6 text-left mb-8">

            {/* Order Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-ink/10">

              <div>
                <p className="text-xs text-ink-soft">
                  Order Number
                </p>

                <p className="font-mono font-bold text-ink">
                  {order.order_number}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-ink-soft">
                  Total Amount
                </p>

                <p className="font-mono font-bold text-ink">
                  {formatPrice(Number(order.total))}
                </p>
              </div>

            </div>

            {/* Products */}
            <div className="space-y-3">

              {Array.isArray(order.items) &&
                order.items.map((item, index) => (
                  <div
                    key={item.product_id || index}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-soft line-clamp-1">
                        {item.name}
                      </p>

                      <p className="text-xs text-ink-soft">
                        {item.size} × {item.quantity}
                      </p>
                    </div>

                    <span className="font-mono text-ink ml-4">
                      {formatPrice(
                        Number(item.price) * Number(item.quantity)
                      )}
                    </span>
                  </div>
                ))}

            </div>

            {/* Delivery */}
            <div className="mt-4 pt-4 border-t border-ink/10 flex items-center gap-2 text-sm text-palm">
              <Package className="w-4 h-4" />

              <span>
                Expected delivery in 3-5 business days
              </span>
            </div>

          </div>
        )}

        {/* Order could not load */}
        {!loading && !order && (
          <div className="card p-6 mb-8">
            <p className="text-ink-soft mb-2">
              Your order was placed successfully.
            </p>

            {orderId && (
              <p className="text-xs text-ink-soft">
                Order ID: {orderId}
              </p>
            )}

            <p className="text-sm text-ink-soft mt-3">
              You can view your complete order details from My Orders.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">

          <Link
            to="/orders"
            className="btn-primary"
          >
            View My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/shop"
            className="btn-secondary"
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    </div>
  );
}