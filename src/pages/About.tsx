import { Link } from 'react-router-dom';
import { Leaf, Users, Award, Heart } from 'lucide-react';
import marachekku from '@/assets/marachekku.png';
export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-bg to-bg-warm py-16 lg:py-24">
        <div className="container-page text-center max-w-3xl mx-auto">
          <p className="text-gold text-sm font-medium mb-3">Our Story</p>
          <h1 className="font-heading text-4xl lg:text-5xl text-ink mb-4">From Pollachi, with tradition</h1>
          <p className="text-ink-soft text-lg leading-relaxed">
            Three generations of coconut farming, one simple promise: pure, wood-pressed oil made the marachekku way.
          </p>
        </div>
      </section>

      {/* Story sections */}
      <section className="container-page py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <img src="https://images.pexels.com/photos/13071432/pexels-photo-13071432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Pollachi farms" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-gold text-sm font-medium mb-2">Our Story</p>
            <h2 className="font-heading text-3xl text-ink mb-4">Roots in Pollachi soil</h2>
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p>Our family has been farming coconuts in Pollachi for three generations. What started as a small family grove has grown into a network of 40+ partner farms, all sharing the same commitment to natural, traditional methods.</p>
              <p>We started bottling our oil because we believed people deserved better than the chemically refined oils filling supermarket shelves. Real coconut oil — wood-pressed, aromatic, and pure — is something special.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="lg:order-2 aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <img src="https://images.pexels.com/photos/5608055/pexels-photo-5608055.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Coconut grove" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="lg:order-1">
            <p className="text-gold text-sm font-medium mb-2">Pollachi Coconut Farms</p>
            <h2 className="font-heading text-3xl text-ink mb-4">Where the coconuts grow</h2>
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p>Pollachi's unique red soil and tropical climate create the perfect conditions for coconut cultivation. Our trees are grown without synthetic pesticides, nurtured by monsoon rains and the Tamil Nadu sun.</p>
              <p>Each coconut is hand-picked at peak maturity by farmers who know exactly when the fruit is ready — a skill passed down through generations.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <img src={marachekku} alt="Wood press" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-gold text-sm font-medium mb-2">Traditional Marachekku</p>
            <h2 className="font-heading text-3xl text-ink mb-4">The wood-press difference</h2>
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p>Marachekku is the traditional Tamil method of pressing oil using a wooden ghani. The wood keeps the temperature low, preserving the natural aroma, nutrients, and flavour of the coconut.</p>
              <p>Unlike modern expeller pressing which generates high heat, the marachekku method ensures every drop retains the full goodness of the coconut.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-palm-deep text-bg py-16">
        <div className="container-page">
          <h2 className="font-heading text-3xl text-bg text-center mb-12">What we stand for</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard icon={Leaf} title="Natural" desc="No chemicals, no preservatives, no shortcuts. Just pure coconut oil." />
            <ValueCard icon={Users} title="Fair" desc="We pay our partner farmers fair prices and build long-term relationships." />
            <ValueCard icon={Award} title="Quality" desc="Every batch is tested for purity and aroma before it reaches your home." />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container-page py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="w-10 h-10 text-copper mx-auto mb-4" />
          <h2 className="font-heading text-3xl text-ink mb-4">Our Mission</h2>
          <p className="text-ink-soft leading-relaxed text-lg">
            To bring authentic, wood-pressed coconut oil from Pollachi to every Indian home — while supporting the farmers who keep these traditions alive.
          </p>
          <Link to="/shop" className="btn-primary mt-8">Shop Our Oils</Link>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-gold" />
      </div>
      <h3 className="font-heading text-xl text-bg mb-2">{title}</h3>
      <p className="text-bg/70 leading-relaxed">{desc}</p>
    </div>
  );
}
