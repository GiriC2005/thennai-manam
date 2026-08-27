import { useEffect, useState } from 'react';
import { getAllProfiles } from '@/services/api';
import { formatDate } from '@/lib/utils';
import Loader from '@/components/Loader';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProfiles().then(setCustomers).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading customers..." />;

  return (
    <div>
      <h1 className="font-heading text-2xl lg:text-3xl text-ink mb-6">Customers</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-ink-soft">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-ink-soft">No customers yet.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-ink/5 last:border-0">
                    <td className="p-4 font-medium text-ink">{c.full_name || '—'}</td>
                    <td className="p-4 text-ink-soft">{c.email}</td>
                    <td className="p-4 text-ink-soft">{c.phone || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${c.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-palm/10 text-palm'}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="p-4 text-ink-soft">{formatDate(c.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
