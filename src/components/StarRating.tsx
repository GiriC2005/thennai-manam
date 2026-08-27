import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, size = 'sm' }: Props) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating) ? 'fill-gold text-gold' : 'text-ink/20'
          }`}
        />
      ))}
    </div>
  );
}
