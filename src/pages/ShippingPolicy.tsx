import PolicyPage from './PolicyPage';

export default function ShippingPolicy() {
  return (
    <PolicyPage title="Shipping Policy">
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Delivery Areas</h2>
      <p>We currently ship across India. All orders are processed and dispatched within 1-2 business days of confirmation.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Delivery Charges</h2>
      <p>Free delivery on orders above ₹500. A flat fee of ₹50 applies to orders below ₹500. Delivery charges, if applicable, are clearly shown at checkout.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Estimated Delivery Time</h2>
      <p>Most orders are delivered within 3-5 business days. Remote areas may take up to 7 business days. You will receive order status updates via your account dashboard.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Order Tracking</h2>
      <p>You can track your order status in the "My Orders" section of your account. Status updates include: Pending, Confirmed, Processing, Shipped, Out for Delivery, and Delivered.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Damaged in Transit</h2>
      <p>If your order arrives damaged, please contact us within 48 hours of delivery with photos. We will arrange a replacement at no extra cost.</p>
    </PolicyPage>
  );
}
