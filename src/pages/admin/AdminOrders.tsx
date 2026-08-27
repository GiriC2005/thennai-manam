
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';

import {
  getAllOrders,
  updateOrderStatus,
} from '@/services/api';

import type { Order } from '@/lib/types';

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================
  // LOAD ORDERS
  // =========================

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');

      const data = await getAllOrders();

      console.log('ADMIN ORDERS:', data);

      setOrders(data);
    } catch (err: any) {
      console.error('ADMIN ORDERS ERROR:', err);

      setError(
        err?.message || 'Unable to load orders'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================
  // FILTER ORDERS
  // =========================

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      // -------------------------
      // SEARCH FILTER
      // -------------------------

      const orderNumber =
        order.order_number?.toLowerCase() || '';

      const orderId =
        order.id?.toLowerCase() || '';

      const customerName =
        order.address?.fullName?.toLowerCase() || '';

      const phone =
        order.address?.phone?.toLowerCase() || '';

      const matchesSearch =
        !keyword ||
        orderNumber.includes(keyword) ||
        orderId.includes(keyword) ||
        customerName.includes(keyword) ||
        phone.includes(keyword);

      // -------------------------
      // STATUS FILTER
      // -------------------------

      const matchesStatus =
        statusFilter === 'all' ||
        order.order_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  async function handleStatusChange(
    id: string,
    status: string
  ) {
    try {
      await updateOrderStatus(id, status);

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                order_status: status,
              }
            : order
        )
      );
    } catch (err: any) {
      console.error(
        'STATUS UPDATE ERROR:',
        err
      );

      alert(
        err?.message ||
          'Unable to update order status'
      );
    }
  }

  // =========================
  // CLEAR FILTERS
  // =========================

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all';

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="p-8">
        <div className="card p-6">
          Loading orders...
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="p-8">
        <div className="card p-6">

          <h2 className="text-xl font-semibold text-red-600">
            Failed to load orders
          </h2>

          <p className="mt-2 text-ink-soft">
            {error}
          </p>

          <button
            onClick={loadOrders}
            className="mt-4 px-4 py-2 rounded-lg bg-palm text-white"
          >
            Retry
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h1 className="font-heading text-3xl text-ink">
            Orders
          </h1>

          <p className="text-ink-soft mt-1">
            Manage customer orders
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-lg border border-line hover:bg-gray-50 transition"
        >
          Refresh
        </button>

      </div>

      {/* =========================
          SEARCH + FILTER CARD
      ========================= */}

      <div className="card p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search Order ID, Order Number, Customer Name or Phone..."
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-line bg-white outline-none focus:ring-2 focus:ring-palm/20 focus:border-palm transition"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 text-ink-soft"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

          </div>

          {/* STATUS FILTER */}

          <div className="relative">

            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
              size={17}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full lg:w-[210px] pl-10 pr-4 py-3 rounded-xl border border-line bg-white outline-none focus:ring-2 focus:ring-palm/20 focus:border-palm transition cursor-pointer"
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="shipped">
                Shipped
              </option>

              <option value="out for delivery">
                Out for Delivery
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

          </div>

          {/* CLEAR FILTERS */}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl border border-line hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* RESULT COUNT */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">

          <p className="text-sm text-ink-soft">

            Showing{' '}
            <span className="font-semibold text-ink">
              {filteredOrders.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-ink">
              {orders.length}
            </span>{' '}
            orders

          </p>

          {statusFilter !== 'all' && (
            <p className="text-xs text-ink-soft">
              Status:{' '}
              <span className="font-medium text-ink capitalize">
                {statusFilter}
              </span>
            </p>
          )}

        </div>

      </div>

      {/* =========================
          NO ORDERS
      ========================= */}

      {orders.length === 0 ? (

        <div className="card p-10 text-center">

          <div className="text-4xl mb-3">
            📦
          </div>

          <p className="text-ink-soft">
            No orders found.
          </p>

        </div>

      ) : filteredOrders.length === 0 ? (

        /* =========================
           NO MATCHING ORDERS
        ========================= */

        <div className="card p-10 text-center">

          <div className="text-4xl mb-3">
            🔍
          </div>

          <h2 className="font-heading text-xl text-ink">
            No matching orders
          </h2>

          <p className="text-ink-soft mt-2">
            No orders match your current search
            or status filter.
          </p>

          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg bg-palm text-white hover:opacity-90 transition"
          >
            Clear Filters
          </button>

        </div>

      ) : (

        /* =========================
           ORDERS TABLE
        ========================= */

        <div className="card overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              {/* TABLE HEADER */}

              <thead>

                <tr className="border-b border-line text-left bg-gray-50">

                  <th className="p-4">
                    Order
                  </th>

                  <th className="p-4">
                    Customer
                  </th>

                  <th className="p-4">
                    Product
                  </th>

                  <th className="p-4">
                    Amount
                  </th>

                  <th className="p-4">
                    Payment
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Date
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody>

                {filteredOrders.map((order) => {

                  const firstItem =
                    order.items?.[0];

                  const itemCount =
                    order.items?.reduce(
                      (total, item) =>
                        total +
                        Number(
                          item.quantity || 0
                        ),
                      0
                    ) || 0;

                  return (

                    <tr
                      key={order.id}
                      onClick={() =>
                        navigate(
                          `/admin/orders/${order.id}`
                        )
                      }
                      className="border-b border-line last:border-0 cursor-pointer hover:bg-gray-50 transition"
                    >

                      {/* ORDER */}

                      <td className="p-4">

                        <div>

                          <p className="font-semibold">
                            {order.order_number ||
                              `#${order.id.slice(
                                0,
                                8
                              )}`}
                          </p>

                          <p className="text-xs text-ink-soft mt-1">
                            ID: {order.id.slice(0, 8)}...
                          </p>

                        </div>

                      </td>

                      {/* CUSTOMER */}

                      <td className="p-4">

                        <div>

                          <p className="font-medium">
                            {order.address
                              ?.fullName ||
                              '-'}
                          </p>

                          <p className="text-xs text-ink-soft mt-1">
                            {order.address
                              ?.phone ||
                              '-'}
                          </p>

                        </div>

                      </td>

                      {/* PRODUCT */}

                      <td className="p-4">

                        <div className="flex items-center gap-3 min-w-[220px]">

                          {firstItem?.image ? (

                            <img
                              src={firstItem.image}
                              alt={
                                firstItem.name
                              }
                              className="w-12 h-12 rounded-lg object-cover border border-line flex-shrink-0"
                            />

                          ) : (

                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">
                                📦
                              </span>
                            </div>

                          )}

                          <div>

                            <p className="font-medium">
                              {firstItem?.name ||
                                'Product'}
                            </p>

                            {itemCount > 0 && (
                              <p className="text-xs text-ink-soft mt-1">
                                {itemCount}{' '}
                                item
                                {itemCount !== 1
                                  ? 's'
                                  : ''}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* AMOUNT */}

                      <td className="p-4">

                        <p className="font-semibold whitespace-nowrap">
                          ₹
                          {Number(
                            order.total || 0
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </p>

                      </td>

                      {/* PAYMENT */}

                      <td className="p-4">

                        <span className="capitalize">
                          {order.payment_method ||
                            '-'}
                        </span>

                        <p className="text-xs text-ink-soft mt-1 capitalize">
                          {order.payment_status ||
                            '-'}
                        </p>

                      </td>

                      {/* STATUS */}

                      <td
                        className="p-4"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >

                        <select
                          value={
                            order.order_status ||
                            'pending'
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              order.id,
                              event.target.value
                            )
                          }
                          className="px-3 py-2 rounded-lg border border-line bg-white cursor-pointer min-w-[145px]"
                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="processing">
                            Processing
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="out for delivery">
                            Out for Delivery
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>

                        </select>

                      </td>

                      {/* DATE */}

                      <td className="p-4 text-ink-soft whitespace-nowrap">

                        {order.created_at
                          ? new Date(
                              order.created_at
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          : '-'}

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}

