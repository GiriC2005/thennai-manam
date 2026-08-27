import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Register() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate(): string | null {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.phone.trim()) return 'Phone is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone);
    setLoading(false);
    if (error) {
      setError(error);
      showToast('Registration failed', 'error');
    } else {
      showToast('Account created! Welcome to Pollachi.', 'success');
      navigate('/');
    }
  }

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-palm flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-heading text-2xl font-semibold">P</span>
          </div>
          <h1 className="font-heading text-3xl text-ink mb-2">Create Account</h1>
          <p className="text-ink-soft">Join the Pollachi family</p>
        </div>

        <div className="card p-6 lg:p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-copper/10 text-copper text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                  placeholder="Your full name"
                  className="input-field pl-12"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="you@example.com"
                  className="input-field pl-12"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  placeholder="9876543210"
                  className="input-field pl-12"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="At least 6 characters"
                  className="input-field pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  placeholder="Re-enter password"
                  className="input-field pl-12"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-palm font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
