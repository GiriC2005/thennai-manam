
import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';

import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';

import type { Product, Review } from '@/lib/types';

import {
  getProductBySlug,
  getReviews,
  addReview,
  getProducts,
} from '@/services/api';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

import {
  formatPrice,
  discountPercent,
  formatDate,
} from '@/lib/utils';

import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';

export default function ProductDetails() {
  const { slug } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    location: '',
  });

  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    setActiveTab('description');

    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);

        if (!p) return;

        getReviews(p.id)
          .then(setReviews)
          .catch((error) => {
            console.error('PRODUCT REVIEWS ERROR:', error);
            setReviews([]);
          });

        if (p.category_id) {
          getProducts({
            category: p.category_id,
            limit: 4,
          })
            .then((prods) => {
              setRelated(
                prods
                  .filter((item) => item.id !== p.id)
                  .slice(0, 4)
              );
            })
            .catch((error) => {
              console.error(
                'RELATED PRODUCTS ERROR:',
                error
              );
              setRelated([]);
            });
        } else {
          setRelated([]);
        }
      })
      .catch((error) => {
        console.error('PRODUCT LOAD ERROR:', error);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  function createSafeProduct() {
    if (!product) return null;

    const safeStock =
      Number(product.stock) > 0
        ? Number(product.stock)
        : 999;

    return {
      ...product,
      stock: safeStock,
      images: Array.isArray(product.images)
        ? product.images
        : [],
      sizes: Array.isArray(product.sizes)
        ? product.sizes
        : [],
      price: Number(product.price) || 0,
      mrp:
        Number(product.mrp) ||
        Number(product.price) ||
        0,
    };
  }

  function handleAddToCart() {
    if (!product) {
      showToast('Product not available', 'error');
      return;
    }

    const safeProduct = createSafeProduct();

    if (!safeProduct) return;

    const safeStock = Number(safeProduct.stock);

    const safeQuantity = Math.min(
      Math.max(1, quantity),
      safeStock
    );

    addToCart(
      safeProduct,
      safeQuantity,
      'Standard'
    );

    showToast(
      `${product.name} added to cart`,
      'success'
    );
  }

  function handleBuyNow() {
    if (!product) {
      showToast('Product not available', 'error');
      return;
    }

    const safeProduct = createSafeProduct();

    if (!safeProduct) return;

    const safeStock = Number(safeProduct.stock);

    const safeQuantity = Math.min(
      Math.max(1, quantity),
      safeStock
    );

    addToCart(
      safeProduct,
      safeQuantity,
      'Standard'
    );

    window.location.href = '/cart';
  }

  function handleWishlist() {
    if (!product) return;

    const alreadyWishlisted =
      isWishlisted(product.id);

    toggleWishlist(product);

    showToast(
      alreadyWishlisted
        ? 'Removed from wishlist'
        : 'Added to wishlist',
      'info'
    );
  }

  async function handleSubmitReview(
    e: FormEvent
  ) {
    e.preventDefault();

    if (!user || !product) return;

    if (!reviewForm.comment.trim()) {
      showToast(
        'Please write a review',
        'error'
      );
      return;
    }

    setSubmittingReview(true);

    try {
      await addReview(
        product.id,
        user.id,
        profile?.full_name ||
          user.email ||
          'Anonymous',
        reviewForm.location.trim(),
        reviewForm.rating,
        reviewForm.comment.trim()
      );

      showToast(
        'Review submitted! It will appear after approval.',
        'success'
      );

      setReviewForm({
        rating: 5,
        comment: '',
        location: '',
      });
    } catch (error) {
      console.error(
        'Review submission error:',
        error
      );

      showToast(
        'Failed to submit review',
        'error'
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <Loader label="Loading product..." />
    );
  }

  if (!product) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-heading text-2xl sm:text-3xl text-ink mb-2">
          Product not found
        </h1>

        <Link
          to="/shop"
          className="btn-primary mt-4"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const discount = discountPercent(
    product.mrp ?? 0,
    product.price
  );

  const outOfStock =
    Number(product.stock) <= 0;

  const wished =
    isWishlisted(product.id);

  const tabs = [
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'ingredients',
      label: 'Ingredients',
    },
    {
      key: 'benefits',
      label: 'Benefits',
    },
    {
      key: 'how-to-use',
      label: 'How to Use',
    },
    {
      key: 'storage',
      label: 'Storage',
    },
  ];

  return (
    <div className="container-page py-4 sm:py-6 lg:py-8">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <nav className="text-[11px] sm:text-sm text-ink-soft mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 flex-wrap">

        <Link
          to="/"
          className="hover:text-ink"
        >
          Home
        </Link>

        <span>/</span>

        <Link
          to="/shop"
          className="hover:text-ink"
        >
          Shop
        </Link>

        <span>/</span>

        <span className="text-ink line-clamp-1">
          {product.name}
        </span>

      </nav>

      {/* =================================================
          PRODUCT SECTION
      ================================================= */}

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <div className="w-full">

          {/* MOBILE IMAGE SIZE FIX */}

          <div className="
            w-full
            max-w-[280px]
            sm:max-w-[420px]
            lg:max-w-none
            mx-auto
            aspect-square
            rounded-xl
            sm:rounded-2xl
            overflow-hidden
            bg-bg-warm
            mb-3
            sm:mb-4
          ">

            {product.images?.length > 0 ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-soft text-sm">
                No image available
              </div>
            )}

          </div>

          {/* THUMBNAILS */}

          {product.images?.length > 1 && (
            <div className="
              flex
              justify-center
              gap-2
              sm:gap-3
              flex-wrap
            ">

              {product.images.map(
                (img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() =>
                      setActiveImage(i)
                    }
                    className={`

                      w-12
                      h-12
                      sm:w-20
                      sm:h-20

                      rounded-lg
                      sm:rounded-xl

                      overflow-hidden
                      border-2
                      transition-colors

                      ${
                        activeImage === i
                          ? 'border-gold'
                          : 'border-transparent hover:border-ink/20'
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              )}

            </div>
          )}

        </div>

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div className="pt-1 sm:pt-0">

          {/* CATEGORY */}

          {product.category && (
            <Link
              to={`/shop?category=${product.category_id}`}
              className="
                text-xs
                sm:text-sm
                text-gold
                font-medium
                mb-1
                sm:mb-2
                inline-block
              "
            >
              {product.category.name}
            </Link>
          )}

          {/* NAME */}

          <h1 className="
            font-heading
            text-2xl
            sm:text-3xl
            lg:text-4xl
            leading-tight
            text-ink
            mb-2
            sm:mb-3
          ">
            {product.name}
          </h1>

          {/* RATING */}

          <div className="
            flex
            items-center
            gap-2
            sm:gap-3
            mb-3
            sm:mb-4
          ">

            <StarRating
              rating={product.rating}
              size="sm"
            />

            <span className="text-xs sm:text-sm text-ink-soft">
              {product.rating} (
              {product.review_count} reviews)
            </span>

          </div>

          {/* DESCRIPTION */}

          <p className="
            text-sm
            sm:text-base
            text-ink-soft
            leading-relaxed
            mb-4
            sm:mb-6
          ">
            {product.short_description}
          </p>

          {/* PRICE */}

          <div className="
            flex
            items-baseline
            gap-2
            sm:gap-3
            mb-4
            sm:mb-6
            flex-wrap
          ">

            <span className="
              font-mono
              text-2xl
              sm:text-3xl
              font-bold
              text-ink
            ">
              {formatPrice(product.price)}
            </span>

            {product.mrp &&
              product.mrp > product.price && (
                <>
                  <span className="
                    font-mono
                    text-sm
                    sm:text-lg
                    text-ink-soft
                    line-through
                  ">
                    {formatPrice(product.mrp)}
                  </span>

                  <span className="
                    px-2
                    py-0.5
                    sm:py-1
                    rounded-full
                    bg-copper/10
                    text-copper
                    text-[10px]
                    sm:text-sm
                    font-bold
                  ">
                    {discount}% OFF
                  </span>
                </>
              )}

          </div>

          {/* STOCK */}

          <div className="mb-4 sm:mb-6">

            {outOfStock ? (
              <span className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                sm:text-sm
                text-copper
                font-medium
              ">
                <span className="w-2 h-2 rounded-full bg-copper" />
                Out of Stock
              </span>
            ) : (
              <span className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                sm:text-sm
                text-palm
                font-medium
              ">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                In Stock ({product.stock} available)
              </span>
            )}

          </div>

          {/* QUANTITY */}

          <div className="mb-4 sm:mb-6">

            <p className="
              text-xs
              sm:text-sm
              font-medium
              text-ink
              mb-1.5
              sm:mb-2
            ">
              Quantity
            </p>

            <div className="
              inline-flex
              items-center
              border
              border-ink/15
              rounded-full
            ">

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.max(1, q - 1)
                  )
                }
                className="
                  p-2
                  sm:p-2.5
                  hover:bg-ink/5
                  rounded-l-full
                  transition-colors
                "
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <span className="
                px-3
                sm:px-4
                font-mono
                text-sm
                sm:text-base
                font-medium
                w-10
                sm:w-12
                text-center
              ">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(
                      Number(product.stock) > 0
                        ? Number(product.stock)
                        : 999,
                      q + 1
                    )
                  )
                }
                disabled={outOfStock}
                className="
                  p-2
                  sm:p-2.5
                  hover:bg-ink/5
                  rounded-r-full
                  transition-colors
                  disabled:opacity-50
                "
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

            </div>

          </div>

          {/* ACTION BUTTONS */}

          <div className="
            grid
            grid-cols-[1fr_1fr_auto]
            gap-2
            sm:flex
            sm:flex-wrap
            sm:gap-3
            mb-5
            sm:mb-6
          ">

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="
                btn-primary
                flex-1
                min-w-0
                sm:min-w-[160px]
                text-xs
                sm:text-sm
                px-3
                sm:px-5
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="
                btn-gold
                flex-1
                min-w-0
                sm:min-w-[160px]
                text-xs
                sm:text-sm
                px-3
                sm:px-5
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              className="
                p-2.5
                sm:p-3
                rounded-full
                border
                border-ink/15
                bg-card
                hover:border-ink/30
                transition-colors
              "
              aria-label="Wishlist"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  wished
                    ? 'fill-copper text-copper'
                    : 'text-ink'
                }`}
              />
            </button>

          </div>

          {/* TRUST BADGES */}

          <div className="
            grid
            grid-cols-3
            gap-2
            sm:gap-3
            pt-4
            sm:pt-6
            border-t
            border-ink/10
          ">

            <TrustBadge
              icon={Truck}
              label="Free Delivery"
              sub="Above ₹500"
            />

            <TrustBadge
              icon={Shield}
              label="Secure Payment"
              sub="100% protected"
            />

            <TrustBadge
              icon={RotateCcw}
              label="Easy Returns"
              sub="7-day return"
            />

          </div>

        </div>
      </div>

      {/* =================================================
          PRODUCT TABS
      ================================================= */}

      <div className="mt-8 sm:mt-12 lg:mt-16">

        <div className="
          flex
          gap-0
          border-b
          border-ink/10
          overflow-x-auto
          scrollbar-hide
          mb-4
          sm:mb-6
        ">

          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                setActiveTab(tab.key)
              }
              className={`

                px-3
                sm:px-4

                py-2.5
                sm:py-3

                text-[11px]
                sm:text-sm

                font-medium
                whitespace-nowrap
                border-b-2
                transition-colors

                ${
                  activeTab === tab.key
                    ? 'border-palm text-palm'
                    : 'border-transparent text-ink-soft hover:text-ink'
                }
              `}
            >
              {tab.label}
            </button>
          ))}

        </div>

        <div className="
          prose
          prose-sm
          max-w-none
          text-ink-soft
          leading-relaxed
          text-sm
        ">

          {activeTab === 'description' && (
            <p>
              {product.description ||
                'Not specified'}
            </p>
          )}

          {activeTab === 'ingredients' && (
            <p>
              {product.ingredients ||
                'Not specified'}
            </p>
          )}

          {activeTab === 'benefits' && (
            <p>
              {product.benefits ||
                'Not specified'}
            </p>
          )}

          {activeTab === 'how-to-use' && (
            <p>
              {product.how_to_use ||
                'Not specified'}
            </p>
          )}

          {activeTab === 'storage' && (
            <p>
              {product.storage_instructions ||
                'Store in a cool, dry place away from direct sunlight.'}
            </p>
          )}

        </div>

      </div>

      {/* =================================================
          REVIEWS
      ================================================= */}

      <div className="mt-8 sm:mt-12 lg:mt-16">

        <h2 className="
          font-heading
          text-xl
          sm:text-2xl
          text-ink
          mb-4
          sm:mb-6
        ">
          Customer Reviews ({reviews.length})
        </h2>

        {user ? (

          <form
            onSubmit={handleSubmitReview}
            className="card p-4 sm:p-6 mb-6 sm:mb-8"
          >

            <h3 className="
              font-heading
              text-base
              sm:text-lg
              text-ink
              mb-4
            ">
              Write a Review
            </h3>

            <div className="mb-4">

              <p className="text-xs sm:text-sm font-medium text-ink mb-2">
                Your Rating
              </p>

              <div className="flex gap-1">

                {[1, 2, 3, 4, 5].map(
                  (r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setReviewForm(
                          (f) => ({
                            ...f,
                            rating: r,
                          })
                        )
                      }
                    >
                      <Star
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          r <= reviewForm.rating
                            ? 'fill-gold text-gold'
                            : 'text-ink/20'
                        }`}
                      />
                    </button>
                  )
                )}

              </div>

            </div>

            <div className="mb-4">

              <label
                htmlFor="review-location"
                className="block text-xs sm:text-sm font-medium text-ink mb-2"
              >
                Your Location
              </label>

              <input
                id="review-location"
                type="text"
                value={reviewForm.location}
                onChange={(e) =>
                  setReviewForm(
                    (f) => ({
                      ...f,
                      location: e.target.value,
                    })
                  )
                }
                placeholder="Eg: Pollachi, Tamil Nadu"
                className="input-field"
              />

            </div>

            <div className="mb-4">

              <label
                htmlFor="review-comment"
                className="block text-xs sm:text-sm font-medium text-ink mb-2"
              >
                Your Review
              </label>

              <textarea
                id="review-comment"
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm(
                    (f) => ({
                      ...f,
                      comment: e.target.value,
                    })
                  )
                }
                placeholder="Share your experience..."
                rows={4}
                className="input-field"
              />

            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="btn-primary disabled:opacity-50"
            >
              {submittingReview
                ? 'Submitting...'
                : 'Submit Review'}
            </button>

          </form>

        ) : (

          <div className="card p-4 sm:p-6 mb-6 sm:mb-8 text-center">

            <p className="text-sm text-ink-soft mb-3">
              Please sign in to write a review.
            </p>

            <Link
              to="/login"
              className="btn-secondary"
            >
              Sign In
            </Link>

          </div>

        )}

        {reviews.length === 0 ? (

          <p className="text-sm text-ink-soft text-center py-8">
            No reviews yet. Be the first to review!
          </p>

        ) : (

          <div className="space-y-3 sm:space-y-4">

            {reviews.map((review) => (

              <div
                key={review.id}
                className="card p-4 sm:p-6"
              >

                <div className="flex items-start gap-3 sm:gap-4">

                  <div className="
                    w-9
                    h-9
                    sm:w-10
                    sm:h-10
                    rounded-full
                    bg-gold/20
                    flex
                    items-center
                    justify-center
                    text-gold
                    font-heading
                    font-semibold
                    shrink-0
                  ">
                    {review.user_name
                      ?.charAt(0)
                      ?.toUpperCase() || 'A'}
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-2
                      mb-1
                    ">

                      <p className="font-medium text-sm text-ink">
                        {review.user_name}
                      </p>

                      <span className="text-[10px] sm:text-xs text-ink-soft whitespace-nowrap">
                        {formatDate(
                          review.created_at
                        )}
                      </span>

                    </div>

                    {review.user_location && (
                      <p className="text-[10px] sm:text-xs text-ink-soft mb-2">
                        {review.user_location}
                      </p>
                    )}

                    <StarRating
                      rating={review.rating}
                      size="sm"
                    />

                    <p className="text-xs sm:text-sm text-ink-soft mt-2 leading-relaxed">
                      {review.comment}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* =================================================
          RELATED PRODUCTS
      ================================================= */}

      {related.length > 0 && (

        <div className="mt-10 sm:mt-16">

          <h2 className="
            font-heading
            text-xl
            sm:text-2xl
            text-ink
            mb-4
            sm:mb-6
          ">
            Related Products
          </h2>

          <div className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-3
            sm:gap-4
            lg:gap-6
          ">

            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

/* =====================================================
   TRUST BADGE
===================================================== */

function TrustBadge({
  icon: Icon,
  label,
  sub,
}: {
  icon: any;
  label: string;
  sub: string;
}) {
  return (
    <div className="text-center">

      <Icon className="
        w-4
        h-4
        sm:w-5
        sm:h-5
        text-palm
        mx-auto
        mb-1
      " />

      <p className="
        text-[10px]
        sm:text-xs
        font-medium
        text-ink
      ">
        {label}
      </p>

      <p className="
        text-[8px]
        sm:text-[10px]
        text-ink-soft
      ">
        {sub}
      </p>

    </div>
  );
}

