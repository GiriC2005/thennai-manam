import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.error) {
        setError(result.error);

        showToast(
          'Unable to send reset email',
          'error'
        );

        return;
      }

      setSent(true);

      showToast(
        'Password reset email sent!',
        'success'
      );
    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      setError(
        'Something went wrong. Please try again.'
      );

      showToast(
        'Unable to send reset email',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="max-w-md mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="w-14 h-14 rounded-full bg-palm flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>

          <h1 className="font-heading text-3xl text-ink mb-2">
            Forgot Password?
          </h1>

          <p className="text-ink-soft">
            Enter your email address and we'll send you
            a password reset link.
          </p>

        </div>

        {/* CARD */}
        <div className="card p-6 lg:p-8">

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-copper/10 text-copper text-sm">
              {error}
            </div>
          )}

          {sent ? (
            /* ============================
               EMAIL SENT
            ============================ */
            <div className="text-center">

              <div className="w-14 h-14 rounded-full bg-palm/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-palm" />
              </div>

              <h2 className="font-heading text-xl text-ink mb-2">
                Check Your Email
              </h2>

              <p className="text-sm text-ink-soft mb-6">
                We've sent a password reset link to:
              </p>

              <p className="font-medium text-ink mb-6 break-all">
                {email}
              </p>

              <p className="text-xs text-ink-soft mb-6">
                Didn't receive the email? Check your
                spam folder or try again.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError('');
                }}
                className="text-sm text-palm font-medium hover:underline"
              >
                Try another email
              </button>

            </div>
          ) : (
            /* ============================
               EMAIL FORM
            ============================ */
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-ink mb-2"
                >
                  Email
                </label>

                <div className="relative">

                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />

                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="input-field pl-12"
                  />

                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    Send Reset Link
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* BACK TO LOGIN */}
          <div className="mt-6 text-center">

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-palm font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}