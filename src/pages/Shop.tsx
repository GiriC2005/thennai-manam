
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';

import type {
  Product,
  Category,
} from '@/lib/types';

import {
  getProducts,
  getCategories,
} from '@/services/api';

import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function Shop() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showFilters, setShowFilters] =
    useState(false);

  /* =====================================================
     URL PARAMETERS
  ===================================================== */

  const category =
    searchParams.get('category') ?? '';

  const search =
    searchParams.get('q') ?? '';

  const sort =
    searchParams.get('sort') ?? 'popular';

  const minPrice =
    searchParams.get('minPrice');

  const maxPrice =
    searchParams.get('maxPrice');

  const minRating =
    searchParams.get('minRating');

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  const fetchProducts = useCallback(
    async () => {
      setLoading(true);

      try {
        const data = await getProducts({
          category:
            category || undefined,

          search:
            search || undefined,

          sort:
            sort || undefined,

          minPrice:
            minPrice
              ? Number(minPrice)
              : undefined,

          maxPrice:
            maxPrice
              ? Number(maxPrice)
              : undefined,

          minRating:
            minRating
              ? Number(minRating)
              : undefined,
        });

        setProducts(data);
      } catch (error) {
        console.error(
          'SHOP PRODUCTS ERROR:',
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      minRating,
    ]
  );

  /* =====================================================
     LOAD CATEGORIES
  ===================================================== */

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => {
        console.error(
          'CATEGORIES ERROR:',
          error
        );

        setCategories([]);
      });
  }, []);

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* =====================================================
     UPDATE URL PARAM
  ===================================================== */

  function updateParam(
    key: string,
    value: string
  ) {
    const next =
      new URLSearchParams(
        searchParams
      );

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
  }

  /* =====================================================
     FILTER CONTENT
  ===================================================== */

  const FilterContent = () => (
    <div className="space-y-8">

      {/* =================================================
          CATEGORIES
      ================================================= */}

      <div>

        <h3 className="font-heading text-base text-ink mb-3">
          Categories
        </h3>

        <div className="space-y-2">

          <button
            type="button"
            onClick={() =>
              updateParam(
                'category',
                ''
              )
            }
            className={`
              block
              w-full
              text-left
              px-3
              py-2
              rounded-lg
              text-sm
              transition-colors
              ${
                !category
                  ? 'bg-palm/10 text-palm font-medium'
                  : 'text-ink-soft hover:bg-ink/5'
              }
            `}
          >
            All Products
          </button>

          {categories.map(
            (cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  updateParam(
                    'category',
                    cat.id
                  )
                }
                className={`
                  block
                  w-full
                  text-left
                  px-3
                  py-2
                  rounded-lg
                  text-sm
                  transition-colors
                  ${
                    category === cat.id
                      ? 'bg-palm/10 text-palm font-medium'
                      : 'text-ink-soft hover:bg-ink/5'
                  }
                `}
              >
                {cat.name}
              </button>
            )
          )}

        </div>
      </div>

      {/* =================================================
          PRICE RANGE
      ================================================= */}

      <div>

        <h3 className="font-heading text-base text-ink mb-3">
          Price Range
        </h3>

        <div className="space-y-2">

          {[
            {
              label: 'Under ₹300',
              min: '',
              max: '300',
            },
            {
              label: '₹300 - ₹500',
              min: '300',
              max: '500',
            },
            {
              label: '₹500 - ₹1000',
              min: '500',
              max: '1000',
            },
            {
              label: 'Above ₹1000',
              min: '1000',
              max: '',
            },
            {
              label: 'All Prices',
              min: '',
              max: '',
            },
          ].map((range) => {

            const active =
              (minPrice ?? '') ===
                range.min &&
              (maxPrice ?? '') ===
                range.max;

            return (
              <button
                key={range.label}
                type="button"
                onClick={() => {

                  const next =
                    new URLSearchParams(
                      searchParams
                    );

                  if (range.min) {
                    next.set(
                      'minPrice',
                      range.min
                    );
                  } else {
                    next.delete(
                      'minPrice'
                    );
                  }

                  if (range.max) {
                    next.set(
                      'maxPrice',
                      range.max
                    );
                  } else {
                    next.delete(
                      'maxPrice'
                    );
                  }

                  setSearchParams(
                    next
                  );
                }}
                className={`
                  block
                  w-full
                  text-left
                  px-3
                  py-2
                  rounded-lg
                  text-sm
                  transition-colors
                  ${
                    active
                      ? 'bg-palm/10 text-palm font-medium'
                      : 'text-ink-soft hover:bg-ink/5'
                  }
                `}
              >
                {range.label}
              </button>
            );
          })}

        </div>
      </div>

      {/* =================================================
          RATING
      ================================================= */}

      <div>

        <h3 className="font-heading text-base text-ink mb-3">
          Rating
        </h3>

        <div className="space-y-2">

          {[4, 3, 0].map(
            (rating) => {

              const value =
                rating
                  ? String(rating)
                  : '';

              const active =
                (minRating ?? '') ===
                value;

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    updateParam(
                      'minRating',
                      value
                    )
                  }
                  className={`
                    block
                    w-full
                    text-left
                    px-3
                    py-2
                    rounded-lg
                    text-sm
                    transition-colors
                    ${
                      active
                        ? 'bg-palm/10 text-palm font-medium'
                        : 'text-ink-soft hover:bg-ink/5'
                    }
                  `}
                >
                  {rating
                    ? `${rating}★ & above`
                    : 'All Ratings'}
                </button>
              );
            }
          )}

        </div>
      </div>

    </div>
  );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="container-page py-5 sm:py-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-5 sm:mb-8">

        <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-2">
          Shop
        </h1>

        <p className="text-sm sm:text-base text-ink-soft">
          Wood-pressed coconut oil from Pollachi farms
        </p>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="mb-5 sm:mb-6">

        <div className="relative">

          <Search
            className="
              absolute
              left-3
              sm:left-4
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              sm:w-5
              sm:h-5
              text-ink-soft
            "
          />

          <input
            type="text"
            defaultValue={search}
            placeholder="Search products..."
            onChange={(e) =>
              updateParam(
                'q',
                e.target.value
              )
            }
            className="
              input-field
              pl-10
              sm:pl-12
              text-sm
            "
          />

        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="flex gap-8">

        {/* =================================================
            DESKTOP SIDEBAR
        ================================================= */}

        <aside className="hidden lg:block w-64 shrink-0">

          <div className="sticky top-24">

            <FilterContent />

          </div>

        </aside>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="flex-1 min-w-0">

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="flex items-center justify-between mb-4 sm:mb-6">

            {/* Mobile Filter */}

            <button
              type="button"
              onClick={() =>
                setShowFilters(true)
              }
              className="
                lg:hidden
                flex
                items-center
                gap-2
                px-3
                sm:px-4
                py-2
                rounded-full
                bg-ink/5
                text-ink
                text-xs
                sm:text-sm
                font-medium
              "
            >
              <SlidersHorizontal className="w-4 h-4" />

              Filters
            </button>

            {/* Product Count */}

            <p className="text-sm text-ink-soft hidden lg:block">

              {loading
                ? 'Loading...'
                : `${products.length} product${
                    products.length !== 1
                      ? 's'
                      : ''
                  }`}

            </p>

            {/* Sort */}

            <select
              value={sort}
              onChange={(e) =>
                updateParam(
                  'sort',
                  e.target.value
                )
              }
              className="
                px-3
                sm:px-4
                py-2
                rounded-full
                bg-ink/5
                text-ink
                text-xs
                sm:text-sm
                font-medium
                border-0
                focus:outline-none
                focus:ring-1
                focus:ring-gold
                cursor-pointer
              "
            >
              <option value="popular">
                Popular
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating">
                Best Rated
              </option>

              <option value="newest">
                Newest
              </option>
            </select>

          </div>

          {/* =================================================
              PRODUCT GRID
          ================================================= */}

          {loading ? (

            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:gap-3
                lg:grid-cols-3
                lg:gap-6
              "
            >

              {Array.from({
                length: 6,
              }).map((_, i) => (
                <ProductCardSkeleton
                  key={i}
                />
              ))}

            </div>

          ) : products.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="text-center py-20">

              <p className="font-heading text-2xl text-ink mb-2">
                No products found
              </p>

              <p className="text-ink-soft mb-6">
                Try adjusting your filters or search.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSearchParams(
                    new URLSearchParams()
                  )
                }
                className="btn-secondary"
              >
                Clear all filters
              </button>

            </div>

          ) : (

            /* =================================================
               PRODUCTS
            ================================================= */

            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:gap-3
                lg:grid-cols-3
                lg:gap-6
              "
            >

              {products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {showFilters && (

        <div className="fixed inset-0 z-[60] lg:hidden">

          {/* Overlay */}

          <div
            className="
              absolute
              inset-0
              bg-ink/30
              backdrop-blur-sm
            "
            onClick={() =>
              setShowFilters(false)
            }
          />

          {/* Drawer */}

          <div
            className="
              absolute
              left-0
              top-0
              bottom-0
              w-80
              max-w-[85vw]
              bg-bg
              shadow-2xl
              animate-slide-in-left
              overflow-y-auto
            "
          >

            {/* Drawer Header */}

            <div
              className="
                flex
                items-center
                justify-between
                p-4
                border-b
                border-ink/5
                sticky
                top-0
                bg-bg
                z-10
              "
            >

              <span className="font-heading font-semibold text-ink">
                Filters
              </span>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(false)
                }
                className="
                  p-2
                  rounded-full
                  hover:bg-ink/5
                "
              >
                <X className="w-5 h-5 text-ink" />
              </button>

            </div>

            {/* Filter Content */}

            <div className="p-4">

              <FilterContent />

            </div>

            {/* Bottom Button */}

            <div
              className="
                p-4
                sticky
                bottom-0
                bg-bg
                border-t
                border-ink/5
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowFilters(false)
                }
                className="btn-primary w-full"
              >
                Show {products.length} results
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
