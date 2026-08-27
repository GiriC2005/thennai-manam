import { useEffect, useState } from 'react';
import { User, Mail, Phone, Shield, Package, Heart, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export default function Account() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' });
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name,
        phone: form.phone,
      }).eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      showToast('Profile updated', 'success');
      setEditing(false);
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-8">My Account</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl text-ink">Profile Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-sm text-palm font-medium hover:underline">
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-ink-soft" />
                {editing ? (
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="input-field flex-1"
                    placeholder="Full name"
                  />
                ) : (
                  <p className="text-ink">{profile?.full_name || 'Not set'}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-ink-soft" />
                <p className="text-ink">{user?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-ink-soft" />
                {editing ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-field flex-1"
                    placeholder="Phone number"
                  />
                ) : (
                  <p className="text-ink">{profile?.phone || 'Not set'}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-ink-soft" />
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  profile?.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-palm/10 text-palm'
                }`}>
                  {profile?.role ?? 'customer'}
                </span>
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); setForm({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' }); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="lg:col-span-1 space-y-3">
          <Link to="/orders" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-palm/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-palm" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-ink">My Orders</p>
              <p className="text-xs text-ink-soft">Track and view your orders</p>
            </div>
          </Link>
          <Link to="/wishlist" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-copper" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-ink">Wishlist</p>
              <p className="text-xs text-ink-soft">Your saved products</p>
            </div>
          </Link>
          <button
            onClick={signOut}
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow w-full text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-ink">Sign Out</p>
              <p className="text-xs text-ink-soft">End your session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
