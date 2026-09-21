import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import thennaiManamLogo from '@/assets/tennai-manam-logo.png';

import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
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

  // ==========================================
  // LOAD ORDER
  // ==========================================

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
      console.error(
        'Admin order details error:',
        err
      );

      setError(
        err?.message ||
          'Unable to load order'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  async function handleStatusChange(
    status: string
  ) {
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

  // ==========================================
  // SAVE TRACKING
  // ==========================================

  async function handleTrackingSave() {
    if (!order) return;

    try {
      setSavingTracking(true);

      const updatedOrder =
        await updateOrderTracking(
          order.id,
          {
            courier_name:
              courierName.trim(),

            tracking_id:
              trackingId.trim(),

            tracking_url:
              trackingUrl.trim(),
          }
        );

      setOrder(updatedOrder);

      alert(
        'Tracking details saved successfully'
      );
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

  // ==========================================
  // MONEY
  // ==========================================

  function money(
    value: number | string | null | undefined
  ) {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString(
      'en-IN'
    )}`;
  }

  // ==========================================
  // PRINT
  // ==========================================

  function printBill() {
    window.print();
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-8">
        <div className="card p-6">
          Loading order details...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

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

  const paymentMethod =
    order.payment_method || '-';

  return (
    <div className="space-y-6">

      {/* ==================================================
          ADMIN HEADER
      ================================================== */}

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
          type="button"
          onClick={printBill}
          className="px-4 py-2 rounded-lg bg-palm text-white flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />

          Generate / Print Bill
        </button>

      </div>

      {/* ==================================================
          SCREEN INVOICE
      ================================================== */}

      <div
        id="invoice"
        className="card bg-white p-6 sm:p-8 space-y-8 print:hidden"
      >

        {/* COMPANY HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 border-b border-line pb-6">

          <div>
            <h2 className="font-heading text-2xl text-ink">
              Thennai Manam
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

              PIN:{' '}
              {order.address?.pincode || '-'}

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
                          Number(item.price) *
                          Number(item.quantity)
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

          {/* PAYMENT METHOD */}

          <div className="border border-line rounded-xl p-5">

            <h3 className="font-semibold mb-3">
              Payment
            </h3>

            <p className="text-sm text-ink-soft">
              Method
            </p>

            <p className="font-medium capitalize mt-1">
              {paymentMethod}
            </p>

          </div>

          {/* STATUS */}

          <div className="border border-line rounded-xl p-5">

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

        {/* ==================================================
            COURIER TRACKING
        ================================================== */}

        <div className="border border-line rounded-xl p-5">

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
                  setCourierName(
                    e.target.value
                  )
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
                  setTrackingId(
                    e.target.value
                  )
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
                  setTrackingUrl(
                    e.target.value
                  )
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
            Thennai Manam.
          </p>

          <p className="mt-1">
            Pure - Natural - Traditional
          </p>

        </div>

      </div>

      {/* ==================================================
          80MM THERMAL PRINT RECEIPT

          SCREEN:
          Hidden

          PRINT:
          Only this section appears
      ================================================== */}

      <div
        id="thermal-receipt"
        className="thermal-receipt"
      >

        {/* HEADER */}

        <div className="receipt-header">
  <img
    src={thennaiManamLogo}
    alt="Thennai Manam"
    className="receipt-logo"
  />

  <p>
    Pure - Natural - Traditional
  </p>

  <p>
    Coconut Oil & Natural Products
  </p>
</div>

        <div className="receipt-line" />

        {/* ORDER INFO */}

        <div className="receipt-order">

          <div>

            <span>
              ORDER
            </span>

            <strong>
              {orderNumber}
            </strong>

          </div>

          <div>

            <span>
              DATE
            </span>

            <strong>
              {new Date(
                order.created_at
              ).toLocaleDateString(
                'en-IN'
              )}
            </strong>

          </div>

        </div>

        <div className="receipt-order receipt-order-time">

          <div>

            <span>
              TIME
            </span>

            <strong>
              {new Date(
                order.created_at
              ).toLocaleTimeString(
                'en-IN',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </strong>

          </div>

          <div>

            <span>
              STATUS
            </span>

            <strong className="capitalize">
              {order.order_status ||
                'pending'}
            </strong>

          </div>

        </div>

        <div className="receipt-line" />

        {/* CUSTOMER */}

        <div className="receipt-section">

          <strong>
            CUSTOMER
          </strong>

          <p>
            {order.address?.fullName ||
              '-'}
          </p>

          <p>
            {order.address?.phone ||
              '-'}
          </p>

        </div>

        {/* DELIVERY ADDRESS */}

        <div className="receipt-section">

          <strong>
            DELIVERY ADDRESS
          </strong>

          <p>
            {order.address?.line1 ||
              '-'}
          </p>

          {order.address?.line2 && (
            <p>
              {order.address.line2}
            </p>
          )}

          <p>
            {order.address?.city ||
              '-'}
            ,{' '}
            {order.address?.state ||
              '-'}
          </p>

          <p>
            PIN:{' '}
            {order.address?.pincode ||
              '-'}
          </p>

        </div>

        <div className="receipt-line" />

        {/* ITEMS */}

        <div className="receipt-section">

          <strong>
            ORDERED ITEMS
          </strong>

          {order.items?.map(
            (item, index) => {

              const itemTotal =
                Number(item.price) *
                Number(item.quantity);

              return (
                <div
                  key={`${item.product_id}-${index}`}
                  className="receipt-item"
                >

                  <div className="receipt-item-name">

                    <span>
                      {item.name}
                    </span>

                    {item.size && (
                      <small>
                        {item.size}
                      </small>
                    )}

                  </div>

                  <span className="receipt-qty">
                    {item.quantity}
                  </span>

                  <strong>
                    {money(itemTotal)}
                  </strong>

                </div>
              );
            }
          )}

        </div>

        <div className="receipt-line" />

        {/* SUMMARY */}

        <div className="receipt-summary">

          <div>

            <span>
              Subtotal
            </span>

            <span>
              {money(order.subtotal)}
            </span>

          </div>

          <div>

            <span>
              Discount
            </span>

            <span>
              - {money(order.discount)}
            </span>

          </div>

          <div>

            <span>
              Delivery
            </span>

            <span>
              {Number(
                order.delivery_charge ||
                  0
              ) === 0
                ? 'FREE'
                : money(
                    order.delivery_charge
                  )}
            </span>

          </div>

          <div className="receipt-total">

            <strong>
              TOTAL
            </strong>

            <strong>
              {money(order.total)}
            </strong>

          </div>

        </div>

        <div className="receipt-line" />

        {/* PAYMENT */}

        <div className="receipt-payment">

          <strong>
            PAYMENT
          </strong>

          <p>
            Method:{' '}
            <span className="capitalize">
              {paymentMethod}
            </span>
          </p>

        </div>

        {/* COURIER */}

        {(order.courier_name ||
          order.tracking_id) && (
          <>
            <div className="receipt-line" />

            <div className="receipt-payment">

              <strong>
                DELIVERY
              </strong>

              {order.courier_name && (
                <p>
                  Courier:{' '}
                  {order.courier_name}
                </p>
              )}

              {order.tracking_id && (
                <p>
                  Tracking:{' '}
                  {order.tracking_id}
                </p>
              )}

            </div>
          </>
        )}

        <div className="receipt-line" />

        {/* FOOTER */}

        <div className="receipt-footer">

          <strong>
            Thank You!
          </strong>

          <p>
            Thank you for shopping with
          </p>

          <p>
            Thennai Manam
          </p>

          <p className="receipt-small">
            Pure by Nature 🌴
          </p>

        </div>

      </div>

      {/* ==================================================
          PRINT CSS
      ================================================== */}

      <style>
        {`

          /* --------------------------------------------
             NORMAL SCREEN
          -------------------------------------------- */

          .thermal-receipt {
            display: none;
          }


          /* --------------------------------------------
             PRINT
          -------------------------------------------- */

          @media print {

            @page {
              size: 80mm auto;
              margin: 0;
            }

            html,
            body {
              width: 80mm !important;
              min-width: 80mm !important;
              max-width: 80mm !important;

              margin: 0 !important;
              padding: 0 !important;

              background: #ffffff !important;
            }


            /* Hide EVERYTHING */

            body * {
              visibility: hidden !important;
            }


            /* Show ONLY receipt */

            #thermal-receipt,
            #thermal-receipt * {
              visibility: visible !important;
            }


            /* Receipt container */

            #thermal-receipt {
              display: block !important;

              position: absolute !important;

              top: 0 !important;
              left: 0 !important;

              width: 80mm !important;
              min-width: 80mm !important;
              max-width: 80mm !important;

              box-sizing: border-box !important;

              margin: 0 !important;

              padding: 4mm !important;

              background: #ffffff !important;

              color: #000000 !important;

              font-family:
                Arial,
                Helvetica,
                sans-serif !important;

              font-size: 10px !important;

              line-height: 1.35 !important;

              overflow: visible !important;
            }


            #thermal-receipt *,
            #thermal-receipt *::before,
            #thermal-receipt *::after {
              box-sizing: border-box !important;

              color: #000000 !important;
            }


            /* --------------------------------------------
               HEADER
            -------------------------------------------- */

            .receipt-header {
              width: 100% !important;

              text-align: center !important;

              margin: 0 0 3mm 0 !important;

              padding: 0 !important;
            }

            .receipt-logo {
  display: block !important;
  width: 64mm !important;
  max-width: 100% !important;
  height: auto !important;
  margin: 0 auto 2mm auto !important;
  object-fit: contain !important;
}
            .receipt-header p {
              margin: 1px 0 !important;

              padding: 0 !important;

              font-size: 9px !important;

              line-height: 1.3 !important;
            }


            /* --------------------------------------------
               DIVIDER
            -------------------------------------------- */

            .receipt-line {
              width: 100% !important;

              height: 0 !important;

              border-top:
                1px dashed #000000 !important;

              margin:
                3mm 0 !important;

              padding: 0 !important;
            }


            /* --------------------------------------------
               ORDER INFO
            -------------------------------------------- */

            .receipt-order {
              width: 100% !important;

              display: flex !important;

              flex-direction: row !important;

              justify-content:
                space-between !important;

              align-items: flex-start !important;

              gap: 3mm !important;

              margin: 0 !important;

              padding: 0 !important;
            }

            .receipt-order-time {
              margin-top: 2mm !important;
            }

            .receipt-order > div {
              display: flex !important;

              flex-direction: column !important;

              width: 50% !important;

              min-width: 0 !important;
            }

            .receipt-order > div:last-child {
              text-align: right !important;

              align-items: flex-end !important;
            }

            .receipt-order span {
              font-size: 8px !important;

              line-height: 1.2 !important;

              font-weight: 400 !important;
            }

            .receipt-order strong {
              font-size: 10px !important;

              line-height: 1.3 !important;

              font-weight: 700 !important;

              overflow-wrap:
                anywhere !important;
            }


            /* --------------------------------------------
               SECTIONS
            -------------------------------------------- */

            .receipt-section {
              width: 100% !important;

              margin:
                3mm 0 !important;

              padding: 0 !important;
            }

            .receipt-section > strong {
              display: block !important;

              margin:
                0 0 1.5mm 0 !important;

              padding: 0 !important;

              font-size: 9px !important;

              line-height: 1.2 !important;

              font-weight: 700 !important;
            }

            .receipt-section p {
              margin:
                0 0 0.7mm 0 !important;

              padding: 0 !important;

              font-size: 9.5px !important;

              line-height: 1.35 !important;

              overflow-wrap:
                anywhere !important;
            }


            /* --------------------------------------------
               ITEMS
            -------------------------------------------- */

            .receipt-item {
              width: 100% !important;

              display: grid !important;

              grid-template-columns:
                minmax(0, 1fr)
                9mm
                20mm !important;

              column-gap: 1.5mm !important;

              align-items:
                start !important;

              margin: 0 !important;

              padding:
                2mm 0 !important;

              border-bottom:
                1px dotted #999 !important;
            }

            .receipt-item-name {
              min-width: 0 !important;

              display: flex !important;

              flex-direction:
                column !important;
            }

            .receipt-item-name span {
              display: block !important;

              font-size: 9px !important;

              line-height: 1.3 !important;

              font-weight: 600 !important;

              overflow-wrap:
                anywhere !important;
            }

            .receipt-item-name small {
              display: block !important;

              margin-top: 0.5mm !important;

              font-size: 8px !important;

              line-height: 1.2 !important;
            }

            .receipt-qty {
              text-align:
                center !important;

              font-size: 9px !important;

              white-space:
                nowrap !important;
            }

            .receipt-item > strong {
              text-align:
                right !important;

              font-size: 9px !important;

              line-height: 1.3 !important;

              white-space:
                nowrap !important;
            }


            /* --------------------------------------------
               SUMMARY
            -------------------------------------------- */

            .receipt-summary {
              width: 100% !important;

              margin: 0 !important;

              padding: 0 !important;
            }

            .receipt-summary > div {
              width: 100% !important;

              display: flex !important;

              justify-content:
                space-between !important;

              align-items:
                center !important;

              gap: 3mm !important;

              margin:
                1.5mm 0 !important;

              padding: 0 !important;
            }

            .receipt-summary span {
              font-size: 9.5px !important;
            }

            .receipt-total {
              border-top:
                1px solid #000000 !important;

              border-bottom:
                1px solid #000000 !important;

              margin-top:
                2.5mm !important;

              padding:
                2.5mm 0 !important;
            }

            .receipt-total strong {
              font-size: 12px !important;

              font-weight: 700 !important;
            }


            /* --------------------------------------------
               PAYMENT
            -------------------------------------------- */

            .receipt-payment {
              width: 100% !important;

              margin: 0 !important;

              padding: 0 !important;
            }

            .receipt-payment > strong {
              display: block !important;

              font-size: 9px !important;

              line-height: 1.2 !important;

              margin-bottom:
                1.5mm !important;
            }

            .receipt-payment p {
              margin:
                0 0 1mm 0 !important;

              padding: 0 !important;

              font-size: 9.5px !important;

              line-height: 1.3 !important;

              overflow-wrap:
                anywhere !important;
            }


            /* --------------------------------------------
               FOOTER
            -------------------------------------------- */

            .receipt-footer {
              width: 100% !important;

              text-align:
                center !important;

              margin:
                5mm 0 1mm 0 !important;

              padding: 0 !important;
            }

            .receipt-footer strong {
              display: block !important;

              margin-bottom:
                1mm !important;

              font-size: 13px !important;

              line-height: 1.2 !important;

              font-weight: 700 !important;
            }

            .receipt-footer p {
              margin:
                1px 0 !important;

              padding: 0 !important;

              font-size: 8.5px !important;

              line-height: 1.3 !important;
            }

            .receipt-footer .receipt-small {
              margin-top:
                2mm !important;

              font-size: 8px !important;
            }


            /* --------------------------------------------
               PAGE BREAK CONTROL
            -------------------------------------------- */

            #thermal-receipt,
            .receipt-section,
            .receipt-item,
            .receipt-summary,
            .receipt-footer {
              break-inside: avoid !important;

              page-break-inside:
                avoid !important;
            }

          }

        `}
      </style>

    </div>
  );
}