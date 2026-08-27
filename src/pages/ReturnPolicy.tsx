import PolicyPage from './PolicyPage';

export default function ReturnPolicy() {
  return (
    <PolicyPage title="Return & Refund Policy">
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Return Window</h2>
      <p>We accept returns within 7 days of delivery for unopened products in their original packaging. Please ensure the product seal is intact.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Damaged or Incorrect Items</h2>
      <p>If you receive a damaged, expired, or incorrect item, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund at no extra cost.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Non-Returnable Items</h2>
      <p>Opened products cannot be returned due to hygiene and safety reasons. Combo packs can only be returned as a complete set.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Refund Process</h2>
      <p>Once we receive and inspect the returned product, refunds are processed within 5-7 business days. Refunds are credited to the original payment method. For COD orders, we will arrange a bank transfer.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">How to Initiate a Return</h2>
      <p>Contact us at hello@pollachicoconutoil.com with your order number and reason for return. We will guide you through the return process.</p>
    </PolicyPage>
  );
}
