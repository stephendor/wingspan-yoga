'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronRight } from 'lucide-react';

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  children: MediaCategory[];
  _count?: { media: number };
}

interface CategoriesResponse {
  success: boolean;
  categories?: MediaCategory[];
  error?: string;
}

export default function MediaCategoriesPage() {
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New category form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [newSortOrder, setNewSortOrder] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  const flatOptions = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const walk = (nodes: MediaCategory[], depth = 0) => {
      for (const n of nodes) {
        list.push({ id: n.id, name: `${'\u00A0'.repeat(depth * 2)}${n.name}` });
        if (n.children?.length) walk(n.children, depth + 1);
      }
    };
    walk(categories);
    return list;
  }, [categories]);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/media/categories');
      const data: CategoriesResponse = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      } else {
        setError(data.error || 'Failed to load categories');
      }
    } catch (e) {
  setError('Failed to load categories');
  console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const onCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/media/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription || undefined,
          parentId: newParentId || undefined,
          sortOrder: newSortOrder,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to create category');
      } else {
        setNewName('');
        setNewDescription('');
        setNewParentId('');
        setNewSortOrder(0);
        await loadCategories();
      }
    } catch (e) {
  console.error(e);
      alert('Failed to create category');
    } finally {
      setBusy(false);
    }
  }, [newName, newDescription, newParentId, newSortOrder, loadCategories]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Categories</h1>
      </div>

      {/* Create new category */}
      <div className="bg-white p-4 rounded-lg border space-y-3">
        <h2 className="font-semibold">Create Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              value={newName}
              onChange={(e) => { setNewName(e.target.value); }}
              className="w-full px-3 py-2 border rounded"
              placeholder="Category name"
              aria-label="Category name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <input
              value={newDescription}
              onChange={(e) => { setNewDescription(e.target.value); }}
              className="w-full px-3 py-2 border rounded"
              placeholder="Optional description"
              aria-label="Category description"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Parent</label>
            <select
              value={newParentId}
              onChange={(e) => { setNewParentId(e.target.value); }}
              className="w-full px-3 py-2 border rounded"
              aria-label="Parent category"
            >
              <option value="">None</option>
              {flatOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort Order</label>
            <input
              type="number"
              value={newSortOrder}
              onChange={(e) => { setNewSortOrder(Number(e.target.value) || 0); }}
              className="w-full px-3 py-2 border rounded"
              aria-label="Sort order"
            />
          </div>
          <div className="md:col-span-5">
            <button
              onClick={() => { void onCreate(); }}
              disabled={busy}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create
            </button>
          </div>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="font-semibold mb-3">Category Tree</h2>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading…</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : (
          <Tree categories={categories} onChanged={loadCategories} />
        )}
      </div>
    </div>
  );
}

function Tree({ categories, onChanged }: { categories: MediaCategory[]; onChanged: () => Promise<void> | void }) {
  return (
    <ul className="space-y-2">
      {categories.map((c) => (
        <li key={c.id}>
          <TreeNode category={c} onChanged={onChanged} />
        </li>
      ))}
    </ul>
  );
}

function TreeNode({ category, onChanged }: { category: MediaCategory; onChanged: () => Promise<void> | void }) {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || '');
  const [sortOrder, setSortOrder] = useState<number>(category.sortOrder);
  const [isActive, setIsActive] = useState<boolean>(category.isActive);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/media/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: category.id, name, description, sortOrder, isActive }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to save category');
      } else {
        await onChanged();
      }
    } catch (e) {
  console.error(e);
      alert('Failed to save category');
    } finally {
      setSaving(false);
    }
  }, [category.id, name, description, sortOrder, isActive, onChanged]);

  const onDelete = useCallback(async () => {
    if (!confirm('Delete this category? It must have no subcategories or media.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media/categories?id=${encodeURIComponent(category.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to delete category');
      } else {
        await onChanged();
      }
    } catch (e) {
  console.error(e);
      alert('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  }, [category.id, onChanged]);

  return (
    <div className="border rounded">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <button onClick={() => { setOpen((v) => !v); }} aria-label={open ? 'Collapse' : 'Expand'} className="p-1">
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div>
            <div className="font-medium">{category.name} {!category.isActive && <span className="text-xs text-gray-500">(inactive)</span>}</div>
            <div className="text-xs text-gray-500">Slug: {category.slug} • Media: {category._count?.media ?? 0}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { void onSave(); }} disabled={saving} className="px-2 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1">
            <Save className="w-3 h-3" /> Save
          </button>
          <button onClick={() => { void onDelete(); }} disabled={deleting} className="px-2 py-1 bg-red-600 text-white rounded text-sm flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
      <div className="px-3 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input aria-label="Category name" placeholder="Category name" value={name} onChange={(e) => { setName(e.target.value); }} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Description</label>
            <input aria-label="Category description" placeholder="Optional description" value={description} onChange={(e) => { setDescription(e.target.value); }} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sort</label>
            <input aria-label="Sort order" placeholder="0" type="number" value={sortOrder} onChange={(e) => { setSortOrder(Number(e.target.value) || 0); }} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Active</label>
            <select value={isActive ? 'yes' : 'no'} onChange={(e) => { setIsActive(e.target.value === 'yes'); }} className="w-full px-3 py-2 border rounded" aria-label="Active">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>
      {open && category.children?.length > 0 && (
        <div className="pl-6 pb-3">
          <Tree categories={category.children} onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}
