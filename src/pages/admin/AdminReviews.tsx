
import { useEffect, useState } from 'react';

import {
  Check,
  Trash2,
  Star,
  MapPin,
  Package,
} from 'lucide-react';

import {
  getAllReviews,
  approveReview,
  deleteReview,
} from '@/services/api';

import type {
  Review,
  Product,
} from '@/lib/types';

import { formatDate } from '@/lib/utils';

import { useToast } from '@/context/ToastContext';

import StarRating from '@/components/StarRating';

import Loader from '@/components/Loader';

type AdminReview = Review & {
  product: Product | null;
};

export default function AdminReviews() {
  const { showToast } = useToast();

  const [reviews, setReviews] =
    useState<AdminReview[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState<'pending' | 'approved' | 'all'>(
      'pending'
    );

  // ==============================
  // LOAD REVIEWS
  // ==============================

  async function loadReviews() {
    try {
      setLoading(true);

      console.log('Loading admin reviews...');

      const data = await getAllReviews();

      console.log('ADMIN REVIEWS:', data);

      setReviews(data || []);
    } catch (error) {
      console.error(
        'ADMIN REVIEWS ERROR:',
        error
      );

      showToast(
        'Failed to load reviews',
        'error'
      );

      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  // ==============================
  // APPROVE REVIEW
  // ==============================

  async function handleApprove(id: string) {
    try {
      await approveReview(id);

      setReviews((prev) =>
        prev.map((review) =>
          review.id === id
            ? {
                ...review,
                approved: true,
              }
            : review
        )
      );

      showToast(
        'Review approved',
        'success'
      );
    } catch (error) {
      console.error(
        'Approve review error:',
        error
      );

      showToast(
        'Failed to approve review',
        'error'
      );
    }
  }

  // ==============================
  // DELETE REVIEW
  // ==============================

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Delete this review?'
    );

    if (!confirmed) return;

    try {
      await deleteReview(id);

      setReviews((prev) =>
        prev.filter(
          (review) => review.id !== id
        )
      );

      showToast(
        'Review deleted',
        'info'
      );
    } catch (error) {
      console.error(
        'Delete review error:',
        error
      );

      showToast(
        'Failed to delete review',
        'error'
      );
    }
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <Loader label="Loading reviews..." />
    );
  }

  // ==============================
  // FILTER COUNTS
  // ==============================

  const pendingReviews =
    reviews.filter(
      (review) =>
        review.approved === false
    );

  const approvedReviews =
    reviews.filter(
      (review) =>
        review.approved === true
    );

  // ==============================
  // FILTERED REVIEWS
  // ==============================

  const filteredReviews =
    filter === 'pending'
      ? pendingReviews
      : filter === 'approved'
        ? approvedReviews
        : reviews;

  // ==============================
  // UI
  // ==============================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl text-ink">
          Reviews
        </h1>

        <p className="text-sm text-ink-soft mt-1">
          Manage customer reviews
          and approve them before
          displaying them publicly.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 flex-wrap">

        {/* PENDING */}
        <button
          onClick={() =>
            setFilter('pending')
          }
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-palm text-white'
              : 'bg-ink/5 text-ink-soft hover:bg-ink/10'
          }`}
        >
          Pending ({pendingReviews.length})
        </button>

        {/* APPROVED */}
        <button
          onClick={() =>
            setFilter('approved')
          }
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-palm text-white'
              : 'bg-ink/5 text-ink-soft hover:bg-ink/10'
          }`}
        >
          Approved ({approvedReviews.length})
        </button>

        {/* ALL */}
        <button
          onClick={() =>
            setFilter('all')
          }
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-palm text-white'
              : 'bg-ink/5 text-ink-soft hover:bg-ink/10'
          }`}
        >
          All ({reviews.length})
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredReviews.length === 0 ? (

        <div className="card p-12 text-center">

          <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-ink-soft" />
          </div>

          <p className="text-ink-soft">
            {filter === 'pending'
              ? 'No pending reviews.'
              : filter === 'approved'
                ? 'No approved reviews.'
                : 'No reviews yet.'}
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {filteredReviews.map(
            (review) => (

              <div
                key={review.id}
                className="card p-5"
              >

                <div className="flex items-start justify-between gap-5">

                  {/* REVIEW CONTENT */}
                  <div className="flex gap-4 flex-1 min-w-0">

                    {/* AVATAR */}
                    <div className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center text-gold font-heading font-semibold shrink-0">

                      {review.user_name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        'U'}

                    </div>

                    <div className="min-w-0 flex-1">

                      {/* NAME + STATUS + DATE */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">

                        <div className="flex items-center gap-2 flex-wrap">

                          <p className="font-medium text-ink">
                            {review.user_name ||
                              'Anonymous'}
                          </p>

                          {/* APPROVED BADGE */}
                          {review.approved === true && (
                            <span className="px-2 py-0.5 rounded-full bg-palm/10 text-palm text-xs font-medium">
                              Approved
                            </span>
                          )}

                          {/* PENDING BADGE */}
                          {review.approved === false && (
                            <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-medium">
                              Pending
                            </span>
                          )}

                        </div>

                        <span className="text-xs text-ink-soft">
                          {formatDate(
                            review.created_at
                          )}
                        </span>

                      </div>

                      {/* LOCATION */}
                      {review.user_location && (
                        <div className="flex items-center gap-1 text-xs text-ink-soft mt-1">

                          <MapPin className="w-3.5 h-3.5" />

                          <span>
                            {review.user_location}
                          </span>

                        </div>
                      )}

                      {/* PRODUCT */}
                      {review.product && (
                        <div className="flex items-center gap-1 text-xs text-gold mt-2">

                          <Package className="w-3.5 h-3.5" />

                          <span>
                            {review.product.name}
                          </span>

                        </div>
                      )}

                      {/* RATING */}
                      <div className="mt-3">

                        <StarRating
                          rating={review.rating}
                          size="sm"
                        />

                      </div>

                      {/* COMMENT */}
                      <p className="text-ink-soft mt-3 text-sm leading-relaxed">
                        {review.comment}
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 shrink-0">

                    {/* APPROVE */}
                    {review.approved === false && (
                      <button
                        onClick={() =>
                          handleApprove(
                            review.id
                          )
                        }
                        className="p-2.5 rounded-lg hover:bg-palm/10 text-ink-soft hover:text-palm transition-colors"
                        aria-label="Approve review"
                        title="Approve review"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {/* DELETE */}
                    <button
                      onClick={() =>
                        handleDelete(
                          review.id
                        )
                      }
                      className="p-2.5 rounded-lg hover:bg-copper/10 text-ink-soft hover:text-copper transition-colors"
                      aria-label="Delete review"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}
