import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';
import Loader from '@/components/Loader';

const statusColors: Record<string, string> = {
  pending: 'bg-gold/10 text-gold',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  'out for delivery': 'bg-copper/10 text-copper',
  delivered: 'bg-palm/10 text-palm',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOrders(user.id)
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <Loader label="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-ink-soft" />
        </div>
        <h1 className="font-heading text-3xl text-ink mb-2">No orders yet</h1>
        <p className="text-ink-soft mb-8">When you place an order, it'll show up here.</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="card p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-palm/10 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-palm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-mono font-medium text-ink">{order.order_number}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.order_status] ?? 'bg-ink/5 text-ink-soft'}`}>
                  {order.order_status}
                </span>
              </div>
              <p className="text-sm text-ink-soft">
                {formatDate(order.created_at)} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-mono font-bold text-ink">{formatPrice(Number(order.total))}</p>
              <ChevronRight className="w-5 h-5 text-ink-soft" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
