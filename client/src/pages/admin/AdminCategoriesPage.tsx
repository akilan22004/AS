import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { api, DEFAULT_CATEGORIES } from '../../services/api';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: api.getAdminCategories,
    initialData: DEFAULT_CATEGORIES,
  });
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const refreshCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const saveNewCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await api.createCategory({
        name: name.trim(),
        slug: (slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description.trim(),
      });
      setName('');
      setSlug('');
      setDescription('');
      await refreshCategories();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create category.');
    }
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setError('');
    try {
      await api.updateCategory(editing.id, {
        name: editing.name.trim(),
        slug: editing.slug.trim().toLowerCase(),
        description: editing.description || '',
        displayOrder: editing.displayOrder,
        isVisible: editing.isVisible,
      });
      setEditing(null);
      await refreshCategories();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update category.');
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Delete the "${category.name}" category?`)) return;
    setError('');
    try {
      await api.deleteCategory(category.id);
      await refreshCategories();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete category.');
    }
  };

  return (
    <div className="min-w-[320px] max-w-[640px] mx-auto min-h-screen bg-[#F7F3EC] shadow-2xl flex flex-col font-sans">
      <header className="bg-[#241B16] text-[#F7F3EC] px-4 py-3 flex items-center gap-3">
        <Link to="/admin/dashboard" className="p-1 hover:text-[#C8A77D]" aria-label="Back to dashboard">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-sm font-bold">Category Management</h1>
          <p className="text-[9px] text-[#C8A77D]">Admin Portal</p>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">{error}</p>}

        <form onSubmit={saveNewCategory} className="space-y-3 rounded-2xl border border-[#DDD1C0] bg-[#FCFAF7] p-4">
          <h2 className="font-serif text-sm font-bold text-[#241B16]">Add Category</h2>
          <input
            required
            maxLength={100}
            value={name}
            onChange={event => {
              const nextName = event.target.value;
              setName(nextName);
              if (!slug) setSlug(nextName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
            }}
            placeholder="Category name"
            className="w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs"
          />
          <input
            required
            maxLength={100}
            pattern="[a-z0-9\-]+"
            value={slug}
            onChange={event => setSlug(event.target.value)}
            placeholder="category-slug"
            className="w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs"
          />
          <textarea
            maxLength={2000}
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Description"
            rows={2}
            className="w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs"
          />
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#493326] px-4 py-2 text-xs text-[#F7F3EC]">
            <Plus size={14} /> Create category
          </button>
        </form>

        <section className="space-y-3">
          {categoriesQuery.isLoading && <p className="py-5 text-center text-xs text-[#7A675B]">Loading categories…</p>}
          {categoriesQuery.isError && (
            <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">
              Could not load categories.
              <button type="button" onClick={() => categoriesQuery.refetch()} className="ml-2 underline">Retry</button>
            </div>
          )}
          {categoriesQuery.data?.map(category => {
            const value = editing?.id === category.id ? editing : category;
            return (
              <form key={category.id} onSubmit={saveCategory} className="space-y-2 rounded-2xl border border-[#DDD1C0] bg-[#FCFAF7] p-4">
                <input
                  required
                  maxLength={100}
                  value={value.name}
                  readOnly={editing?.id !== category.id}
                  onChange={event => editing && setEditing({ ...editing, name: event.target.value })}
                  className="w-full rounded-lg border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs font-bold"
                />
                {editing?.id === category.id && (
                  <>
                    <input
                      required
                      pattern="[a-z0-9\-]+"
                      maxLength={100}
                      value={value.slug}
                      onChange={event => setEditing({ ...editing, slug: event.target.value })}
                      className="w-full rounded-lg border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs"
                    />
                    <textarea
                      maxLength={2000}
                      value={value.description || ''}
                      onChange={event => setEditing({ ...editing, description: event.target.value })}
                      rows={2}
                      className="w-full rounded-lg border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs"
                    />
                    <div className="flex items-center gap-3 text-xs text-[#695446]">
                      <label>Order <input type="number" min="0" value={value.displayOrder} onChange={event => setEditing({ ...editing, displayOrder: Number(event.target.value) })} className="ml-1 w-16 rounded border border-[#DDD1C0] px-2 py-1" /></label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={value.isVisible} onChange={event => setEditing({ ...editing, isVisible: event.target.checked })} /> Visible</label>
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2">
                  {editing?.id === category.id ? (
                    <>
                      <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[#DDD1C0] px-3 py-1.5 text-xs"><X size={14} /></button>
                      <button type="submit" className="inline-flex items-center gap-1 rounded-full bg-[#493326] px-3 py-1.5 text-xs text-white"><Save size={13} /> Save</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => setEditing({ ...category })} className="rounded p-1.5 text-[#493326]" aria-label={`Edit ${category.name}`}><Pencil size={15} /></button>
                      <button type="button" onClick={() => deleteCategory(category)} className="rounded p-1.5 text-red-700" aria-label={`Delete ${category.name}`}><Trash2 size={15} /></button>
                      {category.isVisible && <Check size={15} className="mt-1 text-green-700" aria-label="Visible" />}
                    </>
                  )}
                </div>
              </form>
            );
          })}
        </section>
      </main>
    </div>
  );
};
