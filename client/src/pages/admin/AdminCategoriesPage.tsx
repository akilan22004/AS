import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, Pencil, Plus, Save, Trash2, X, Layers, ArrowLeft } from 'lucide-react';
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
  const [success, setSuccess] = useState('');

  const refreshCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  const saveNewCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.createCategory({
        name: name.trim(),
        slug: (slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description.trim(),
        isVisible: true,
      });
      setName('');
      setSlug('');
      setDescription('');
      setSuccess('Category added successfully!');
      await refreshCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create category.');
    }
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setError('');
    setSuccess('');
    try {
      await api.updateCategory(editing.id, {
        name: editing.name.trim(),
        slug: editing.slug.trim().toLowerCase(),
        description: editing.description || '',
        displayOrder: editing.displayOrder,
        isVisible: editing.isVisible,
      });
      setEditing(null);
      setSuccess('Category updated successfully!');
      await refreshCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update category.');
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete the "${category.name}" category?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.deleteCategory(category.id);
      setSuccess(`"${category.name}" deleted.`);
      await refreshCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete category.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F3EC] flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-[#241B16] text-[#F7F3EC] sticky top-0 z-30 shadow-md border-b border-[#3D2C22]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#C8A77D] transition-colors"
              aria-label="Back to dashboard"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-white px-2.5 py-1 rounded-lg border border-[#DDD1C0] shadow-sm flex items-center justify-center">
                <img
                  src="/assets/annamalai-logo.png"
                  alt="Annamalai Furniture Logo"
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="font-serif text-xs sm:text-sm font-bold text-white leading-none">
                  Category Management
                </h1>
                <p className="text-[9px] text-[#C8A77D] tracking-widest uppercase mt-0.5 leading-none">
                  Admin Studio
                </p>
              </div>
            </div>
          </div>
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-1.5 bg-[#B69764] hover:bg-[#A38350] text-[#241B16] font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {error && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-800 shadow-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 ml-2">
              <X size={14} />
            </button>
          </div>
        )}
        {success && (
          <div role="status" className="rounded-xl border border-green-300 bg-green-50 p-3.5 text-xs text-green-800 shadow-sm flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-800 ml-2">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Add Category Form Card */}
        <form onSubmit={saveNewCategory} className="space-y-4 rounded-2xl sm:rounded-3xl border border-[#DDD1C0] bg-[#FCFAF7] p-5 sm:p-6 shadow-md">
          <div className="flex items-center gap-2 border-b border-[#EAE2D5] pb-3">
            <div className="w-8 h-8 rounded-xl bg-[#EFE9DF] text-[#493326] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#241B16]">Add New Category</h2>
              <p className="text-[11px] text-[#7A675B]">Create a new product category for your furniture collection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#241B16] mb-1">
                Category Name <span className="text-red-600">*</span>
              </label>
              <input
                required
                maxLength={100}
                value={name}
                onChange={event => {
                  const nextName = event.target.value;
                  setName(nextName);
                  if (!slug) setSlug(nextName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }}
                placeholder="e.g. Dining Tables"
                className="w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#241B16] mb-1">
                URL Slug <span className="text-red-600">*</span>
              </label>
              <input
                required
                maxLength={100}
                pattern="[a-z0-9\-]+"
                value={slug}
                onChange={event => setSlug(event.target.value)}
                placeholder="e.g. dining-tables"
                className="w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#241B16] font-mono focus:outline-none focus:border-[#493326]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#241B16] mb-1">
              Description (Optional)
            </label>
            <textarea
              maxLength={2000}
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="e.g. Handcrafted dining tables built for generations of family gatherings."
              rows={2}
              className="w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#493326] hover:bg-[#34241A] px-5 py-2.5 text-xs font-semibold text-[#F7F3EC] shadow-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <Plus size={15} /> Save & Create Category
            </button>
          </div>
        </form>

        {/* Existing Categories List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-bold text-[#241B16]">
              All Categories ({categoriesQuery.data?.length || 0})
            </h2>
            <button
              type="button"
              onClick={() => categoriesQuery.refetch()}
              className="text-xs text-[#8A7569] hover:text-[#241B16] underline"
            >
              Refresh
            </button>
          </div>

          {categoriesQuery.isLoading && (
            <p className="py-6 text-center text-xs text-[#7A675B]">Loading categories from database…</p>
          )}

          {categoriesQuery.isError && (
            <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-800">
              Could not load categories from database.
              <button type="button" onClick={() => categoriesQuery.refetch()} className="ml-2 underline font-semibold">
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoriesQuery.data?.map(category => {
              const value = editing?.id === category.id ? editing : category;
              return (
                <form
                  key={category.id}
                  onSubmit={saveCategory}
                  className="rounded-2xl border border-[#DDD1C0] bg-[#FCFAF7] p-4 shadow-sm space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <input
                      required
                      maxLength={100}
                      value={value.name}
                      readOnly={editing?.id !== category.id}
                      onChange={event => editing && setEditing({ ...editing, name: event.target.value })}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                        editing?.id === category.id
                          ? 'border border-[#493326] bg-[#FAF7F2] text-[#241B16]'
                          : 'border-transparent bg-transparent text-[#241B16]'
                      }`}
                    />
                    {editing?.id === category.id ? (
                      <div className="space-y-2 mt-2">
                        <input
                          required
                          pattern="[a-z0-9\-]+"
                          maxLength={100}
                          value={value.slug}
                          onChange={event => setEditing({ ...editing, slug: event.target.value })}
                          className="w-full rounded-lg border border-[#DDD1C0] bg-[#FAF7F2] px-2.5 py-1.5 text-xs font-mono"
                          placeholder="slug"
                        />
                        <textarea
                          maxLength={2000}
                          value={value.description || ''}
                          onChange={event => setEditing({ ...editing, description: event.target.value })}
                          rows={2}
                          className="w-full rounded-lg border border-[#DDD1C0] bg-[#FAF7F2] px-2.5 py-1.5 text-xs"
                          placeholder="description"
                        />
                        <div className="flex items-center gap-3 text-xs text-[#695446]">
                          <label className="flex items-center gap-1">
                            Order:
                            <input
                              type="number"
                              min="0"
                              value={value.displayOrder}
                              onChange={event => setEditing({ ...editing, displayOrder: Number(event.target.value) })}
                              className="w-14 rounded border border-[#DDD1C0] px-1.5 py-1"
                            />
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value.isVisible}
                              onChange={event => setEditing({ ...editing, isVisible: event.target.checked })}
                            />
                            <span>Visible</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#7A675B] px-2.5 line-clamp-2">
                        {category.description || `Slug: ${category.slug}`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE2D5] mt-2">
                    <span className="text-[10px] text-[#8A7569] font-mono px-2">
                      #{category.displayOrder || 0}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {editing?.id === category.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-lg border border-[#DDD1C0] px-2.5 py-1 text-xs hover:bg-[#FAF7F2]"
                          >
                            <X size={14} />
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#493326] px-3 py-1 text-xs text-white hover:bg-[#34241A]"
                          >
                            <Save size={13} /> Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditing({ ...category })}
                            className="rounded p-1.5 text-[#493326] hover:bg-[#EFE9DF]"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(category)}
                            className="rounded p-1.5 text-red-700 hover:bg-red-50"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                          {category.isVisible && (
                            <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold ml-1">
                              Live
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </form>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
