
import { useState } from 'react';
import {
  Send,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      showToast(
        'Message sent! We will get back to you soon.',
        'success'
      );

      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 1000);
  }

  return (
    <div className="container-page py-8">
      {/* =====================================
          PAGE HEADER
      ====================================== */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-4">
          Get in Touch
        </h1>

        <p className="text-ink-soft">
          Have a question about our products, your order,
          or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* ===================================
            CONTACT FORM
        ==================================== */}
        <div className="card p-6 lg:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* NAME + PHONE */}
            <div className="grid sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Name
                </label>

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Phone
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="9876543210"
                />
              </div>

            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Email
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    email: e.target.value,
                  }))
                }
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {/* SUBJECT */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Subject
              </label>

              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    subject: e.target.value,
                  }))
                }
                className="input-field"
                placeholder="How can we help?"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Message
              </label>

              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    message: e.target.value,
                  }))
                }
                className="input-field"
                placeholder="Your message..."
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send Message'}

              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ===================================
            CONTACT INFORMATION
        ==================================== */}
        <div className="space-y-4">

          {/* PHONE */}
          <ContactInfo
            icon={Phone}
            title="Phone"
            value="+91 75983 92894"
            sub="Mon to Sat, 9am - 7pm"
            href="tel:+917598392894"
          />

          {/* EMAIL */}
          <ContactInfo
            icon={Mail}
            title="Email"
            value="girichandran.offi@gmail.com"
            sub="We reply within 24 hours"
            href="mailto:girichandran.offi@gmail.com"
          />

          {/* WHATSAPP */}
          <ContactInfo
            icon={MessageCircle}
            title="WhatsApp"
            value="+91 75983 92894"
            sub="Quick chat support"
            href="https://wa.me/917598392894"
            external
          />

          {/* LOCATION */}
          <ContactInfo
            icon={MapPin}
            title="Visit Us"
            value="Anupparpalayam, Pollachi, Coimbatore District"
            sub="Tamil Nadu, India 642205"
            href="https://www.google.com/maps/search/?api=1&query=Anupparpalayam%2C%20Pollachi%2C%20Coimbatore%20District%2C%20Tamil%20Nadu%20642205"
            external
          />

          {/* BUSINESS HOURS */}
          <ContactInfo
            icon={Clock}
            title="Business Hours"
            value="Monday - Saturday: 9am - 7pm"
            sub="Sunday: Closed"
          />

          {/* =================================
              GOOGLE MAP
          ================================== */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Anupparpalayam%2C%20Pollachi%2C%20Coimbatore%20District%2C%20Tamil%20Nadu%20642205"
            target="_blank"
            rel="noopener noreferrer"
            className="block card p-1 overflow-hidden group"
            aria-label="Open Pollachi location in Google Maps"
          >
            <iframe
              title="Pollachi location"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2986.5664444977087!2d77.07004927504035!3d10.670634289471764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTDCsDQwJzE0LjMiTiA3N8KwMDQnMjEuNSJF!5e1!3m2!1sen!2sin!4v1787052317549!5m2!1sen!2sin"
              width="600"
              height="450"
              loading="lazy"
              className="w-full h-64 rounded-xl border-0 pointer-events-none transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </a>

        </div>
      </div>
    </div>
  );
}

/* ==========================================
   CONTACT INFO COMPONENT
========================================== */

function ContactInfo({
  icon: Icon,
  title,
  value,
  sub,
  href,
  external = false,
}: {
  icon: any;
  title: string;
  value: string;
  sub: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <div className="w-10 h-10 rounded-xl bg-palm/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-palm" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-ink-soft mb-1">
          {title}
        </p>

        <p className="font-medium text-ink break-words">
          {value}
        </p>

        <p className="text-xs text-ink-soft mt-1">
          {sub}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        {...(external
          ? {
              target: '_blank',
              rel: 'noopener noreferrer',
            }
          : {})}
        className="card p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="card p-5 flex items-start gap-4">
      {content}
    </div>
  );
}

