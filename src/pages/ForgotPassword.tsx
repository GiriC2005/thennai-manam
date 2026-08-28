import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: { preventDefault: () => void; }) {
    e.preventDefault();

    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);

      setError(
        err?.message ||
          'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="card p-6 sm:p-8">

          <div className="text-center mb-6">

            <div className="w-14 h-14 rounded-full bg-palm/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-palm" />
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl text-ink mb-2">
              Forgot Password?
            </h1>

            <p className="text-sm text-ink-soft">
              Enter your registered email and we'll
              send you a password reset link.
            </p>

          </div>

          {success ? (

            <div className="text-center">

              <CheckCircle className="w-12 h-12 text-palm mx-auto mb-4" />

              <h2 className="font-heading text-xl text-ink mb-2">
                Check your email
              </h2>

              <p className="text-sm text-ink-soft mb-6">
                We've sent a password reset link to:
              </p>

              <p className="font-medium text-ink mb-6 break-all">
                {email}
              </p>

              <p className="text-xs text-ink-soft mb-6">
                If you don't see the email, check your
                spam or junk folder.
              </p>

              <Link
                to="/login"
                className="btn-primary inline-flex"
              >
                Back to Login
              </Link>

            </div>

          ) : (

            <form onSubmit={handleSubmit}>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="input-field mb-3"
                autoComplete="email"
              />

              {error && (
                <p className="text-sm text-copper mb-4">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading
                  ? 'Sending...'
                  : 'Send Reset Link'}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-ink-soft hover:text-palm mt-5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>

            </form>

          )}

        </div>

      </div>
    </div>
  );
}