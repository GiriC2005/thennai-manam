import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // CHECK RESET SESSION
  // ==========================================

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          setError(
            'This password reset link is invalid or expired.'
          );
        }
      } catch (err) {
        console.error(
          'Reset session error:',
          err
        );

        if (mounted) {
          setError(
            'Unable to verify the password reset link.'
          );
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    }

    checkSession();

    // ========================================
    // AUTH STATE LISTENER
    // ========================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === 'PASSWORD_RECOVERY' &&
          session
        ) {
          setError('');
          setChecking(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // UPDATE PASSWORD
  // ==========================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError('');

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.'
      );
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

      showToast(
        'Password updated successfully!',
        'success'
      );

      // Sign out after successful reset
      // so user logs in with new password.
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate('/login', {
          replace: true,
        });
      }, 2000);
    } catch (err) {
      console.error(
        'Reset password error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update password. Please try again.'
      );

      showToast(
        'Failed to update password',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-palm/20 border-t-palm rounded-full animate-spin mx-auto mb-4" />

          <p className="text-ink-soft text-sm">
            Checking reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="card p-6 sm:p-8">

          {/* =================================
              SUCCESS
          ================================== */}

          {success ? (
            <div className="text-center">

              <div className="w-14 h-14 rounded-full bg-palm/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-palm" />
              </div>

              <h1 className="font-heading text-2xl text-ink mb-2">
                Password Updated!
              </h1>

              <p className="text-sm text-ink-soft">
                Your password has been changed
                successfully.
              </p>

              <p className="text-xs text-ink-soft mt-4">
                Redirecting to login...
              </p>

            </div>
          ) : (
            <>
              {/* =================================
                  HEADER
              ================================== */}

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

              {/* =================================
                  ERROR
              ================================== */}

              {error && (
                <div className="mb-5 p-4 rounded-xl bg-copper/10 text-copper text-sm">
                  {error}
                </div>
              )}

              {/* =================================
                  INVALID LINK
              ================================== */}

              {error ? (
                <Link
                  to="/login"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              ) : (
                /* =================================
                   RESET FORM
                ================================== */

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  {/* NEW PASSWORD */}

                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-ink mb-2"
                    >
                      New Password
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />

                      <input
                        id="new-password"
                        name="new-password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        placeholder="Enter new password"
                        className="input-field pl-12 pr-12"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                    </div>

                    <p className="text-xs text-ink-soft mt-2">
                      Minimum 6 characters
                    </p>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-ink mb-2"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />

                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        placeholder="Confirm new password"
                        className="input-field pl-12 pr-12"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                    </div>
                  </div>

                  {/* UPDATE */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? 'Updating...'
                      : 'Update Password'}
                  </button>

                </form>
              )}

              {/* BACK TO LOGIN */}

              {!error && (
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-palm font-medium hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}