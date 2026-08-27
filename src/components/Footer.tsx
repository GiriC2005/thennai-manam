
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Send,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import logo from '@/assets/logo1.png';

export default function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    showToast(
      'Subscribed! We will keep you updated.',
      'success'
    );

    setEmail('');
  }

  const shopLinks = [
    { label: '250ml', path: '/shop' },
    { label: '500ml', path: '/shop' },
    { label: '1 Litre', path: '/shop' },
    { label: 'Combo Pack', path: '/shop' },
  ];

  const companyLinks = [
    { label: 'About', path: '/about' },
    { label: 'Our Process', path: '/our-process' },
    { label: 'Why Pollachi', path: '/why-pollachi' },
    { label: 'Reviews', path: '/reviews' },
  ];

  const serviceLinks = [
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Shipping', path: '/shipping-policy' },
    { label: 'Returns', path: '/return-policy' },
  ];

  const legalLinks = [
    { label: 'Privacy', path: '/privacy-policy' },
    { label: 'Terms', path: '/terms' },
  ];

  return (
    <footer className="bg-palm-deep text-bg mt-20">

      {/* ==========================================
          NEWSLETTER
      =========================================== */}

      {/* <div className="container-page py-12 border-b border-bg/10">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

          <div>
            <h3 className="font-heading text-2xl text-bg mb-1">
              Stay in the loop
            </h3>

            <p className="text-bg/70 text-sm">
              Get updates on new products, farm stories,
              and special offers.
            </p>
          </div>

          <form
            onSubmit={handleNewsletter}
            className="flex gap-2 w-full max-w-md"
          >
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-bg/10 text-bg placeholder:text-bg/50 border border-bg/20 focus:outline-none focus:border-gold transition-colors"
            />

            <button
              type="submit"
              className="px-5 py-3 rounded-full bg-gold text-white font-medium hover:bg-gold-deep transition-colors shrink-0 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />

              <span className="hidden sm:inline">
                Subscribe
              </span>
            </button>
          </form>

        </div>

      </div> */}

      {/* ==========================================
          FOOTER LINKS
      =========================================== */}

      <div className="container-page py-12">

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

          {/* ======================================
              BRAND
          ======================================= */}

          <div className="col-span-2 lg:col-span-1">

            <Link
              to="/"
              className="block mb-5"
            >

              {/* LOGO */}
              <div className="flex justify-start">

                <img
                  src={logo}
                  alt="தென்னைமணம்"
                  className="w-44 sm:w-48 h-auto object-contain"
                />

              </div>

              {/* TAGLINE */}
              <p className="font-tamil text-sm sm:text-base text-bg/80 mt-2">
                மரத்தில் ஆட்டிய தூய்மை
              </p>

              {/* BRAND NAME */}
              <p className="font-heading font-semibold text-bg text-lg mt-1">
                Pollachi Coconut Oil
              </p>

            </Link>

            {/* DESCRIPTION */}

            <p className="text-bg/60 text-sm leading-relaxed mb-4">
              Traditional wood-pressed coconut oil from
              Pollachi farms. Farm-to-bottle, the
              marachekku way.
            </p>

            {/* SOCIAL ICONS */}

            <div className="flex gap-3">

              <a
                href="#"
                className="w-9 h-9 rounded-full bg-bg/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-bg" />
              </a>

              <a
                href="#"
                className="w-9 h-9 rounded-full bg-bg/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-bg" />
              </a>

              <a
                href="#"
                className="w-9 h-9 rounded-full bg-bg/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 text-bg" />
              </a>

              <a
                href="#"
                className="w-9 h-9 rounded-full bg-bg/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-bg" />
              </a>

            </div>

          </div>

          {/* SHOP */}

          <FooterColumn
            title="Shop"
            links={shopLinks}
          />

          {/* COMPANY */}

          <FooterColumn
            title="Company"
            links={companyLinks}
          />

          {/* CUSTOMER SERVICE */}

          <FooterColumn
            title="Customer Service"
            links={serviceLinks}
          />

          {/* LEGAL */}

          <FooterColumn
            title="Legal"
            links={legalLinks}
          />

        </div>

      </div>

      {/* ==========================================
          BOTTOM BAR
      =========================================== */}

      <div className="border-t border-bg/10">

        <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-bg/50 text-xs">
            © {new Date().getFullYear()}
            {' '}
            Pollachi Coconut Oil.
            All rights reserved.
          </p>

          <p className="text-bg/50 text-xs">
            Made with care in Pollachi, Tamil Nadu.
          </p>

        </div>

      </div>

    </footer>
  );
}


/* ==============================================
   FOOTER COLUMN
============================================== */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    path: string;
  }[];
}) {
  return (
    <div>

      <h4 className="font-heading text-bg font-medium text-sm mb-4">
        {title}
      </h4>

      <ul className="space-y-2">

        {links.map((link) => (

          <li key={link.label}>

            <Link
              to={link.path}
              className="text-bg/60 text-sm hover:text-gold transition-colors"
            >
              {link.label}
            </Link>

          </li>

        ))}

      </ul>

    </div>
  );
}

