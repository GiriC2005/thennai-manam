import { useEffect, useState } from 'react';
import { getProducts, getReviews } from '@/services/api';
import type { Review } from '@/lib/types';
import StarRating from '@/components/StarRating';
import Loader from '@/components/Loader';
import { formatDate } from '@/lib/utils';
import ScrollReveal from '@/components/ScrollReveal';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const products = await getProducts({ limit: 20 });

        const all: Review[] = [];

        for (const p of products) {
          const revs = await getReviews(p.id);
          all.push(...revs);
        }

        all.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setReviews(all);

        if (all.length > 0) {
          setAvgRating(
            all.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / all.length
          );
        }
      } catch (error) {
        console.error('REVIEWS LOAD ERROR:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <Loader label="Loading reviews..." />;
  }

  return (
    <div className="overflow-x-hidden">

      {/* =========================================
          HERO
      ========================================= */}

      <section
        className="
          bg-gradient-to-br
          from-bg
          to-bg-warm
          py-10
          sm:py-14
          lg:py-20
        "
      >
        <ScrollReveal>
          <div
            className="
              container-page
              text-center
              max-w-3xl
              mx-auto
              px-4
              sm:px-6
            "
          >

            <p
              className="
                text-gold
                text-[11px]
                sm:text-sm
                font-medium
                mb-2
                sm:mb-3
              "
            >
              Customer Stories
            </p>

            <h1
              className="
                font-heading
                text-2xl
                sm:text-4xl
                lg:text-5xl
                leading-tight
                text-ink
                mb-3
                sm:mb-4
              "
            >
              Loved by families across India
            </h1>

            {avgRating > 0 && (
              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  sm:gap-3
                  mt-3
                  sm:mt-4
                "
              >
                <StarRating
                  rating={avgRating}
                  size="sm"
                />

                <span
                  className="
                    text-ink-soft
                    text-xs
                    sm:text-lg
                  "
                >
                  {avgRating.toFixed(1)} out of 5
                </span>
              </div>
            )}

          </div>
        </ScrollReveal>
      </section>


      {/* =========================================
          REVIEWS
      ========================================= */}

      <section
        className="
          container-page
          py-8
          sm:py-14
          lg:py-16
          px-4
          sm:px-6
        "
      >

        {reviews.length === 0 ? (

          <p
            className="
              text-center
              text-ink-soft
              text-sm
              py-12
            "
          >
            No reviews yet.
          </p>

        ) : (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-3
              sm:gap-5
              lg:gap-6
            "
          >

            {reviews.map((review) => (

              <div
                key={review.id}
                className="
                  card
                  p-3.5
                  sm:p-5
                  lg:p-6
                  rounded-xl
                  sm:rounded-2xl
                "
              >

                {/* =========================
                    RATING
                ========================= */}

                <StarRating
                  rating={review.rating}
                  size="sm"
                />


                {/* =========================
                    COMMENT
                ========================= */}

                <p
                  className="
                    text-ink-soft
                    mt-2.5
                    sm:mt-3
                    lg:mt-4
                    leading-relaxed
                    text-[11px]
                    sm:text-xs
                    lg:text-sm
                  "
                >
                  "{review.comment}"
                </p>


                {/* =========================
                    USER
                ========================= */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    sm:gap-2.5
                    lg:gap-3
                    mt-3.5
                    sm:mt-4
                    lg:mt-6
                    pt-3.5
                    sm:pt-4
                    lg:pt-5
                    border-t
                    border-ink/10
                  "
                >

                  {/* Avatar */}

                  <div
                    className="
                      w-7
                      h-7
                      sm:w-8
                      sm:h-8
                      lg:w-10
                      lg:h-10
                      rounded-full
                      bg-gold/20
                      flex
                      items-center
                      justify-center
                      text-gold
                      text-xs
                      sm:text-sm
                      lg:text-base
                      font-heading
                      font-semibold
                      flex-shrink-0
                    "
                  >
                    {review.user_name
                      ?.charAt(0)
                      ?.toUpperCase() || 'A'}
                  </div>


                  {/* User Details */}

                  <div className="min-w-0 flex-1">

                    <p
                      className="
                        text-[11px]
                        sm:text-xs
                        lg:text-sm
                        font-medium
                        text-ink
                        truncate
                      "
                    >
                      {review.user_name || 'Anonymous'}
                    </p>

                    <p
                      className="
                        text-[9px]
                        sm:text-[10px]
                        lg:text-xs
                        text-ink-soft
                        truncate
                        mt-0.5
                      "
                    >
                      {review.user_location
                        ? `${review.user_location} • `
                        : ''}
                      {formatDate(review.created_at)}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}