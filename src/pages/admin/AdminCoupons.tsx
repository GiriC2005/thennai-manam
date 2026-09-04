import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  TicketPercent,
  X,
} from 'lucide-react';

import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
} from '@/services/api';

type CouponForm = {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  minimum_order_amount: string;
  maximum_discount: string;
  expires_at: string;
  usage_limit: string;
  active: boolean;
};

const emptyForm: CouponForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  minimum_order_amount: '0',
  maximum_discount: '',
  expires_at: '',
  usage_limit: '',
  active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<CouponForm>(emptyForm);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCoupons(data);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon.id);

    setForm({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: String(coupon.discount_value ?? ''),
      minimum_order_amount: String(
        coupon.minimum_order_amount ?? 0
      ),
      maximum_discount:
        coupon.maximum_discount !== null &&
        coupon.maximum_discount !== undefined
          ? String(coupon.maximum_discount)
          : '',
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at)
            .toISOString()
            .slice(0, 16)
        : '',
      usage_limit:
        coupon.usage_limit !== null &&
        coupon.usage_limit !== undefined
          ? String(coupon.usage_limit)
          : '',
      active: coupon.active ?? true,
    });

    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      alert('Coupon code required');
      return;
    }

    if (!form.discount_value) {
      alert('Discount value required');
      return;
    }

    const discountValue = Number(form.discount_value);

    if (discountValue <= 0) {
      alert('Discount value must be greater than 0');
      return;
    }

    if (
      form.discount_type === 'percentage' &&
      discountValue > 100
    ) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    try {
      setSaving(true);

      const payload: any = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: discountValue,
        minimum_order_amount:
          Number(form.minimum_order_amount) || 0,
        maximum_discount:
          form.maximum_discount
            ? Number(form.maximum_discount)
            : null,
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
        usage_limit:
          form.usage_limit
            ? Number(form.usage_limit)
            : null,
        active: form.active,
      };

      if (editingId) {
        await updateCoupon(editingId, payload);
        alert('Coupon updated successfully');
      } else {
        await createCoupon(payload);
        alert('Coupon created successfully');
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadCoupons();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.message ||
          'Failed to save coupon'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Delete this coupon?'
    );

    if (!confirmed) return;

    try {
      await deleteCoupon(id);
      await loadCoupons();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.message ||
          'Failed to delete coupon'
      );
    }
  };

  const handleToggle = async (
    id: string,
    active: boolean
  ) => {
    try {
      await toggleCoupon(id, !active);
      await loadCoupons();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.message ||
          'Failed to update coupon'
      );
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No expiry';

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="container-page py-8 lg:py-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-palm/10 flex items-center justify-center">
                <TicketPercent className="w-5 h-5 text-palm" />
              </div>

              <div>
                <h1 className="font-heading text-3xl text-ink">
                  Coupons
                </h1>

                <p className="text-sm text-ink-soft">
                  Create and manage discount coupons
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              px-5
              py-3
              rounded-xl
              bg-palm
              text-white
              font-medium
              hover:bg-palm-deep
              transition
            "
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-ink-soft">
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <TicketPercent className="w-12 h-12 mx-auto text-ink/20 mb-4" />

              <h3 className="font-heading text-xl text-ink mb-2">
                No coupons yet
              </h3>

              <p className="text-ink-soft mb-5">
                Create your first discount coupon.
              </p>

              <button
                onClick={openCreate}
                className="px-5 py-3 rounded-xl bg-palm text-white"
              >
                Create Coupon
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-ink/10 bg-bg-warm/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-ink">
                      Coupon
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-medium text-ink">
                      Discount
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-medium text-ink">
                      Minimum Order
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-medium text-ink">
                      Expiry
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-medium text-ink">
                      Usage
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-medium text-ink">
                      Status
                    </th>

                    <th className="text-right px-6 py-4 text-sm font-medium text-ink">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-ink/5 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <span className="font-semibold text-ink tracking-wide">
                          {coupon.code}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-medium text-palm">
                          {coupon.discount_type ===
                          'percentage'
                            ? `${coupon.discount_value}%`
                            : `₹${Number(
                                coupon.discount_value
                              ).toLocaleString(
                                'en-IN'
                              )}`}
                        </span>

                        {coupon.maximum_discount && (
                          <p className="text-xs text-ink-soft mt-1">
                            Max ₹
                            {Number(
                              coupon.maximum_discount
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5 text-ink-soft">
                        ₹
                        {Number(
                          coupon.minimum_order_amount || 0
                        ).toLocaleString('en-IN')}
                      </td>

                      <td className="px-6 py-5 text-ink-soft">
                        {formatDate(
                          coupon.expires_at
                        )}
                      </td>

                      <td className="px-6 py-5 text-ink-soft">
                        {coupon.used_count || 0}
                        {' / '}
                        {coupon.usage_limit || '∞'}
                      </td>

                      <td className="px-6 py-5">
                        <button
                          onClick={() =>
                            handleToggle(
                              coupon.id,
                              coupon.active
                            )
                          }
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-medium
                            ${
                              coupon.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }
                          `}
                        >
                          <span
                            className={`
                              w-1.5
                              h-1.5
                              rounded-full
                              ${
                                coupon.active
                                  ? 'bg-green-600'
                                  : 'bg-gray-400'
                              }
                            `}
                          />

                          {coupon.active
                            ? 'Active'
                            : 'Inactive'}
                        </button>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEdit(coupon)
                            }
                            className="p-2 rounded-lg hover:bg-bg-warm text-ink"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleToggle(
                                coupon.id,
                                coupon.active
                              )
                            }
                            className="p-2 rounded-lg hover:bg-bg-warm text-ink"
                            title={
                              coupon.active
                                ? 'Disable'
                                : 'Enable'
                            }
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                coupon.id
                              )
                            }
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CREATE / EDIT MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
                <div>
                  <h2 className="font-heading text-2xl text-ink">
                    {editingId
                      ? 'Edit Coupon'
                      : 'Create Coupon'}
                  </h2>

                  <p className="text-sm text-ink-soft mt-1">
                    Configure your discount offer
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="p-2 rounded-lg hover:bg-bg-warm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FORM */}
              <div className="p-6 space-y-5">

                {/* CODE */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Coupon Code
                  </label>

                  <input
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value
                          .toUpperCase()
                          .replace(
                            /\s/g,
                            ''
                          ),
                      })
                    }
                    placeholder="WELCOME10"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-ink/10
                      bg-bg
                      outline-none
                      focus:border-palm
                    "
                  />
                </div>

                {/* TYPE + VALUE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Discount Type
                    </label>

                    <select
                      value={
                        form.discount_type
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discount_type:
                            e.target.value as
                              | 'percentage'
                              | 'fixed',
                        })
                      }
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-ink/10
                        bg-bg
                        outline-none
                        focus:border-palm
                      "
                    >
                      <option value="percentage">
                        Percentage
                      </option>

                      <option value="fixed">
                        Fixed Amount
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Discount Value
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        form.discount_value
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discount_value:
                            e.target.value,
                        })
                      }
                      placeholder={
                        form.discount_type ===
                        'percentage'
                          ? '10'
                          : '100'
                      }
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-ink/10
                        bg-bg
                        outline-none
                        focus:border-palm
                      "
                    />
                  </div>
                </div>

                {/* MIN + MAX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Minimum Order Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.minimum_order_amount
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minimum_order_amount:
                            e.target.value,
                        })
                      }
                      placeholder="500"
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-ink/10
                        bg-bg
                        outline-none
                        focus:border-palm
                      "
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Maximum Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.maximum_discount
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          maximum_discount:
                            e.target.value,
                        })
                      }
                      placeholder="100"
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-ink/10
                        bg-bg
                        outline-none
                        focus:border-palm
                      "
                    />
                  </div>
                </div>

                {/* EXPIRY + USAGE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Expiry Date
                    </label>

                    <input
                      type="datetime-local"
                      value={
                        form.expires_at
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          expires_at:
                            e.target.value,
                        })
                      }
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-ink/10
                        bg-bg
                        outline-none
                        focus:border-palm
                      "
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Usage Limit
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        form.usage_limit
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          usage_limit:
                            e.target.value,
                        })
                      }
                      placeholder="100"
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-ink/10
                        bg-bg
                        outline-none
                        focus:border-palm
                      "
                    />
                  </div>
                </div>

                {/* ACTIVE */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        active:
                          e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-green-700"
                  />

                  <span className="text-sm text-ink">
                    Coupon is active
                  </span>
                </label>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 px-6 py-5 border-t border-ink/10">

                <button
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-ink/10
                    text-ink
                    hover:bg-bg-warm
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    px-6
                    py-3
                    rounded-xl
                    bg-palm
                    text-white
                    font-medium
                    hover:bg-palm-deep
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Update Coupon'
                    : 'Create Coupon'}
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}