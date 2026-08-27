import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Printer,
} from 'lucide-react';

import {
  getAdminOrderById,
  updateOrderStatus,
  updateOrderTracking,
} from '@/services/api';

import type { Order } from '@/lib/types';

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [courierName, setCourierName] = useState('');
const [trackingId, setTrackingId] = useState('');
const [trackingUrl, setTrackingUrl] = useState('');
const [savingTracking, setSavingTracking] = useState(false);

  async function loadOrder() {
    try {
      setLoading(true);
      setError('');

      if (!id) {
        throw new Error('Order ID missing');
      }

      const data = await getAdminOrderById(id);

      if (!data) {
        throw new Error('Order not found');
      }

      setOrder(data);

      setCourierName(data.courier_name || '');
setTrackingId(data.tracking_id || '');
setTrackingUrl(data.tracking_url || '');
    } catch (err: any) {
      console.error('Admin order details error:', err);

      setError(
        err?.message || 'Unable to load order'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function handleStatusChange(status: string) {
    if (!order) return;

    try {
      await updateOrderStatus(
        order.id,
        status
      );

      setOrder({
        ...order,
        order_status: status,
      });
    } catch (err: any) {
      console.error(
        'Status update error:',
        err
      );

      alert(
        err?.message ||
          'Unable to update order status'
      );
    }
  }

  async function handleTrackingSave() {
  if (!order) return;

  try {
    setSavingTracking(true);

    const updatedOrder = await updateOrderTracking(
      order.id,
      {
        courier_name: courierName.trim(),
        tracking_id: trackingId.trim(),
        tracking_url: trackingUrl.trim(),
      }
    );

    setOrder(updatedOrder);

    alert('Tracking details saved successfully');
  } catch (err: any) {
    console.error(
      'Tracking update error:',
      err
    );

    alert(
      err?.message ||
        'Unable to save tracking details'
    );
  } finally {
    setSavingTracking(false);
  }
}

  function money(value: number | null | undefined) {
    const amount = Number(value || 0);

    return `INR ${amount.toLocaleString('en-IN')}`;
  }

  function printBill() {
    window.print();
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="card p-6">
          Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="card p-6">

          <h2 className="text-xl font-semibold text-red-600">
            Unable to load order
          </h2>

          <p className="mt-2 text-ink-soft">
            {error || 'Order not found'}
          </p>

          <button
            onClick={() =>
              navigate('/admin/orders')
            }
            className="mt-4 px-4 py-2 rounded-lg bg-palm text-white"
          >
            Back to Orders
          </button>

        </div>
      </div>
    );
  }

  const orderNumber =
    order.order_number ||
    `#${order.id.slice(0, 8)}`;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              navigate('/admin/orders')
            }
            className="w-10 h-10 rounded-lg border border-line flex items-center justify-center hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-heading text-3xl text-ink">
              Order Details
            </h1>

            <p className="text-ink-soft mt-1">
              {orderNumber}
            </p>
          </div>

        </div>

        <button
          onClick={printBill}
          className="px-4 py-2 rounded-lg bg-palm text-white flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Generate / Print Bill
        </button>

      </div>

      {/* INVOICE */}

      <div
        id="invoice"
        className="card bg-white p-6 sm:p-8 space-y-8"
      >

        {/* COMPANY HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 border-b border-line pb-6">

          <div>
            <h2 className="font-heading text-2xl text-ink">
              Pollachi Coconut Oil
            </h2>

            <p className="text-ink-soft mt-1">
              Pure - Natural - Traditional
            </p>
          </div>

          <div className="sm:text-right">

            <p className="text-sm text-ink-soft">
              INVOICE
            </p>

            <p className="font-semibold text-lg">
              {orderNumber}
            </p>

            <p className="text-sm text-ink-soft mt-1">
              {new Date(
                order.created_at
              ).toLocaleString('en-IN')}
            </p>

          </div>

        </div>

        {/* CUSTOMER + ADDRESS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CUSTOMER */}

          <div>

            <div className="flex items-center gap-2 mb-3">

              <User className="w-5 h-5 text-palm" />

              <h3 className="font-semibold">
                Customer
              </h3>

            </div>

            <p className="font-medium">
              {order.address?.fullName || '-'}
            </p>

            <div className="flex items-center gap-2 mt-2 text-sm text-ink-soft">

              <Phone className="w-4 h-4" />

              {order.address?.phone || '-'}

            </div>

          </div>

          {/* ADDRESS */}

          <div>

            <div className="flex items-center gap-2 mb-3">

              <MapPin className="w-5 h-5 text-palm" />

              <h3 className="font-semibold">
                Delivery Address
              </h3>

            </div>

            <p className="text-sm leading-6">

              {order.address?.line1 || '-'}

              <br />

              {order.address?.line2 && (
                <>
                  {order.address.line2}
                  <br />
                </>
              )}

              {order.address?.city || '-'},{' '}

              {order.address?.state || '-'}

              <br />

              PIN: {order.address?.pincode || '-'}

            </p>

          </div>

        </div>

        {/* ORDERED PRODUCTS */}

        <div>

          <div className="flex items-center gap-2 mb-4">

            <Package className="w-5 h-5 text-palm" />

            <h3 className="font-semibold text-lg">
              Ordered Products
            </h3>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-line text-left">

                  <th className="py-3">
                    Product
                  </th>

                  <th className="py-3">
                    Size
                  </th>

                  <th className="py-3">
                    Qty
                  </th>

                  <th className="py-3">
                    Price
                  </th>

                  <th className="py-3 text-right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {order.items?.map(
                  (item, index) => (

                    <tr
                      key={`${item.product_id}-${index}`}
                      className="border-b border-line last:border-0"
                    >

                      <td className="py-4">

                        <div className="flex items-center gap-3">

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 rounded-lg object-cover border border-line"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}

                          <span className="font-medium">
                            {item.name}
                          </span>

                        </div>

                      </td>

                      <td className="py-4">
                        {item.size || '-'}
                      </td>

                      <td className="py-4">
                        {item.quantity}
                      </td>

                      <td className="py-4">
                        {money(item.price)}
                      </td>

                      <td className="py-4 text-right font-medium">
                        {money(
                          item.price *
                          item.quantity
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="flex justify-end">

          <div className="w-full sm:w-80 space-y-3">

            <div className="flex justify-between text-sm">

              <span className="text-ink-soft">
                Subtotal
              </span>

              <span>
                {money(order.subtotal)}
              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-ink-soft">
                Discount
              </span>

              <span className="text-green-600">
                - {money(order.discount)}
              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-ink-soft">
                Delivery
              </span>

              <span>
                {Number(
                  order.delivery_charge || 0
                ) === 0
                  ? 'FREE'
                  : money(
                      order.delivery_charge
                    )}
              </span>

            </div>

            <div className="border-t border-line pt-3 flex justify-between">

              <span className="font-semibold text-lg">
                Grand Total
              </span>

              <span className="font-bold text-xl">
                {money(order.total)}
              </span>

            </div>

          </div>

        </div>

        {/* PAYMENT + STATUS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* PAYMENT */}

          <div className="border border-line rounded-xl p-5">

            <div className="flex items-center gap-2 mb-4">

              <CreditCard className="w-5 h-5 text-palm" />

              <h3 className="font-semibold">
                Payment
              </h3>

            </div>

            <p className="text-sm">

              Method:{' '}

              <span className="font-medium capitalize">
                {order.payment_method || '-'}
              </span>

            </p>

            <p className="text-sm mt-2">

              Payment Status:{' '}

              <span className="font-medium capitalize">
                {order.payment_status || '-'}
              </span>

            </p>

          </div>

          {/* STATUS */}

          <div className="border border-line rounded-xl p-5 print:hidden">

            <h3 className="font-semibold mb-3">
              Order Status
            </h3>

            <select
              value={
                order.order_status ||
                'pending'
              }
              onChange={(e) =>
                handleStatusChange(
                  e.target.value
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-line bg-white"
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

          </div>

        </div>

{/* COURIER TRACKING */}

<div className="border border-line rounded-xl p-5 print:hidden">

  <div className="flex items-center gap-2 mb-5">

    <Package className="w-5 h-5 text-palm" />

    <div>
      <h3 className="font-semibold text-lg">
        Courier Tracking
      </h3>

      <p className="text-sm text-ink-soft mt-1">
        Add courier and official tracking details
      </p>
    </div>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* COURIER */}

    <div>
      <label className="block text-sm font-medium mb-2">
        Courier Name
      </label>

      <input
        type="text"
        value={courierName}
        onChange={(e) =>
          setCourierName(e.target.value)
        }
        placeholder="Example: DTDC"
        className="w-full px-3 py-2.5 rounded-lg border border-line bg-white"
      />
    </div>

    {/* TRACKING ID */}

    <div>
      <label className="block text-sm font-medium mb-2">
        Tracking ID
      </label>

      <input
        type="text"
        value={trackingId}
        onChange={(e) =>
          setTrackingId(e.target.value)
        }
        placeholder="Example: D123456789"
        className="w-full px-3 py-2.5 rounded-lg border border-line bg-white"
      />
    </div>

    {/* TRACKING URL */}

    <div>
      <label className="block text-sm font-medium mb-2">
        Official Tracking URL
      </label>

      <input
        type="url"
        value={trackingUrl}
        onChange={(e) =>
          setTrackingUrl(e.target.value)
        }
        placeholder="https://..."
        className="w-full px-3 py-2.5 rounded-lg border border-line bg-white"
      />
    </div>

  </div>

  <div className="flex justify-end mt-5">

    <button
      type="button"
      onClick={handleTrackingSave}
      disabled={savingTracking}
      className="px-5 py-2.5 rounded-lg bg-palm text-white font-medium disabled:opacity-60"
    >
      {savingTracking
        ? 'Saving...'
        : 'Save Tracking Details'}
    </button>

  </div>

</div>
        {/* FOOTER */}

        <div className="border-t border-line pt-6 text-center text-sm text-ink-soft">

          <p>
            Thank you for shopping with
            Pollachi Coconut Oil.
          </p>

          <p className="mt-1">
            This is a computer-generated invoice.
          </p>

        </div>

      </div>

     {/* PRINT CSS */}

<style>
  {`
    @media print {

      /* A4 Vertical */
      @page {
        size: A4 portrait;
        margin: 12mm;
      }

      html,
      body {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }

      /* Hide everything */
      body * {
        visibility: hidden !important;
      }

      /* Show invoice only */
      #invoice,
      #invoice * {
        visibility: visible !important;
      }

      /* Put invoice at the top of the A4 page */
      #invoice {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;

        width: 100% !important;
        min-height: 0 !important;

        margin: 0 !important;
        padding: 0 !important;

        background: white !important;

        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      /* Prevent unnecessary page breaks */
      #invoice,
      #invoice > div {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }

      tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      img {
        max-width: 100% !important;
      }

      /* Hide elements specifically marked print:hidden */
      .print\\:hidden {
        display: none !important;
      }
    }
  `}
</style>
    </div>
  );
}