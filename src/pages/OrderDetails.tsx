import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
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
  Star,
  MessageSquare,
  Check,
} from 'lucide-react';

import {
  getOrderById,
  cancelOrder,
  updateOrderAddress,
  addReview,
} from '@/services/api';

import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';

const statusSteps = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out for delivery',
  'delivered',
];

type OrderItem = Order['items'][number];

type ReviewData = {
  rating: number;
  review: string;
};

export default function OrderDetails() {
  const { showToast } = useToast();
  const { id } = useParams();
   const { user, profile } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  /* =====================================================
     REVIEW STATE
  ===================================================== */

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<OrderItem | null>(null);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviews, setReviews] = useState<
    Record<string, ReviewData>
  >({});

  /* =====================================================
     ADDRESS FORM
  ===================================================== */

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
     LOAD SAVED REVIEWS
  ===================================================== */

  useEffect(() => {
    if (!id) return;

    try {
      const savedReviews = localStorage.getItem(
        `thennai_reviews_${id}`
      );

      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } catch (error) {
      console.error('Unable to load reviews:', error);
    }
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

      alert(
        error?.message ||
          'Unable to cancel order'
      );
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
     OPEN REVIEW MODAL
  ===================================================== */

  function openReviewModal(item: OrderItem) {
    if (!order) return;

    if (
      order.order_status?.toLowerCase() !==
      'delivered'
    ) {
      return;
    }

    const productId = String(
      item.product_id
    );

    const existingReview =
      reviews[productId];

    setSelectedItem(item);

    setReviewRating(
      existingReview?.rating || 0
    );

    setReviewText(
      existingReview?.review || ''
    );

    setShowReviewModal(true);
  }

  /* =====================================================
     CLOSE REVIEW MODAL
  ===================================================== */

  function closeReviewModal() {
    if (submittingReview) return;

    setShowReviewModal(false);
    setSelectedItem(null);
    setReviewRating(0);
    setReviewText('');
  }

  /* =====================================================
     SUBMIT REVIEW
  ===================================================== */

async function handleSubmitReview() {
  if (!order || !selectedItem) return;

  if (reviewRating === 0) {
    showToast(
      'Please select a star rating.',
      'error'
    );
    return;
  }

  if (!reviewText.trim()) {
    showToast(
      'Please write a review.',
      'error'
    );
    return;
  }

  try {
    setSubmittingReview(true);

    const productId = String(
      selectedItem.product_id
    );

    // Send review to Supabase
    await addReview(
      productId,
      user?.id ?? null,
      profile?.full_name ||
        user?.email ||
        'Customer',
      null,
      reviewRating,
      reviewText.trim()
    );

    // Keep local review state so UI immediately shows "Reviewed"
    const updatedReviews = {
      ...reviews,
      [productId]: {
        rating: reviewRating,
        review: reviewText.trim(),
      },
    };

    setReviews(updatedReviews);

    localStorage.setItem(
      `thennai_reviews_${order.id}`,
      JSON.stringify(updatedReviews)
    );

    setShowReviewModal(false);
    setSelectedItem(null);
    setReviewRating(0);
    setReviewText('');

    showToast(
      'Thank you! Your review has been submitted and is waiting for admin approval.',
      'success'
    );

  } catch (error: any) {
    console.error(
      'Review submit error:',
      error
    );

    showToast(
      error?.message ||
        'Unable to submit review. Please try again.',
      'error'
    );

  } finally {
    setSubmittingReview(false);
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
    statusSteps.indexOf(
      order.order_status
    );

  const isCancelled =
    order.order_status === 'cancelled';

  const isDelivered =
    order.order_status?.toLowerCase() ===
    'delivered';

  /*
    Customer can cancel/edit address ONLY before
    order reaches processing.
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

          {/* =================================================
              WRITE REVIEW - DELIVERED ONLY
          ================================================= */}

          {isDelivered && (
            <button
              type="button"
              onClick={() => {
                const firstUnreviewedItem =
                  order.items.find(
                    (item) =>
                      !reviews[
                        String(item.product_id)
                      ]
                  );

                openReviewModal(
                  firstUnreviewedItem ||
                    order.items[0]
                );
              }}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-palm
                text-white
                text-sm
                font-medium
                hover:bg-palm-deep
                transition
                shadow-sm
              "
            >
              <Star className="w-4 h-4" />
              Write a Review
            </button>
          )}

          {/* CANCEL ORDER */}

          {canModifyOrder && (
            <button
              onClick={() =>
                setShowCancelModal(true)
              }
              disabled={cancelling}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                border
                border-red-200
                text-red-600
                hover:bg-red-50
                disabled:opacity-50
              "
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

                {i <
                  statusSteps.length - 1 && (
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

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-heading text-lg text-ink">
                Items in this order
              </h2>

              {isDelivered && (
                <div className="flex items-center gap-1.5 text-xs text-palm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Review your products
                </div>
              )}

            </div>

            <div className="space-y-5">

              {order.items.map(
                (item, i) => {

                  const productId =
                    String(item.product_id);

                  const hasReview =
                    Boolean(
                      reviews[productId]
                    );

                  return (
                    <div
                      key={i}
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-4
                        sm:items-center
                        p-3
                        rounded-xl
                        hover:bg-bg-warm/40
                        transition
                      "
                    >

                      {/* PRODUCT IMAGE */}

                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-warm shrink-0">

                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />

                      </div>

                      {/* PRODUCT INFO */}

                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-medium text-ink line-clamp-1">
                          {item.name}
                        </p>

                        <p className="text-xs text-ink-soft">
                          {item.size} ×{' '}
                          {item.quantity}
                        </p>

                        {/* REVIEW STATUS */}

                        {isDelivered && (
                          <div className="mt-2">

                            {hasReview ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openReviewModal(
                                    item
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  text-xs
                                  font-medium
                                  text-palm
                                "
                              >
                                <Check className="w-3.5 h-3.5" />
                                Reviewed
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openReviewModal(
                                    item
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  px-3
                                  py-1.5
                                  rounded-full
                                  border
                                  border-palm
                                  text-palm
                                  text-xs
                                  font-medium
                                  hover:bg-palm
                                  hover:text-white
                                  transition
                                "
                              >
                                <Star className="w-3.5 h-3.5" />
                                Write a Review
                              </button>
                            )}

                          </div>
                        )}

                      </div>

                      {/* PRICE */}

                      <p className="font-mono text-sm font-medium text-ink">
                        {formatPrice(
                          item.price *
                            item.quantity
                        )}
                      </p>

                    </div>
                  );
                }
              )}

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
                  -
                  {formatPrice(
                    Number(order.discount)
                  )}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-ink-soft">
                  Delivery
                </span>

                <span className="font-mono text-ink">

                  {Number(
                    order.delivery_charge
                  ) === 0
                    ? 'FREE'
                    : formatPrice(
                        Number(
                          order.delivery_charge
                        )
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

              {canModifyOrder &&
                !editingAddress && (
                  <button
                    onClick={() =>
                      setEditingAddress(true)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      text-palm
                      hover:underline
                    "
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}

            </div>

            {/* VIEW ADDRESS */}

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
                  Phone:{' '}
                  {order.address.phone}
                </p>

              </div>

            ) : (

              /* EDIT ADDRESS */

              <div className="space-y-3">

                <input
                  value={
                    addressForm.fullName
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      fullName:
                        e.target.value,
                    })
                  }
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={
                    addressForm.phone
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      phone:
                        e.target.value,
                    })
                  }
                  placeholder="Phone"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={
                    addressForm.line1
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      line1:
                        e.target.value,
                    })
                  }
                  placeholder="Address Line 1"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={
                    addressForm.line2
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      line2:
                        e.target.value,
                    })
                  }
                  placeholder="Address Line 2"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={
                    addressForm.city
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      city:
                        e.target.value,
                    })
                  }
                  placeholder="City"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={
                    addressForm.state
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      state:
                        e.target.value,
                    })
                  }
                  placeholder="State"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                <input
                  value={
                    addressForm.pincode
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      pincode:
                        e.target.value,
                    })
                  }
                  placeholder="Pincode"
                  className="w-full px-3 py-2 rounded-lg border border-ink/10"
                />

                {/* BUTTONS */}

                <div className="flex gap-2 pt-2">

                  <button
                    onClick={
                      handleSaveAddress
                    }
                    disabled={
                      savingAddress
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-lg
                      bg-palm
                      text-white
                      text-sm
                      disabled:opacity-50
                    "
                  >
                    <Save className="w-4 h-4" />

                    {savingAddress
                      ? 'Saving...'
                      : 'Save Address'}
                  </button>

                  <button
                    onClick={() =>
                      setEditingAddress(
                        false
                      )
                    }
                    disabled={
                      savingAddress
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-lg
                      border
                      border-ink/10
                      text-sm
                    "
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
                    href={
                      order.tracking_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      mt-3
                      px-4
                      py-2
                      rounded-lg
                      bg-palm
                      text-white
                      text-sm
                      font-medium
                      hover:opacity-90
                      transition
                    "
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

                  {order.payment_method ===
                  'cod'
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

      {/* =====================================================
          CANCEL CONFIRMATION MODAL
      ===================================================== */}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

              <X className="h-7 w-7 text-red-600" />

            </div>

            <h2 className="text-center text-xl font-bold text-ink">
              Cancel Order?
            </h2>

            <p className="mt-3 text-center text-sm text-ink-soft">
              Are you sure you want to cancel
              this order? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setShowCancelModal(false)
                }
                disabled={cancelling}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-ink/10
                  px-4
                  py-3
                  font-medium
                  hover:bg-gray-50
                "
              >
                Keep Order
              </button>

              <button
                onClick={
                  handleCancelOrder
                }
                disabled={cancelling}
                className="
                  flex-1
                  rounded-xl
                  bg-red-600
                  px-4
                  py-3
                  font-medium
                  text-white
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >
                {cancelling
                  ? 'Cancelling...'
                  : 'Yes, Cancel'}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {showReviewModal &&
        selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">

                <div>

                  <h2 className="font-heading text-xl text-ink">
                    Write a Review
                  </h2>

                  <p className="text-sm text-ink-soft mt-1">
                    Share your experience with
                    this product
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeReviewModal
                  }
                  disabled={
                    submittingReview
                  }
                  className="
                    w-9
                    h-9
                    rounded-full
                    flex
                    items-center
                    justify-center
                    hover:bg-ink/5
                  "
                >
                  <X className="w-5 h-5 text-ink-soft" />
                </button>

              </div>

              {/* MODAL BODY */}

              <div className="p-6">

                {/* PRODUCT */}

                <div className="flex items-center gap-4 p-3 rounded-xl bg-bg-warm/50 mb-6">

                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-warm shrink-0">

                    <img
                      src={
                        selectedItem.image
                      }
                      alt={
                        selectedItem.name
                      }
                      className="w-full h-full object-cover"
                    />

                  </div>

                  <div>

                    <p className="font-medium text-ink">
                      {selectedItem.name}
                    </p>

                    <p className="text-sm text-ink-soft mt-1">
                      {selectedItem.size}
                    </p>

                  </div>

                </div>

                {/* STAR RATING */}

                <div className="mb-6">

                  <label className="block text-sm font-medium text-ink mb-3">
                    How would you rate this product?
                  </label>

                  <div className="flex items-center gap-2">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewRating(
                              star
                            )
                          }
                          className="
                            p-1
                            transition-transform
                            hover:scale-110
                          "
                          aria-label={`${star} star`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <=
                              reviewRating
                                ? 'fill-gold text-gold'
                                : 'text-ink/20'
                            }`}
                          />
                        </button>
                      )
                    )}

                  </div>

                  {reviewRating > 0 && (
                    <p className="text-xs text-ink-soft mt-2">
                      {reviewRating === 1 &&
                        'Poor'}
                      {reviewRating === 2 &&
                        'Fair'}
                      {reviewRating === 3 &&
                        'Good'}
                      {reviewRating === 4 &&
                        'Very Good'}
                      {reviewRating === 5 &&
                        'Excellent'}
                    </p>
                  )}

                </div>

                {/* REVIEW TEXT */}

                <div>

                  <label className="block text-sm font-medium text-ink mb-2">
                    Your Review
                  </label>

                  <textarea
                    value={reviewText}
                    onChange={(e) =>
                      setReviewText(
                        e.target.value
                      )
                    }
                    placeholder="Tell us what you liked about this product..."
                    rows={5}
                    maxLength={1000}
                    className="
                      w-full
                      rounded-xl
                      border
                      border-ink/10
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-ink
                      outline-none
                      resize-none
                      focus:border-palm
                      focus:ring-2
                      focus:ring-palm/10
                    "
                  />

                  <div className="flex justify-end mt-1">

                    <span className="text-xs text-ink-soft">
                      {reviewText.length}/1000
                    </span>

                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="flex gap-3 px-6 py-5 border-t border-ink/10 bg-bg-warm/20">

                <button
                  type="button"
                  onClick={
                    closeReviewModal
                  }
                  disabled={
                    submittingReview
                  }
                  className="
                    flex-1
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-ink/10
                    text-ink
                    font-medium
                    hover:bg-white
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSubmitReview
                  }
                  disabled={
                    submittingReview ||
                    reviewRating === 0 ||
                    !reviewText.trim()
                  }
                  className="
                    flex-1
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-3
                    rounded-xl
                    bg-palm
                    text-white
                    font-medium
                    hover:bg-palm-deep
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  <MessageSquare className="w-4 h-4" />

                  {submittingReview
                    ? 'Submitting...'
                    : 'Submit Review'}
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}