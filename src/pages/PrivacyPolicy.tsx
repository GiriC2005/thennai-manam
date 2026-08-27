import PolicyPage from './PolicyPage';

export default function PrivacyPolicy() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>At Pollachi Coconut Oil, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Information We Collect</h2>
      <p>We collect information you provide when creating an account, placing orders, or contacting us. This includes your name, email, phone number, and delivery address.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">How We Use Your Information</h2>
      <p>We use your information to process orders, communicate with you about your purchases, and improve our products and services. We do not sell your personal data to third parties.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Data Security</h2>
      <p>Your data is stored securely and encrypted. We use Supabase for authentication and database management, which provides enterprise-grade security.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Your Rights</h2>
      <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us at hello@pollachicoconutoil.com.</p>
      <h2 className="font-heading text-xl text-ink mt-6 mb-2">Cookies</h2>
      <p>We use essential cookies to maintain your shopping cart and authentication session. We do not use tracking cookies for advertising.</p>
    </PolicyPage>
  );
}
