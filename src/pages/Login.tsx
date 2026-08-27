import { useState } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Login() {
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const from =
    (location.state as {
      from?: string;
    })?.from || '/';

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result = await signIn(
        email.trim(),
        password
      );

      if (result.error) {
        setError(result.error);

        showToast(
          'Login failed',
          'error'
        );

        return;
      }

      showToast(
        result.isAdmin
          ? 'Welcome Admin!'
          : 'Welcome back!',
        'success'
      );

      // IMPORTANT
      // Use result.isAdmin directly
      if (result.isAdmin) {
        navigate('/admin', {
          replace: true,
        });
      } else {
        navigate(from, {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      setError(
        'Something went wrong. Please try again.'
      );

      showToast(
        'Login failed',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="max-w-md mx-auto">

        <div className="text-center mb-8">

          <div className="w-14 h-14 rounded-full bg-palm flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-heading text-2xl font-semibold">
              P
            </span>
          </div>

          <h1 className="font-heading text-3xl text-ink mb-2">
            Welcome Back
          </h1>

          <p className="text-ink-soft">
            Sign in to your Pollachi account
          </p>

        </div>

        <div className="card p-6 lg:p-8">

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-copper/10 text-copper text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Email
              </label>

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field pl-12"
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-sm font-medium text-ink mb-2">
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />

                <input
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
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>
            </div>

            {/* LOGIN */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            New to Pollachi?{' '}

            <Link
              to="/register"
              className="text-palm font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}