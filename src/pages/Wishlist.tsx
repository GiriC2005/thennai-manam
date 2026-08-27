import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, discountPercent } from '@/lib/utils';

export default function Wishlist() {
  const { items, removeFromWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  function moveToCart(productId: string) {
    const product = items.find((p) => p.id === productId);
    if (!product) return;
    addToCart(product, 1, product.sizes[0] ?? 'Standard');
    toggleWishlist(product);
    showToast(`${product.name} moved to cart`, 'success');
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-ink-soft" />
        </div>
        <h1 className="font-heading text-3xl text-ink mb-2">Your wishlist is empty</h1>
        <p className="text-ink-soft mb-8">Save your favourite products here for later.</p>
        <Link to="/shop" className="btn-primary">
          Explore Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-2">Your Wishlist</h1>
      <p className="text-ink-soft mb-8">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {items.map((product) => {
          const discount = discountPercent(product.mrp ?? 0, product.price);
          return (
            <div key={product.id} className="card overflow-hidden flex flex-col">
              <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-bg-warm">
                <img src={product.images[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-copper text-white text-xs font-bold">
                    {discount}% OFF
                  </span>
                )}
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="font-heading text-base text-ink hover:text-palm transition-colors mb-1 line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-xs text-ink-soft mb-3 line-clamp-1">{product.short_description}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono font-bold text-ink">{formatPrice(product.price)}</span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="font-mono text-xs text-ink-soft line-through">{formatPrice(product.mrp)}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => moveToCart(product.id)}
                    className="flex-1 py-2.5 rounded-full bg-palm text-white text-sm font-medium hover:bg-palm-deep transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => { removeFromWishlist(product.id); showToast('Removed from wishlist', 'info'); }}
                    className="p-2.5 rounded-full border border-ink/15 text-ink-soft hover:text-copper hover:border-copper/30 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
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
