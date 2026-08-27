import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  ArrowRight,
  MessageSquare,
  Star,
} from 'lucide-react';

import {
  getAllOrders,
  getDashboardStats,
  getAllReviews,
} from '@/services/api';

import type { Review, Product } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string | null;
  total: number;
  order_status: string;
  created_at: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

type AdminReview = Review & {
  product: Product | null;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewCount, setReviewCount] = useState(0);

  const [stats, setStats] =
    useState<DashboardStats>({
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  async function loadDashboard() {
  try {
    setLoading(true);

    const [
      ordersData,
      statsData,
      reviewsData,
    ] = await Promise.all([
      getAllOrders(),
      getDashboardStats(),
      getAllReviews(),
    ]);

    setOrders(ordersData as Order[]);
    setStats(statsData as DashboardStats);

    setReviewCount(
      Array.isArray(reviewsData)
        ? reviewsData.length
        : 0
    );

    console.log(
      'DASHBOARD REVIEWS:',
      reviewsData
    );
  } catch (error) {
    console.error(
      'Dashboard error:',
      error
    );
  } finally {
    setLoading(false);
  }
}

  async function loadReviews() {
    try {
      setReviewsLoading(true);

      console.log(
        'Loading dashboard reviews...'
      );

      const data =
        await getAllReviews();

      console.log(
        'DASHBOARD REVIEWS:',
        data
      );

      setReviews(data || []);
    } catch (error) {
      console.error(
        'Dashboard reviews error:',
        error
      );

      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    loadReviews();
  }, []);

  const pendingReviews =
    reviews.filter(
      (review) => !review.approved
    );

  const dashboardStats = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      link: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${Number(
        stats.totalRevenue
      ).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      link: '/admin/orders',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      link: '/admin/customers',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      link: '/admin/products',
    },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="font-heading text-3xl text-ink">
          Dashboard
        </h1>

        <p className="text-ink-soft mt-1">
          Welcome to Pollachi Coconut Oil
          admin panel.
        </p>
      </div>

      {/* MAIN STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {dashboardStats.map(
          (stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.title}
                to={stat.link}
                className="card p-5 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-ink-soft">
                      {stat.title}
                    </p>

                    <p className="text-2xl font-semibold text-ink mt-2">
                      {loading
                        ? '...'
                        : stat.value}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-palm/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-palm" />
                  </div>

                </div>
              </Link>
            );
          }
        )}

      </div>

      {/* EXTRA STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Pending Orders */}
        <div className="card p-5">
          <p className="text-sm text-ink-soft">
            Pending Orders
          </p>

          <p className="text-2xl font-semibold text-ink mt-2">
            {loading
              ? '...'
              : stats.pendingOrders}
          </p>
        </div>

        {/* Delivered Orders */}
        <div className="card p-5">
          <p className="text-sm text-ink-soft">
            Delivered Orders
          </p>

          <p className="text-2xl font-semibold text-ink mt-2">
            {loading
              ? '...'
              : stats.deliveredOrders}
          </p>
        </div>

        {/* Pending Reviews */}
        <Link
          to="/admin/reviews"
          className="card p-5 hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-ink-soft">
                Pending Reviews
              </p>

              <p className="text-2xl font-semibold text-ink mt-2">
                {reviewsLoading
                  ? '...'
                  : pendingReviews.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-gold" />
            </div>

          </div>
        </Link>

      </div>
      {/* RECENT ORDERS */}
      <div className="card overflow-hidden">

        <div className="p-5 border-b border-line flex items-center justify-between">

          <div>
            <h2 className="font-heading text-xl text-ink">
              Recent Orders
            </h2>

            <p className="text-sm text-ink-soft mt-1">
              Latest customer orders
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="text-sm text-palm font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

        {loading ? (

          <div className="p-10 text-center text-ink-soft">
            Loading orders...
          </div>

        ) : orders.length === 0 ? (

          <div className="p-10 text-center text-ink-soft">
            No orders yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-line text-left">

                  <th className="p-4 font-medium">
                    Order
                  </th>

                  <th className="p-4 font-medium">
                    Amount
                  </th>

                  <th className="p-4 font-medium">
                    Status
                  </th>

                  <th className="p-4 font-medium">
                    Date
                  </th>

                </tr>
              </thead>

              <tbody>

                {orders
                  .slice(0, 8)
                  .map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-line last:border-0"
                    >

                      <td className="p-4 font-medium">
                        {order.order_number ||
                          `#${order.id.slice(
                            0,
                            8
                          )}`}
                      </td>

                      <td className="p-4">
                        ₹
                        {Number(
                          order.total || 0
                        ).toLocaleString(
                          'en-IN'
                        )}
                      </td>

                      <td className="p-4">

                        <span className="px-3 py-1 rounded-full bg-palm/10 text-palm text-xs capitalize">
                          {order.order_status}
                        </span>

                      </td>

                      <td className="p-4 text-ink-soft">
                        {new Date(
                          order.created_at
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* RECENT REVIEWS */}
      <div className="card overflow-hidden">

        <div className="p-5 border-b border-line flex items-center justify-between">

          <div>
            <h2 className="font-heading text-xl text-ink">
              Recent Reviews
            </h2>

            <p className="text-sm text-ink-soft mt-1">
              Latest customer reviews
            </p>
          </div>

          <Link
            to="/admin/reviews"
            className="text-sm text-palm font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

        {reviewsLoading ? (

          <div className="p-10 text-center text-ink-soft">
            Loading reviews...
          </div>

        ) : reviews.length === 0 ? (

          <div className="p-10 text-center text-ink-soft">
            No reviews yet.
          </div>

        ) : (

          <div className="divide-y divide-line">

            {reviews
              .slice(0, 5)
              .map((review) => (

                <div
                  key={review.id}
                  className="p-5 flex items-start justify-between gap-4"
                >

                  <div className="flex items-start gap-4 min-w-0">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-heading font-semibold shrink-0">
                      {review.user_name
                        ?.charAt(0)
                        ?.toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2 flex-wrap">

                        <p className="font-medium text-ink text-sm">
                          {review.user_name ||
                            'Anonymous'}
                        </p>

                        {!review.approved && (
                          <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-medium">
                            Pending
                          </span>
                        )}

                        {review.approved && (
                          <span className="px-2 py-0.5 rounded-full bg-palm/10 text-palm text-xs font-medium">
                            Approved
                          </span>
                        )}

                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">

                        <div className="flex">
                          {[
                            1,
                            2,
                            3,
                            4,
                            5,
                          ].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <=
                                review.rating
                                  ? 'fill-gold text-gold'
                                  : 'text-ink/15'
                              }`}
                            />
                          ))}
                        </div>

                        <span className="text-xs text-ink-soft">
                          {review.rating}/5
                        </span>

                      </div>

                      {/* Location */}
                      {review.user_location && (
                        <p className="text-xs text-ink-soft mt-1">
                          📍 {review.user_location}
                        </p>
                      )}

                      {/* Product */}
                      {review.product && (
                        <p className="text-xs text-gold mt-1">
                          Product:{' '}
                          {review.product.name}
                        </p>
                      )}

                      {/* Comment */}
                      <p className="text-sm text-ink-soft mt-2 line-clamp-2">
                        {review.comment}
                      </p>

                    </div>

                  </div>

                  {/* Date */}
                  <span className="text-xs text-ink-soft whitespace-nowrap">
                    {formatDate(
                      review.created_at
                    )}
                  </span>

                </div>

              ))}

          </div>

        )}

      </div>

      

    </div>
  );
}