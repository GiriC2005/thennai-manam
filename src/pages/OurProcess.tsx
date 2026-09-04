import { Link } from 'react-router-dom';
import {
  Leaf,
  Sun,
  TreePine,
  Filter,
  Droplets,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const steps = [
  {
    icon: Leaf,
    num: '01',
    title: 'Hand-picked Harvest',
    desc: 'Mature coconuts are hand-picked from our partner farms in Pollachi. Only the best, fully mature coconuts make the cut — selected by farmers who know exactly when the fruit is ready.',
  },
  {
    icon: Sun,
    num: '02',
    title: 'Sun-dried Copra',
    desc: 'The coconut kernels are separated and naturally sun-dried under the Pollachi sun for several days. This traditional drying process reduces moisture without using artificial heat.',
  },
  {
    icon: TreePine,
    num: '03',
    title: 'Marachekku Pressing',
    desc: 'The dried copra is pressed in a wooden marachekku (ghani). The wood keeps the pressing temperature low, preserving the natural aroma, nutrients, and flavour of the oil.',
  },
  {
    icon: Filter,
    num: '04',
    title: 'Settle & Filter',
    desc: 'The pressed oil is allowed to naturally settle, then minimally filtered to remove any sediment. No chemical refining, no deodorising — just pure, natural oil.',
  },
  {
    icon: Droplets,
    num: '05',
    title: 'Hand Bottled',
    desc: 'The finished oil is hand-bottled and sealed fresh. From tree to bottle in about a day, ensuring you receive the freshest, most aromatic coconut oil possible.',
  },
];

export default function OurProcess() {
  return (
    <div>
      {/* =========================================
          HERO
      ========================================== */}
      <section className="bg-gradient-to-br from-bg to-bg-warm py-16 lg:py-24">
        <ScrollReveal>
        <div className="container-page text-center max-w-3xl mx-auto">
          <p className="text-gold text-sm font-medium mb-3">
            The marachekku method
          </p>

          <h1 className="font-heading text-4xl lg:text-5xl text-ink mb-4">
            Our Process
          </h1>

          <p className="text-ink-soft text-lg leading-relaxed">
            Five careful steps, each rooted in tradition. No shortcuts,
            no chemicals — just the way it's been done in Pollachi for
            generations.
          </p>
        </div>
        </ScrollReveal>
      </section>

      {/* =========================================
          PROCESS STEPS
      ========================================== */}
      <section className="container-page py-16">
        <div className="max-w-4xl mx-auto">

          {/* 
            IMPORTANT:
            This wrapper is relative.
            The vertical line is positioned relative to this wrapper.
          */}
          <div className="relative">

            {/* =====================================
                VERTICAL TIMELINE LINE
            ====================================== */}
           

            {/* =====================================
                STEPS
            ====================================== */}
            {steps.map((step, i) => {
  const Icon = step.icon;

  return (
    <ScrollReveal
      key={step.num}
      direction="up"
      delay={i * 180}
      duration={900}
      distance={50}
    >
      <div
        className="
          relative
          flex
          gap-6
          lg:gap-8
          mb-12
          last:mb-0
        "
      >
        {/* NUMBER CIRCLE */}
        <div className="relative shrink-0 z-10">
          <div
            className="
              w-14
              h-14
              lg:w-[72px]
              lg:h-[72px]
              rounded-full
              bg-palm
              text-white
              flex
              items-center
              justify-center
              font-heading
              font-bold
              text-lg
              shadow-sm
            "
          >
            {step.num}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 pt-2 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <Icon className="w-6 h-6 text-palm shrink-0" />

            <h2 className="font-heading text-2xl text-ink">
              {step.title}
            </h2>
          </div>

          <p className="text-ink-soft leading-relaxed">
            {step.desc}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
})}          </div>
        </div>
      </section>

      {/* =========================================
          CTA
      ========================================== */}
      <section className="bg-palm-deep text-bg py-16">
        <ScrollReveal>
        <div className="container-page text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl text-bg mb-4">
            Taste the difference
          </h2>

          <p className="text-bg/70 mb-8 leading-relaxed">
            Every bottle of Pollachi Coconut Oil carries the result of
            this careful, traditional process.
          </p>

          <Link
            to="/shop"
            className="
              inline-flex
              items-center
              gap-2
              px-8
              py-4
              rounded-full
              bg-gold
              text-white
              font-medium
              hover:bg-gold-deep
              transition-colors
            "
          >
            Shop Our Oils
          </Link>
        </div>
        </ScrollReveal>
      </section>
    </div>
  );
}