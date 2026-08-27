import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What is marachekku (wood-pressed) coconut oil?', a: 'Marachekku is the traditional Tamil method of pressing oil using a wooden ghani. The wood keeps the pressing temperature low, preserving the natural aroma, nutrients, and flavour of the coconut. Unlike modern expeller pressing which generates high heat, the marachekku method ensures every drop retains the full goodness of the coconut.' },
  { q: 'Is your coconut oil organic?', a: 'Our coconuts are grown without synthetic pesticides on our partner farms in Pollachi. While we follow natural farming practices, we focus on the traditional, chemical-free process rather than formal organic certification.' },
  { q: 'Why does the oil solidify in cold weather?', a: 'Coconut oil naturally solidifies below 24°C. This is completely normal and a sign of purity — it contains no additives to keep it liquid. Simply place the bottle in warm water to liquefy it.' },
  { q: 'What is the shelf life of your coconut oil?', a: 'Our wood-pressed coconut oil has a shelf life of 12 months from the date of manufacture. Store it in a cool, dry place away from direct sunlight for best results.' },
  { q: 'How long does delivery take?', a: 'Orders are typically delivered within 3-5 business days. We offer free delivery on orders above ₹500. A flat ₹50 delivery charge applies to orders below ₹500.' },
  { q: 'Can I use this oil for cooking and skin care?', a: 'Yes! Our virgin coconut oil is versatile — use it for cooking, hair massage, skin moisturizing, and baby care. Our hair care and skin care variants are specifically formulated with herbal infusions for their respective uses.' },
  { q: 'Do you offer Cash on Delivery?', a: 'Yes, we offer Cash on Delivery (COD) across India. Online payment options will be available soon.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for unopened products. If you receive a damaged or incorrect item, please contact us within 48 hours with photos for a replacement or refund.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you can track its status in the "My Orders" section of your account. You will also receive updates as your order status changes.' },
  { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We are working on expanding to international shipping in the future.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="container-page py-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-4">Frequently Asked Questions</h1>
        <p className="text-ink-soft">Everything you need to know about our coconut oil</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-ink">{faq.q}</span>
              <ChevronDown className={`w-5 h-5 text-ink-soft shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-ink-soft leading-relaxed animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
