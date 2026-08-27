import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getProducts } from '@/services/api';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setLoading(false); setProducts([]); return; }
    setLoading(true);
    getProducts({ search: q })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-ink-soft" />
          <h1 className="font-heading text-2xl lg:text-3xl text-ink">Search Results</h1>
        </div>
        <p className="text-ink-soft">
          {loading ? 'Searching...' : `${products.length} result${products.length !== 1 ? 's' : ''} for "${q}"`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-heading text-2xl text-ink mb-2">No products found</p>
          <p className="text-ink-soft mb-6">Try a different search term.</p>
          <Link to="/shop" className="btn-primary">Browse All Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
