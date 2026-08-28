import { Link } from 'react-router-dom';
import { Sprout, Handshake, MapPin, FlaskConical } from 'lucide-react';

const stats = [
  { value: '1st', label: 'Quality' },
  { value: '40+', label: 'Partner Farms' },
  { value: '~1 Day', label: 'Tree to Bottle' },
  { value: '0', label: 'Preservatives' },
];

const reasons = [
  { icon: Sprout, title: 'Pollachi soil & climate', desc: 'Pollachi\'s red soil and tropical monsoon climate produce some of India\'s finest coconuts — naturally rich in oil and aroma.' },
  { icon: Handshake, title: 'Direct farmer relationships', desc: 'We work directly with 40+ family farms, ensuring fair prices and supporting the families who keep traditional methods alive.' },
  { icon: MapPin, title: 'Full traceability', desc: 'Every bottle can be traced back to the farm cluster it came from. We believe in transparency from tree to bottle.' },
  { icon: FlaskConical, title: 'Tested for purity', desc: 'Every batch is lab-tested for purity and aroma. No adulteration, no added chemicals — just 100% coconut oil.' },
];

export default function WhyPollachi() {
  return (
    <div>
      <section className="bg-gradient-to-br from-bg to-bg-warm py-16 lg:py-24">
        <div className="container-page text-center max-w-3xl mx-auto">
          <p className="text-gold text-sm font-medium mb-3">Why Pollachi</p>
          <h1 className="font-heading text-4xl lg:text-5xl text-ink mb-4">A tradition rooted in the soil</h1>
          <p className="text-ink-soft text-lg leading-relaxed">
            Pollachi isn't just where we make our oil — it's who we are. Here's why this place matters.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container-page py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="card p-8 text-center">
              <p className="font-heading text-4xl lg:text-5xl text-palm font-bold mb-2">{stat.value}</p>
              <p className="text-sm text-ink-soft">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reasons */}
      <section className="container-page py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {reasons.map((reason, i) => (
            <div key={i} className="card p-6 lg:p-8 flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-palm/10 flex items-center justify-center shrink-0">
                <reason.icon className="w-7 h-7 text-palm" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-ink mb-2">{reason.title}</h3>
                <p className="text-ink-soft leading-relaxed">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Image section */}
      <section className="container-page py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <img src="https://images.pexels.com/photos/5608055/pexels-photo-5608055.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Pollachi coconut grove" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-heading text-3xl text-ink mb-4">Freshness you can taste</h2>
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p>Most commercial coconut oil sits in warehouses for months before reaching you. Our oil goes from tree to bottle in about a day, then ships straight to your door.</p>
              <p>You can taste the difference — the natural aroma, the clean flavour, the way it makes your food and your hair feel. That's the Pollachi promise.</p>
            </div>
            <Link to="/shop" className="btn-primary mt-8">Experience Pollachi</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
