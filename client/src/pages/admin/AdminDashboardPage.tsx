import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LogOut,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Product } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [feedback, setFeedback] = useState<string | null>(null);

  // Queries
  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.getDashboardStats,
  });

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: api.getAllProductsAdmin,
  });

  // Mutations
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.updateProduct(id, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      setFeedback('Product status updated!');
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : 'Unable to update product status.');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: ({ id, imagePaths }: { id: string; imagePaths?: string[] }) =>
      api.deleteProduct(id, imagePaths),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      setFeedback('Product deleted successfully');
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : 'Unable to delete product.');
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const stats = statsQuery.data;
  const products: Product[] = productsQuery.data?.items || [];
  return (
    <div className="min-w-[320px] max-w-[640px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-[#241B16] text-[#F7F3EC] px-4 py-3 flex flex-wrap items-center justify-between gap-y-2 border-b border-[#3D2C22]">
        <div className="flex items-center gap-2">
          <img src="/assets/tree-logo.png" alt="Logo" className="h-6 w-auto object-contain" />
          <div>
            <h1 className="font-serif tracking-wider text-xs font-bold uppercase">ANNAMALAI</h1>
            <p className="font-serif tracking-widest text-[7px] text-[#C8A77D] uppercase">ADMIN DASHBOARD</p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 sm:w-auto sm:justify-end">
          <Link
            to="/admin/categories"
            className="text-[11px] text-[#C8A77D] hover:underline font-serif"
          >
            Categories
          </Link>
          <span className="text-[#594338]">•</span>
          <Link
            to="/admin/products/new"
            className="text-[11px] text-[#C8A77D] hover:underline font-serif"
          >
            + Add Model
          </Link>
          <span className="text-[#594338]">•</span>
          <Link
            to="/admin/media"
            className="text-[11px] text-[#C8A77D] hover:underline font-serif"
          >
            Media Library
          </Link>
          <span className="text-[#594338]">•</span>
          <a
            href="/"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                navigate('/');
              }
            }}
            className="text-[11px] text-[#C8A77D] hover:underline flex items-center gap-1 font-serif cursor-pointer"
            title="View live website"
          >
            <span>View Site</span>
            <ExternalLink size={12} />
          </a>
          <button
            onClick={handleLogout}
            className="p-1.5 text-white/80 hover:text-white"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Feedback alert */}
        {feedback && (
          <div className="bg-[#EAE2D5] border border-[#B69764] text-[#241B16] px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
            <CheckCircle size={16} className="text-[#493326]" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Database Stats Cards Grid */}
        <section className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#FCFAF7] border border-[#DFD6C9] rounded-2xl p-3 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8A7569]">
              <Package size={16} />
              <span className="text-[10px] uppercase font-bold text-[#493326]">Products</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-serif font-bold text-[#241B16]">
                {stats?.totalProducts ?? 0}
              </span>
              <span className="text-[9.5px] text-[#8A7569] block mt-0.5">
                ({stats?.publishedProducts ?? 0} published)
              </span>
            </div>
          </div>

          <div className="bg-[#FCFAF7] border border-[#DFD6C9] rounded-2xl p-3 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8A7569]">
              <Layers size={16} />
              <span className="text-[10px] uppercase font-bold text-[#493326]">Categories</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-serif font-bold text-[#241B16]">
                {stats?.totalCategories ?? 0}
              </span>
              <span className="text-[9.5px] text-[#8A7569] block mt-0.5">Active categories</span>
            </div>
          </div>

          <div className="bg-[#FCFAF7] border border-[#DFD6C9] rounded-2xl p-3 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8A7569]">
              <ImageIcon size={16} />
              <span className="text-[10px] uppercase font-bold text-[#493326]">Photos</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-serif font-bold text-[#241B16]">
                {stats?.totalImages ?? 0}
              </span>
              <span className="text-[9.5px] text-[#8A7569] block mt-0.5">Product assets</span>
            </div>
          </div>
        </section>

        {/* Action Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="font-serif text-base font-bold text-[#241B16]">Furniture Models</h2>
            <p className="text-[10.5px] text-[#7A675B]">Manage catalog publication & availability</p>
          </div>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] px-3.5 py-1.5 rounded-full text-xs font-serif font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Add Model</span>
          </button>
        </div>

        {/* Product Management Table/Cards */}
        <section className="space-y-2">
          {productsQuery.isLoading ? (
            <div className="py-8 text-center text-xs text-[#8A7569] font-serif">
              Loading models from database...
            </div>
          ) : productsQuery.isError ? (
            <div className="py-8 text-center text-xs text-red-800 font-serif">
              <p>Unable to load products: {productsQuery.error.message}</p>
              <button
                type="button"
                onClick={() => productsQuery.refetch()}
                className="mt-2 underline"
              >
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A7569] font-serif">
              No products found in the database.
            </div>
          ) : (
            products.map((p) => {
              const displayImg = p.images?.[0]?.url || p.images?.[0]?.filePath;
              const imageCount = p.images?.length ?? 0;

              return (
                <div
                  key={p.id}
                  className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow transition-all"
                >
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={p.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#DFD5C6] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-[#DFD5C6] flex items-center justify-center text-[#8A7569] flex-shrink-0">
                      <ImageIcon size={18} aria-label="No product photo" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xs font-bold text-[#241B16] truncate">
                        {p.name}
                      </h3>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                          p.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-[#8A7569] block mt-0.5">
                      Code: {p.modelCode} | Category: {p.category?.name || 'Solid Wood'}
                    </span>
                    <span className="text-[9px] text-[#695446] block truncate mt-0.5">
                      {p.material || 'Solid Teak Wood'}
                    </span>
                    <span className={`text-[9px] block mt-0.5 ${imageCount === 0 ? 'text-amber-800' : 'text-[#695446]'}`}>
                      Gallery: {imageCount} {imageCount === 1 ? 'image' : 'images'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/admin/products/${encodeURIComponent(p.id)}/edit`}
                      className="p-1.5 rounded-lg border border-[#C8A77D] text-[#493326] hover:bg-[#F2ECE1]"
                      title="Edit product and gallery"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={15} />
                    </Link>
                    {/* Toggle publish button */}
                    <button
                      onClick={() =>
                        togglePublishMutation.mutate({
                          id: p.id,
                          isPublished: !p.isPublished,
                        })
                      }
                      className={`p-1.5 rounded-lg border transition-all ${
                        p.isPublished
                          ? 'border-[#C8A77D] text-[#493326] hover:bg-[#F2ECE1]'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                      }`}
                      title={p.isPublished ? 'Unpublish model' : 'Publish model'}
                      disabled={togglePublishMutation.isPending}
                    >
                      {p.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                          deleteProductMutation.mutate({
                            id: p.id,
                            imagePaths: (p.images?.map(img => img.filePath || img.url).filter(Boolean) as string[]) || [],
                          });
                        }
                      }}
                      className="p-1.5 text-[#8A7569] hover:text-red-700 transition-colors"
                      title="Delete model"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

    </div>
  );
};
