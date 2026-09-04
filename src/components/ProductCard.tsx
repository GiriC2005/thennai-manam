import { Link } from 'react-router-dom';

import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
} from 'lucide-react';

import type { Product } from '@/lib/types';

import { useCart } from '@/context/CartContext';
import {
  useWishlist,
} from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';

import {
  formatPrice,
  discountPercent,
} from '@/lib/utils';

import { flyToTarget } from '@/lib/flyToTarget';

interface Props {
  product: Product;
  onQuickView?: (
    product: Product
  ) => void;
}

export default function ProductCard({
  product,
  onQuickView,
}: Props) {
  const { addToCart } =
    useCart();

  const {
    toggleWishlist,
    isWishlisted,
  } = useWishlist();

  const { showToast } =
    useToast();

  const wished =
    isWishlisted(product.id);

  const discount =
    discountPercent(
      product.mrp ?? 0,
      product.price
    );

  const outOfStock =
    product.stock <= 0;

  // ==========================================
  // FIND PRODUCT IMAGE
  // ==========================================

  function getProductImageElement(
    button: HTMLElement
  ) {
    const card =
      button.closest(
        '[data-product-card]'
      );

    if (!card) return null;

    return card.querySelector(
      '[data-product-image]'
    ) as HTMLElement | null;
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  function handleAddToCart(
    e: React.MouseEvent
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) return;

    const imageElement =
      getProductImageElement(
        e.currentTarget as HTMLElement
      );

    flyToTarget({
      source: imageElement,
      targetId: 'cart-target',
      imageUrl:
        product.images?.[0],
    });

    addToCart(
      product,
      1,
      product.sizes?.[0] ??
        'Standard'
    );

    showToast(
      `${product.name} added to cart`,
      'success'
    );
  }

  // ==========================================
  // WISHLIST
  // ==========================================

  function handleWishlist(
    e: React.MouseEvent
  ) {
    e.preventDefault();
    e.stopPropagation();

    const imageElement =
      getProductImageElement(
        e.currentTarget as HTMLElement
      );

    if (!wished) {
      flyToTarget({
        source: imageElement,
        targetId:
          'wishlist-target',
        imageUrl:
          product.images?.[0],
      });
    }

    toggleWishlist(product);

    showToast(
      wished
        ? 'Removed from wishlist'
        : 'Added to wishlist',
      'info'
    );
  }

  // ==========================================
  // QUICK VIEW
  // ==========================================

  function handleQuickView(
    e: React.MouseEvent
  ) {
    e.preventDefault();
    e.stopPropagation();

    onQuickView?.(product);
  }

  return (
    <div
      data-product-card
      className="
        group
        card
        overflow-hidden
        hover:shadow-lg
        transition-all
        duration-300
        flex
        flex-col
      "
    >
      {/* =====================================
          PRODUCT IMAGE
      ===================================== */}

      <div
        className="
          relative
          h-[100px]
          sm:h-[160px]
          lg:h-[220px]
          overflow-hidden
          bg-bg-warm
        "
      >
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full"
        >
          <img
            data-product-image
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            className="
              w-full
              h-full
              object-cover
              group-hover:scale-105
              transition-transform
              duration-500
            "
          />
        </Link>

        {/* BADGES */}

        <div
          className="
            absolute
            top-1.5
            left-1.5
            sm:top-3
            sm:left-3
            flex
            flex-col
            gap-1
            sm:gap-1.5
          "
        >
          {discount > 0 && (
            <span
              className="
                px-1.5
                py-0.5
                sm:px-2
                sm:py-1
                rounded-full
                bg-copper
                text-white
                text-[9px]
                sm:text-xs
                font-bold
                whitespace-nowrap
              "
            >
              {discount}% OFF
            </span>
          )}

          {product.best_seller && (
            <span
              className="
                px-1.5
                py-0.5
                sm:px-2
                sm:py-1
                rounded-full
                bg-gold
                text-white
                text-[9px]
                sm:text-xs
                font-bold
                whitespace-nowrap
              "
            >
              Best Seller
            </span>
          )}

          {outOfStock && (
            <span
              className="
                px-1.5
                py-0.5
                sm:px-2
                sm:py-1
                rounded-full
                bg-ink/70
                text-white
                text-[9px]
                sm:text-xs
                font-bold
                whitespace-nowrap
              "
            >
              Out of Stock
            </span>
          )}
        </div>

        {/* ACTION BUTTONS */}

        <div
          className="
            absolute
            top-1.5
            right-1.5
            sm:top-3
            sm:right-3
            flex
            flex-col
            gap-1.5
            sm:gap-2
          "
        >
          {/* WISHLIST */}

          <button
            onClick={
              handleWishlist
            }
            className="
              w-7
              h-7
              sm:w-9
              sm:h-9
              rounded-full
              bg-card/95
              backdrop-blur
              flex
              items-center
              justify-center
              shadow-sm
              transition-all
              hover:scale-110
            "
            aria-label="Add to wishlist"
          >
            <Heart
              className={`
                w-3.5
                h-3.5
                sm:w-4
                sm:h-4
                ${
                  wished
                    ? 'fill-copper text-copper'
                    : 'text-ink'
                }
              `}
            />
          </button>

          {/* QUICK VIEW */}

          {onQuickView && (
            <button
              onClick={
                handleQuickView
              }
              className="
                hidden
                sm:flex
                w-9
                h-9
                rounded-full
                bg-card/95
                backdrop-blur
                items-center
                justify-center
                shadow-sm
                transition-all
                hover:scale-110
              "
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4 text-ink" />
            </button>
          )}
        </div>

        {/* DESKTOP ADD TO CART */}

        {!outOfStock && (
          <button
            onClick={
              handleAddToCart
            }
            className="
              hidden
              sm:flex
              absolute
              bottom-0
              left-0
              right-0
              py-3
              bg-palm
              text-white
              text-sm
              font-medium
              translate-y-full
              group-hover:translate-y-0
              transition-transform
              duration-300
              items-center
              justify-center
              gap-2
            "
          >
            <ShoppingCart className="w-4 h-4" />

            Add to Cart
          </button>
        )}
      </div>

      {/* =====================================
          PRODUCT INFORMATION
      ===================================== */}

      <div
        className="
          p-2.5
          sm:p-4
          flex
          flex-col
          flex-1
        "
      >
        {product.category && (
          <p
            className="
              text-[9px]
              sm:text-xs
              text-ink-soft
              mb-0.5
              sm:mb-1
              line-clamp-1
            "
          >
            {product.category.name}
          </p>
        )}

        <Link
          to={`/product/${product.slug}`}
        >
          <h3
            className="
              font-heading
              font-medium
              text-ink
              text-sm
              sm:text-base
              leading-snug
              mb-1
              line-clamp-2
              hover:text-palm
              transition-colors
            "
          >
            {product.name}
          </h3>
        </Link>

        <p
          className="
            text-[10px]
            sm:text-xs
            text-ink-soft
            mb-1.5
            sm:mb-3
            line-clamp-1
          "
        >
          {product.short_description}
        </p>

        {/* RATING */}

        <div
          className="
            flex
            items-center
            gap-1
            mb-1.5
            sm:mb-3
          "
        >
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <Star
                  key={star}
                  className={`
                    w-2.5
                    h-2.5
                    sm:w-3.5
                    sm:h-3.5
                    ${
                      star <=
                      Math.round(
                        product.rating
                      )
                        ? 'fill-gold text-gold'
                        : 'text-ink/20'
                    }
                  `}
                />
              )
            )}
          </div>

          <span className="text-[9px] sm:text-xs text-ink-soft">
            ({product.review_count})
          </span>
        </div>

        {/* PRICE */}

        <div
          className="
            flex
            items-baseline
            gap-1.5
            sm:gap-2
            mt-auto
            flex-wrap
          "
        >
          <span
            className="
              font-mono
              text-base
              sm:text-lg
              font-bold
              text-ink
            "
          >
            {formatPrice(
              product.price
            )}
          </span>

          {product.mrp &&
            product.mrp >
              product.price && (
              <span
                className="
                  font-mono
                  text-[10px]
                  sm:text-sm
                  text-ink-soft
                  line-through
                "
              >
                {formatPrice(
                  product.mrp
                )}
              </span>
            )}

          {discount > 0 && (
            <span className="hidden sm:inline text-[10px] font-bold text-copper">
              {discount}% off
            </span>
          )}
        </div>

        {/* MOBILE ADD TO CART */}

        {!outOfStock && (
          <button
            onClick={
              handleAddToCart
            }
            className="
              sm:hidden
              mt-2
              w-full
              py-1.5
              rounded-md
              bg-palm
              text-white
              text-[11px]
              font-medium
              transition-colors
              flex
              items-center
              justify-center
              gap-1
            "
          >
            <ShoppingCart className="w-3 h-3" />

            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}