import { useEffect, useState } from 'react';
import {
  Send,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

  /* ==============================
     AOS
  ============================== */
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 70,
      disable: false,
    });

    AOS.refresh();
  }, []);

  /* ==============================
     FORM SUBMIT
  ============================== */
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    // Basic validation
    if (!form.name.trim()) {
      showToast('Please enter your name.', 'error');
      return;
    }

    if (!form.email.trim()) {
      showToast('Please enter your email.', 'error');
      return;
    }

    if (!form.subject.trim()) {
      showToast('Please enter a subject.', 'error');
      return;
    }

    if (!form.message.trim()) {
      showToast('Please enter your message.', 'error');
      return;
    }

    setLoading(true);

    try {
      const templateParams = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      };

      const serviceId =
        import.meta.env.VITE_EMAILJS_SERVICE_ID;

      const templateId =
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      const publicKey =
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Check EmailJS configuration
      if (!serviceId || !templateId || !publicKey) {
        console.error('EmailJS configuration missing:', {
          serviceId: !!serviceId,
          templateId: !!templateId,
          publicKey: !!publicKey,
        });

        showToast(
          'Email service is not configured. Please try again later.',
          'error'
        );

        return;
      }

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log('EmailJS Success:', response);

      showToast(
        'Message sent successfully! We will get back to you soon.',
        'success'
      );

      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      console.error('EmailJS Error:', {
        status: error?.status,
        text: error?.text,
        message: error?.message,
      });

      showToast(
        'Failed to send message. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-8 overflow-x-hidden">

      {/* =====================================
          PAGE HEADER
      ====================================== */}
      <div
        className="text-center max-w-2xl mx-auto mb-12"
        data-aos="fade-up"
      >
        <p
          className="text-gold text-sm font-medium mb-2"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Contact Us
        </p>

        <h1
          className="font-heading text-3xl lg:text-4xl text-ink mb-4"
          data-aos="fade-up"
          data-aos-delay="180"
        >
          Get in Touch
        </h1>

        <p
          className="text-ink-soft"
          data-aos="fade-up"
          data-aos-delay="260"
        >
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
        <div
          className="card p-6 lg:p-8"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* NAME + PHONE */}
            <div
              className="grid sm:grid-cols-2 gap-4"
              data-aos="fade-up"
              data-aos-delay="150"
            >

              {/* NAME */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-ink mb-2"
                >
                  Name
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
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


              {/* PHONE */}
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-sm font-medium text-ink mb-2"
                >
                  Phone
                </label>

                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
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
            <div
              data-aos="fade-up"
              data-aos-delay="220"
            >
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-ink mb-2"
              >
                Email
              </label>

              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
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
            <div
              data-aos="fade-up"
              data-aos-delay="290"
            >
              <label
                htmlFor="contact-subject"
                className="block text-sm font-medium text-ink mb-2"
              >
                Subject
              </label>

              <input
                id="contact-subject"
                name="subject"
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
            <div
              data-aos="fade-up"
              data-aos-delay="360"
            >
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-ink mb-2"
              >
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
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
            <div
              data-aos="fade-up"
              data-aos-delay="430"
            >
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Message'}

                <Send className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>


        {/* ===================================
            CONTACT INFORMATION
        ==================================== */}
        <div className="space-y-4">

          {/* PHONE */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <ContactInfo
              icon={Phone}
              title="Phone"
              value="+91 75983 92894"
              sub="Mon to Sat, 9am - 7pm"
              href="tel:+917598392894"
            />
          </div>


          {/* EMAIL */}
          <div
            data-aos="fade-up"
            data-aos-delay="180"
          >
            <ContactInfo
              icon={Mail}
              title="Email"
              value="girichandran.offi@gmail.com"
              sub="We reply within 24 hours"
              href="mailto:girichandran.offi@gmail.com"
            />
          </div>


          {/* WHATSAPP */}
          <div
            data-aos="fade-up"
            data-aos-delay="260"
          >
            <ContactInfo
              icon={MessageCircle}
              title="WhatsApp"
              value="+91 75983 92894"
              sub="Quick chat support"
              href="https://wa.me/917598392894"
              external
            />
          </div>


          {/* LOCATION */}
          <div
            data-aos="fade-up"
            data-aos-delay="340"
          >
            <ContactInfo
              icon={MapPin}
              title="Visit Us"
              value="Anupparpalayam, Pollachi, Coimbatore District"
              sub="Tamil Nadu, India 642205"
              href="https://www.google.com/maps/search/?api=1&query=Anupparpalayam%2C%20Pollachi%2C%20Coimbatore%20District%2C%20Tamil%20Nadu%20642205"
              external
            />
          </div>


          {/* BUSINESS HOURS */}
          <div
            data-aos="fade-up"
            data-aos-delay="420"
          >
            <ContactInfo
              icon={Clock}
              title="Business Hours"
              value="Monday - Saturday: 9am - 7pm"
              sub="Sunday: Closed"
            />
          </div>


          {/* GOOGLE MAP */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Anupparpalayam%2C%20Pollachi%2C%20Coimbatore%20District%2C%20Tamil%20Nadu%20642205"
            target="_blank"
            rel="noopener noreferrer"
            className="block card p-1 overflow-hidden group"
            aria-label="Open Pollachi location in Google Maps"
            data-aos="zoom-in"
            data-aos-delay="500"
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