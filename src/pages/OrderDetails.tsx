import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  ExternalLink,
  Pencil,
  X,
  Save,
} from 'lucide-react';

import {
  getOrderById,
  cancelOrder,
  updateOrderAddress,
} from '@/services/api';

import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';
import Loader from '@/components/Loader';

const statusSteps = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out for delivery',
  'delivered',
];

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  /* =====================================================
     LOAD ORDER
  ===================================================== */

  useEffect(() => {
    if (!id) return;

    getOrderById(id)
      .then((data) => {
        setOrder(data);

        if (data?.address) {
          setAddressForm({
            fullName: data.address.fullName || '',
            phone: data.address.phone || '',
            line1: data.address.line1 || '',
            line2: data.address.line2 || '',
            city: data.address.city || '',
            state: data.address.state || '',
            pincode: data.address.pincode || '',
          });
        }
      })
      .catch((error) => {
        console.error('Get order error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  /* =====================================================
     CANCEL ORDER
     Allowed only before processing
  ===================================================== */

  async function handleCancelOrder() {
  if (!order) return;

  try {
    setCancelling(true);

    const updatedOrder = await cancelOrder(order.id);

    setOrder(updatedOrder);
    setShowCancelModal(false);
  } catch (error: any) {
    console.error('Cancel order error:', error);
    alert(error?.message || 'Unable to cancel order');
  } finally {
    setCancelling(false);
  }
}

  /* =====================================================
     SAVE ADDRESS
     Allowed only before processing
  ===================================================== */

  async function handleSaveAddress() {
    if (!order) return;

    try {
      setSavingAddress(true);

      const updatedOrder =
        await updateOrderAddress(
          order.id,
          addressForm
        );

      setOrder(updatedOrder);
      setEditingAddress(false);
    } catch (error: any) {
      console.error(
        'Address update error:',
        error
      );

      alert(
        error?.message ||
          'Unable to update address'
      );
    } finally {
      setSavingAddress(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return <Loader label="Loading order..." />;
  }

  /* =====================================================
     ORDER NOT FOUND
  ===================================================== */

  if (!order) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-heading text-2xl text-ink mb-2">
          Order not found
        </h1>

        <Link
          to="/orders"
          className="btn-primary mt-4 inline-block"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  /* =====================================================
     STATUS LOGIC
  ===================================================== */

  const currentStepIndex =
    statusSteps.indexOf(order.order_status);

  const isCancelled =
    order.order_status === 'cancelled';

  /*
    Customer can cancel/edit address ONLY before
    order reaches processing.

    Allowed:
    pending
    confirmed

    Not allowed:
    processing
    shipped
    out for delivery
    delivered
    cancelled
  */

  const canModifyOrder =
    ['pending', 'confirmed'].includes(
      order.order_status
    );

  return (
    <div className="container-page py-8">

      {/* =================================================
          BACK
      ================================================= */}

      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">

        <div>
          <h1 className="font-heading text-2xl lg:text-3xl text-ink">
            Order {order.order_number}
          </h1>

          <p className="text-sm text-ink-soft mt-1">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <span
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              isCancelled
                ? 'bg-red-100 text-red-700'
                : 'bg-palm/10 text-palm'
            }`}
          >
            {order.order_status}
          </span>

          {/* CANCEL ORDER */}
          
         {['pending', 'confirmed'].includes(
  order.order_status
) && (
  <button
    onClick={() => setShowCancelModal(true)}
    disabled={cancelling}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
  >
    <X className="w-4 h-4" />

    {cancelling
      ? 'Cancelling...'
      : 'Cancel Order'}
  </button>
)}

        </div>
      </div>

      {/* =================================================
          STATUS TRACKER
      ================================================= */}

      {!isCancelled && (
        <div className="card p-6 mb-8">

          <div className="flex items-center justify-between">

            {statusSteps.map((step, i) => (
              <div
                key={step}
                className="flex items-center flex-1 last:flex-none"
              >

                <div className="flex flex-col items-center gap-2">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      i <= currentStepIndex
                        ? 'bg-palm text-white'
                        : 'bg-ink/5 text-ink-soft'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-xs font-medium capitalize hidden sm:block ${
                      i <= currentStepIndex
                        ? 'text-palm'
                        : 'text-ink-soft'
                    }`}
                  >
                    {step}
                  </span>

                </div>

                {i < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      i < currentStepIndex
                        ? 'bg-palm'
                        : 'bg-ink/10'
                    }`}
                  />
                )}

              </div>
            ))}

          </div>
        </div>
      )}

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* =================================================
            LEFT - ITEMS
        ================================================= */}

        <div className="lg:col-span-2">

          <div className="card p-6">

            <h2 className="font-heading text-lg text-ink mb-4">
              Items in this order
            </h2>

            <div className="space-y-4">

              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center"
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

                    <p className="text-xs text-ink-soft">
                      {item.size} × {item.quantity}
                    </p>

                  </div>

                  <p className="font-mono text-sm font-medium text-ink">
                    {formatPrice(
                      item.price * item.quantity
                    )}
                  </p>

                </div>
              ))}

            </div>

            {/* SUMMARY */}

            <div className="border-t border-ink/10 mt-4 pt-4 space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-ink-soft">
                  Subtotal
                </span>

                <span className="font-mono text-ink">
                  {formatPrice(
                    Number(order.subtotal)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-soft">
                  Discount
                </span>

                <span className="font-mono text-palm">
                  -{formatPrice(
                    Number(order.discount)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-soft">
                  Delivery
                </span>

                <span className="font-mono text-ink">
                  {Number(order.delivery_charge) === 0
                    ? 'FREE'
                    : formatPrice(
                        Number(order.delivery_charge)
                      )}
                </span>
              </div>

              <div className="flex justify-between font-bold pt-2 border-t border-ink/10">

                <span className="text-ink">
                  Total
                </span>

                <span className="font-mono text-ink">
                  {formatPrice(
                    Number(order.total)
                  )}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="lg:col-span-1 space-y-4">

          {/* =================================================
              DELIVERY ADDRESS
          ================================================= */}

          <div className="card p-6">

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2">

                <MapPin className="w-4 h-4 text-palm" />

                <h3 className="font-heading text-base text-ink">
                  Delivery Address
                </h3>

              </div>

              {/* EDIT */}

              {['pending', 'confirmed'].includes(
  order.order_status
) && !editingAddress && (
  <button
    onClick={() =>
      setEditingAddress(true)
    }
    className="inline-flex items-center gap-1 text-sm text-palm hover:underline"
  >
    <Pencil className="w-3.5 h-3.5" />
    Edit
  </button>
)}

            </div>

            {/* =================================================
                VIEW ADDRESS
            ================================================= */}

            {!editingAddress ? (

              <div className="text-sm text-ink-soft space-y-1">

                <p className="font-medium text-ink">
                  {order.address.fullName}
                </p>

                <p>
                  {order.address.line1}
                </p>

                {order.address.line2 && (
                  <p>
                    {order.address.line2}
                  </p>
                )}

                <p>
                  {order.address.city},{' '}
                  {order.address.state} -{' '}
                  {order.address.pincode}
                </p>

                <p>
                  Phone: {order.address.phone}
                </p>

              </div>

            ) : (

              /* =================================================
                 EDIT ADDRESS
              ================================================= */

              <div className="space-y-3">

                <input
                  value={addressForm.fullName}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Phone"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={addressForm.line1}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      line1: e.target.value,
                    })
                  }
                  placeholder="Address Line 1"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={addressForm.line2}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      line2: e.target.value,
                    })
                  }
                  placeholder="Address Line 2"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      city: e.target.value,
                    })
                  }
                  placeholder="City"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      state: e.target.value,
                    })
                  }
                  placeholder="State"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={addressForm.pincode}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      pincode: e.target.value,
                    })
                  }
                  placeholder="Pincode"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                {/* BUTTONS */}

                <div className="flex gap-2 pt-2">

                  <button
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-palm text-white text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />

                    {savingAddress
                      ? 'Saving...'
                      : 'Save Address'}
                  </button>

                  <button
                    onClick={() =>
                      setEditingAddress(false)
                    }
                    disabled={savingAddress}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ink/10 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              TRACKING
          ================================================= */}

          {order.tracking_id && (
            <div className="card p-6">

              <div className="flex items-center gap-2 mb-3">

                <Truck className="w-4 h-4 text-palm" />

                <h3 className="font-heading text-base text-ink">
                  Delivery Tracking
                </h3>

              </div>

              <div className="text-sm space-y-2">

                {order.courier_name && (
                  <p className="text-ink-soft">
                    Courier:{' '}
                    <span className="font-medium text-ink">
                      {order.courier_name}
                    </span>
                  </p>
                )}

                <p className="text-ink-soft">
                  Tracking ID:{' '}
                  <span className="font-medium text-ink">
                    {order.tracking_id}
                  </span>
                </p>

                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-palm text-white text-sm font-medium hover:opacity-90 transition"
                  >
                    Track Order
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

              </div>

            </div>
          )}

          {/* =================================================
              PAYMENT
          ================================================= */}

          <div className="card p-6">

            <div className="flex items-center gap-2 mb-3">

              <CreditCard className="w-4 h-4 text-palm" />

              <h3 className="font-heading text-base text-ink">
                Payment
              </h3>

            </div>

            <div className="text-sm text-ink-soft space-y-1">

              <p>
                Method:{' '}
                <span className="capitalize text-ink">
                  {order.payment_method === 'cod'
                    ? 'Cash on Delivery'
                    : order.payment_method}
                </span>
              </p>

              <p>
                Status:{' '}
                <span className="capitalize text-ink">
                  {order.payment_status}
                </span>
              </p>

            </div>

          </div>

        </div>

      </div>
      {/* Cancel Confirmation Modal */}
{showCancelModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">

      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <X className="h-7 w-7 text-red-600" />
      </div>

      <h2 className="text-center text-xl font-bold text-ink">
        Cancel Order?
      </h2>

      <p className="mt-3 text-center text-sm text-ink-soft">
        Are you sure you want to cancel this order?
        This action cannot be undone.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setShowCancelModal(false)}
          disabled={cancelling}
          className="flex-1 rounded-xl border border-ink/10 px-4 py-3 font-medium hover:bg-gray-50"
        >
          Keep Order
        </button>

        <button
          onClick={handleCancelOrder}
          disabled={cancelling}
          className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
        </button>
      </div>

    </div>
  </div>
)}

    </div>
  );
}