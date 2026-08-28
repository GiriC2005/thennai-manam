import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkSession() {
      const { data } =
        await supabase.auth.getSession();

      if (!data.session) {
        setError(
          'This password reset link is invalid or expired.'
        );
      }

      setChecking(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(e: { preventDefault: () => void; }) {
    e.preventDefault();

    setError('');

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error(
        'Reset password error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          :
          'Failed to update password.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-ink-soft">
          Checking reset link...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        <div className="card p-6 sm:p-8">

          {success ? (

            <div className="text-center">

              <CheckCircle className="w-14 h-14 text-palm mx-auto mb-4" />

              <h1 className="font-heading text-2xl text-ink mb-2">
                Password Updated!
              </h1>

              <p className="text-sm text-ink-soft">
                Your password has been changed successfully.
              </p>

              <p className="text-xs text-ink-soft mt-4">
                Redirecting to login...
              </p>

            </div>

          ) : (

            <>
              <div className="text-center mb-6">

                <div className="w-14 h-14 rounded-full bg-palm/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-palm" />
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl text-ink mb-2">
                  Reset Password
                </h1>

                <p className="text-sm text-ink-soft">
                  Enter your new password below.
                </p>

              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-copper/10 text-copper text-sm">
                  {error}
                </div>
              )}

              {!error && (
                <form onSubmit={handleSubmit}>

                  <label className="block text-sm font-medium text-ink mb-2">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    className="input-field mb-4"
                    autoComplete="new-password"
                  />

                  <label className="block text-sm font-medium text-ink mb-2">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="input-field mb-5"
                    autoComplete="new-password"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {loading
                      ? 'Updating...'
                      : 'Update Password'}
                  </button>

                </form>
              )}

            </>

          )}

        </div>

      </div>

    </div>
  );
}