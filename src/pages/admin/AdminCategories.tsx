import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';
import type { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import Loader from '@/components/Loader';

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' });

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', image_url: '' });
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', image_url: c.image_url ?? '' });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      image_url: form.image_url,
    };
    try {
      if (editing) {
        await updateCategory(editing.id, data);
        showToast('Category updated', 'success');
      } else {
        await createCategory(data);
        showToast('Category created', 'success');
      }
      setShowForm(false);
      getCategories().then(setCategories);
    } catch {
      showToast('Failed to save category', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      showToast('Category deleted', 'info');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      showToast('Failed to delete category', 'error');
    }
  }

  if (loading) return <Loader label="Loading categories..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl lg:text-3xl text-ink">Categories</h1>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="card overflow-hidden">
            <div className="aspect-video bg-bg-warm">
              {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
              <h3 className="font-heading text-base text-ink mb-1">{c.name}</h3>
              <p className="text-xs text-ink-soft line-clamp-2 mb-3">{c.description}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-ink/5 text-ink-soft">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-copper/10 text-ink-soft hover:text-copper">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-bg rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl text-ink">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-ink/5">
                <X className="w-5 h-5 text-ink" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Slug (optional)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="input-field" placeholder="auto-generated" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Image URL</label>
                <input type="text" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="input-field" placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
