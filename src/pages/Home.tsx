import { Link } from 'react-router-dom';
import { Leaf, TreePine, Droplets, Truck, ArrowRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product, Category, Review } from '@/lib/types';
import { getProducts, getCategories, getReviews } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import StarRating from '@/components/StarRating';
import { formatPrice } from '@/lib/utils';
import heroimg from '@/assets/hero.png';
export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ bestSeller: true, limit: 4 }),
      getCategories(),
      getReviews('00000000-0000-0000-0000-000000000000').catch(() => []),
    ]).then(([products, cats]) => {
      setBestSellers(products);
      setCategories(cats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch a few approved reviews for display
  useEffect(() => {
    (async () => {
      try {
        const products = await getProducts({ limit: 8 });
        const allReviews: Review[] = [];
        for (const p of products) {
          const revs = await getReviews(p.id);
          allReviews.push(...revs.slice(0, 1));
        }
        setReviews(allReviews.slice(0, 3));
      } catch { /* noop */ }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
     {/* Hero */}
<section className="relative overflow-hidden bg-gradient-to-br from-bg via-bg to-bg-warm">
  <div className="container-page pt-2 pb-12 lg:pt-4 lg:pb-20">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-palm/10 text-palm text-sm font-medium mb-6">
          <Leaf className="w-4 h-4" />
          Farm-to-bottle, Pollachi
        </div>

        <h1 className="font-heading text-4xl lg:text-3x2 font-semibold text-ink leading-tight mb-2">
          மரச்செக்கில் ஆட்டிய <br/> தூய்மை
        </h1>

        <p className="font-heading text-3xl lg:text-1xl text-ink-soft mb-6">
          Cold-pressed & the marachekku way.
        </p>

        <p className="text-ink-soft text-base lg:text-lg leading-relaxed max-w-lg mb-5">
          From Pollachi coconut farms to your kitchen. Traditional wood pressing, no unnecessary heat, no chemicals — freshly bottled.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link to="/shop" className="btn-primary">
            Shop the Oil
            <ArrowRight className="w-3 h-4" />
          </Link>

          <Link to="/our-process" className="btn-secondary">
            Our Process
          </Link>
        </div>

        { <div className="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-ink/10">
          <Stat value="40+" label="Partner Farms" />
          <Stat value="1st" label="Quality" />
          <Stat value="~1 Day" label="Tree to Bottle" />
          <Stat value="0" label="Preservatives" />
        </div> }
      </div>

      {/* Hero image */}
      {/* Hero image */}
<div className="relative animate-fade-in lg:-translate-y-10">
  <div className="relative aspect-[6/4] rounded-3xl overflow-hidden shadow-3xl">
    <img
      src={heroimg}
      alt="Pollachi coconut oil bottle"
      className="w-full h-full object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
  </div>

  {/* Floating card */}
  {/* <div className="absolute -bottom-4 -left-4 lg:-left-8 bg-card rounded-2xl shadow-xl p-4 border border-ink/5 max-w-[200px] animate-float">
    <div className="flex items-center gap-1 mb-0.5">
  <StarRating rating={5} size="sm" />
</div>

<p className="text-[6px] sm:text-[10px] lg:text-xs text-ink-soft leading-tight">
  "Pure and authentic — this is how coconut oil should taste."
</p>

<p className="text-[6px] sm:text-[10px] lg:text-xs text-ink font-medium mt-0.5">
  — Dharun
</p>
  </div> */}
</div>

    </div>
  </div>
</section>
      {/* USP / Trust section */}
      <section className="container-page py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <USPCard icon={Leaf} title="100% Natural" desc="No chemicals or unnecessary additives" />
          <USPCard icon={TreePine} title="Wood Pressed" desc="Traditional marachekku cold pressing" />
          <USPCard icon={Droplets} title="Rich in Goodness" desc="Natural aroma and quality" />
          <USPCard icon={Truck} title="Fast Delivery" desc="Delivered safely to your doorstep" />
        </div>
      </section>

      {/* Shop by category */}
      <section className="container-page py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold text-sm font-medium mb-1">Explore</p>
            <h2 className="font-heading text-3xl lg:text-4xl text-ink">Shop by Category</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1 text-palm text-sm font-medium hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden card hover:shadow-lg transition-all"
            >
              <img
                src={cat.image_url ?? ''}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-heading text-lg text-white font-medium mb-1">{cat.name}</h3>
                <p className="text-white/70 text-xs line-clamp-1 mb-2">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-gold text-xs font-medium group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="container-page py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold text-sm font-medium mb-1">Most loved</p>
            <h2 className="font-heading text-3xl lg:text-4xl text-ink">Best Sellers</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1 text-palm text-sm font-medium hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Our Process preview */}
      <section className="bg-palm-deep text-bg py-20 mt-12">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-gold text-sm font-medium mb-2">The marachekku method</p>
            <h2 className="font-heading text-3xl lg:text-4xl text-bg mb-4">From Coconut to Bottle</h2>
            <p className="text-bg/70 leading-relaxed">
              Five careful steps, each one rooted in tradition. No shortcuts, no chemicals — just the way it's been done in Pollachi for generations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gold text-white font-heading font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-heading text-lg text-bg mb-2">{step.title}</h3>
                <p className="text-bg/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/our-process" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-white font-medium hover:bg-gold-deep transition-colors">
              See the full process <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Pollachi */}
      <section className="container-page py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/13071432/pexels-photo-13071432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Pollachi coconut farms"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-xl p-6 border border-ink/5 hidden sm:block">
              <p className="font-heading text-3xl text-palm font-bold">40+</p>
              <p className="text-xs text-ink-soft">Partner Farms</p>
            </div>
          </div>
          <div>
            <p className="text-gold text-sm font-medium mb-2">Why Pollachi</p>
            <h2 className="font-heading text-3xl lg:text-4xl text-ink mb-6">A tradition rooted in the soil</h2>
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p>
                Pollachi's red soil and tropical climate produce some of India's finest coconuts. Our partner farms have been cultivating coconuts for generations, using methods that work with nature, not against it.
              </p>
              <p>
                We work directly with 40+ family farms, ensuring fair prices and traceable sourcing. Every bottle tells a story — from the tree to the marachekku press to your home.
              </p>
              <p>
                No preservatives. No additives. No unnecessary heat. Just pure, wood-pressed coconut oil the way it's been made for centuries.
              </p>
            </div>
            <Link to="/why-pollachi" className="btn-secondary mt-8">
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="bg-ink text-bg py-20">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-gold text-sm font-medium mb-2">Customer stories</p>
              <h2 className="font-heading text-3xl lg:text-4xl text-bg mb-4">Loved by families across India</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-bg/5 rounded-2xl p-6 border border-bg/10">
                  <StarRating rating={review.rating} size="md" />
                  <p className="text-bg/80 mt-4 leading-relaxed text-sm">"{review.comment}"</p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-bg/10">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-heading font-semibold">
                      {review.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-bg text-sm font-medium">{review.user_name}</p>
                      <p className="text-bg/50 text-xs">{review.user_location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/reviews" className="inline-flex items-center gap-2 text-gold font-medium hover:gap-3 transition-all">
                Read more reviews <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page py-20">
        <div className="bg-gradient-to-br from-palm to-palm-deep rounded-3xl p-8 lg:p-16 text-center text-bg relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-heading text-3xl lg:text-4xl text-bg mb-4">Start your Pollachi journey</h2>
            <p className="text-bg/70 mb-8 leading-relaxed">
              Experience the difference of truly traditional, wood-pressed coconut oil. Your hair, skin, and kitchen will thank you.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-white font-medium hover:bg-gold-deep transition-colors">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(value.replace(/\D/g, ''), 10) || 0;
    const duration = 1500;
    const steps = 50;
    const increment = target / steps;

    let current = 0;

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      setCount(Math.floor(current));
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const prefix = value.includes('~') ? '~' : '';
  const suffix = value.includes('+')
    ? '+'
    : value.includes('st')
    ? 'st'
    : '';

  return (
    
      <div className="text-center">
      <p className="font-heading text-xl lg:text-2xl text-ink font-semibold">
        {prefix}{count}{suffix}
      </p>

      <p className="text-xs text-ink-soft">
        {label}
      </p>
    </div>
  );
}

function USPCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="card p-5 lg:p-6 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-palm/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-palm" />
      </div>
      <h3 className="font-heading text-lg text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-soft leading-relaxed">{desc}</p>
    </div>
  );
}

const processSteps = [
  { title: 'Hand-picked Harvest', desc: 'Mature coconuts selected from Pollachi farms' },
  { title: 'Sun-dried Copra', desc: 'Naturally dried under the Pollachi sun' },
  { title: 'Marachekku Pressing', desc: 'Wood-pressed at low temperature' },
  { title: 'Settle & Filter', desc: 'Natural settling, minimal filtering' },
  { title: 'Hand Bottled', desc: 'Freshly bottled and sealed' },
];
