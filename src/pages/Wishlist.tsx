import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
} from 'lucide-react';

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import {
  formatPrice,
  discountPercent,
} from '@/lib/utils';

export default function Wishlist() {
  const {
    items,
    removeFromWishlist,
    toggleWishlist,
  } = useWishlist();

  const { addToCart } = useCart();
  const { showToast } = useToast();

  function moveToCart(productId: string) {
    const product = items.find(
      (p) => p.id === productId
    );

    if (!product) return;

    addToCart(
      product,
      1,
      product.sizes?.[0] ?? 'Standard'
    );

    toggleWishlist(product);

    showToast(
      `${product.name} moved to cart`,
      'success'
    );
  }

  /* ==========================================
     EMPTY WISHLIST
  ========================================== */

  if (items.length === 0) {
    return (
      <div className="container-page py-12 sm:py-16 text-center px-4">
        <div className="
          w-16 h-16
          sm:w-20 sm:h-20
          rounded-full
          bg-ink/5
          flex
          items-center
          justify-center
          mx-auto
          mb-4
        ">
          <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-ink-soft" />
        </div>

        <h1 className="
          font-heading
          text-2xl
          sm:text-3xl
          text-ink
          mb-2
        ">
          Your wishlist is empty
        </h1>

        <p className="
          text-xs
          sm:text-sm
          text-ink-soft
          mb-6
        ">
          Save your favourite products here for later.
        </p>

        <Link
          to="/shop"
          className="btn-primary inline-flex"
        >
          Explore Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  /* ==========================================
     WISHLIST
  ========================================== */

  return (
    <div className="
      container-page
      py-4
      sm:py-6
      lg:py-7
      px-3
      sm:px-4
      lg:px-6
    ">

      {/* HEADER */}

      <div className="mb-4 sm:mb-5">

        <h1 className="
          font-heading
          text-xl
          sm:text-2xl
          lg:text-3xl
          text-ink
          mb-1
        ">
          Your Wishlist
        </h1>

        <p className="
          text-[11px]
          sm:text-xs
          text-ink-soft
        ">
          {items.length} item
          {items.length !== 1 ? 's' : ''} saved
        </p>

      </div>

      {/* PRODUCT GRID */}

      <div className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        gap-2
        sm:gap-3
        lg:gap-4
      ">

        {items.map((product) => {

          const discount = discountPercent(
            product.mrp ?? 0,
            product.price
          );

          return (
            <div
              key={product.id}
              className="
                bg-white
                border
                border-ink/10
                rounded-lg
                sm:rounded-xl
                overflow-hidden
                flex
                flex-col
                min-w-0
                shadow-sm
                hover:shadow-md
                transition-shadow
              "
            >

              {/* ======================================
                  IMAGE
              ====================================== */}

              <Link
                to={`/product/${product.slug}`}
                className="
                  relative
                  block
                  aspect-square
                  overflow-hidden
                  bg-bg-warm
                "
              >

                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  loading="lazy"
                  className="
                    w-full
                    h-full
                    object-cover
                    transition-transform
                    duration-300
                    hover:scale-105
                  "
                />

                {/* DISCOUNT */}

                {discount > 0 && (
                  <span className="
                    absolute
                    top-1.5
                    left-1.5
                    sm:top-2
                    sm:left-2
                    px-1.5
                    py-0.5
                    rounded
                    bg-copper
                    text-white
                    text-[8px]
                    sm:text-[9px]
                    font-bold
                  ">
                    {discount}% OFF
                  </span>
                )}

                {/* HEART / REMOVE */}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    removeFromWishlist(product.id);

                    showToast(
                      'Removed from wishlist',
                      'info'
                    );
                  }}
                  className="
                    absolute
                    top-1.5
                    right-1.5
                    sm:top-2
                    sm:right-2
                    w-6
                    h-6
                    sm:w-7
                    sm:h-7
                    rounded-full
                    bg-white
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    text-ink-soft
                    hover:text-copper
                    transition-colors
                  "
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="
                    w-3
                    h-3
                    sm:w-3.5
                    sm:h-3.5
                  " />
                </button>

              </Link>

              {/* ======================================
                  DETAILS
              ====================================== */}

              <div className="
                p-2
                sm:p-2.5
                lg:p-3
                flex
                flex-col
                flex-1
                min-w-0
              ">

                {/* NAME */}

                <Link
                  to={`/product/${product.slug}`}
                  className="block"
                >
                  <h3 className="
                    font-heading
                    text-[11px]
                    sm:text-xs
                    lg:text-sm
                    font-medium
                    text-ink
                    hover:text-palm
                    transition-colors
                    line-clamp-2
                    leading-tight
                    min-h-[26px]
                    sm:min-h-[30px]
                  ">
                    {product.name}
                  </h3>
                </Link>

                {/* DESCRIPTION */}

                <p className="
                  text-[9px]
                  sm:text-[10px]
                  text-ink-soft
                  mt-1
                  mb-1.5
                  sm:mb-2
                  line-clamp-1
                ">
                  {product.short_description}
                </p>

                {/* PRICE */}

                <div className="
                  flex
                  items-center
                  gap-1.5
                  mb-2
                  sm:mb-2.5
                  flex-wrap
                ">

                  <span className="
                    font-mono
                    font-bold
                    text-[11px]
                    sm:text-xs
                    lg:text-sm
                    text-ink
                  ">
                    {formatPrice(product.price)}
                  </span>

                  {product.mrp &&
                    product.mrp > product.price && (
                      <span className="
                        font-mono
                        text-[8px]
                        sm:text-[9px]
                        lg:text-[10px]
                        text-ink-soft
                        line-through
                      ">
                        {formatPrice(product.mrp)}
                      </span>
                    )}

                </div>

                {/* ======================================
                    ACTIONS
                ====================================== */}

                <div className="
                  flex
                  gap-1.5
                  mt-auto
                ">

                  <button
                    type="button"
                    onClick={() =>
                      moveToCart(product.id)
                    }
                    className="
                      flex-1
                      min-w-0
                      h-7
                      sm:h-8
                      lg:h-9
                      rounded
                      sm:rounded-md
                      bg-palm
                      text-white
                      text-[9px]
                      sm:text-[10px]
                      lg:text-xs
                      font-medium
                      hover:bg-palm-deep
                      transition-colors
                      flex
                      items-center
                      justify-center
                      gap-1
                      px-1
                    "
                  >
                    <ShoppingCart className="
                      w-3
                      h-3
                      flex-shrink-0
                    " />

                    <span className="truncate">
                      Move to Cart
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      removeFromWishlist(
                        product.id
                      );

                      showToast(
                        'Removed from wishlist',
                        'info'
                      );
                    }}
                    className="
                      w-7
                      sm:w-8
                      lg:w-9
                      h-7
                      sm:h-8
                      lg:h-9
                      flex-shrink-0
                      rounded
                      sm:rounded-md
                      border
                      border-ink/10
                      text-ink-soft
                      hover:text-copper
                      hover:border-copper/30
                      transition-colors
                      flex
                      items-center
                      justify-center
                    "
                    aria-label="Remove"
                  >
                    <Trash2 className="
                      w-3
                      h-3
                      sm:w-3.5
                      sm:h-3.5
                    " />
                  </button>

                </div>

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}