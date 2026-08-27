
import { useEffect, useState } from 'react';
import { getProducts, getReviews } from '@/services/api';
import type { Review } from '@/lib/types';
import StarRating from '@/components/StarRating';
import Loader from '@/components/Loader';
import { formatDate } from '@/lib/utils';

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
            all.reduce((sum, review) => sum + review.rating, 0) /
              all.length
          );
        }
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <Loader label="Loading reviews..." />;
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-bg to-bg-warm py-16 lg:py-24">
        <div className="container-page text-center max-w-3xl mx-auto">
          <p className="text-gold text-sm font-medium mb-3">
            Customer Stories
          </p>

          <h1 className="font-heading text-4xl lg:text-5xl text-ink mb-4">
            Loved by families across India
          </h1>

          {avgRating > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <StarRating rating={avgRating} size="lg" />

              <span className="text-ink-soft text-lg">
                {avgRating.toFixed(1)} out of 5
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="container-page py-16">
        {reviews.length === 0 ? (
          <p className="text-center text-ink-soft py-12">
            No reviews yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="card p-6">
                {/* Rating */}
                <StarRating
                  rating={review.rating}
                  size="md"
                />

                {/* Comment */}
                <p className="text-ink-soft mt-4 leading-relaxed text-sm">
                  "{review.comment}"
                </p>

                {/* User */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-ink/10">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-heading font-semibold">
                    {review.user_name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-ink">
                      {review.user_name}
                    </p>

                    <p className="text-xs text-ink-soft">
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
