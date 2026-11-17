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
  Search,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Product } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.modelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#F7F3EC] flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="bg-[#241B16] text-[#F7F3EC] border-b border-[#3D2C22] sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-lg border border-[#DDD1C0] shadow-sm flex items-center justify-center">
              <img
                src="/assets/annamalai-logo.png"
                alt="Annamalai Furniture Logo"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif tracking-widest text-xs sm:text-sm font-bold text-white uppercase leading-none">
                ANNAMALAI FURNITURE
              </h1>
              <p className="font-serif tracking-[0.2em] text-[8px] text-[#C8A77D] uppercase mt-0.5 leading-none">
                ADMIN CONSOLE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-serif">
            <Link
              to="/admin/categories"
              className="text-[#C8A77D] hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/admin/media"
              className="text-[#C8A77D] hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Media Library
            </Link>
            <Link
              to="/"
              className="text-[#C8A77D] hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 flex items-center gap-1 transition-colors"
              title="View live website"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Feedback alert */}
        {feedback && (
          <div className="bg-[#EAE2D5] border border-[#B69764] text-[#241B16] px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
            <CheckCircle size={16} className="text-[#493326]" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Database Stats Cards Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-[#B69764] transition-colors">
            <div className="flex items-center justify-between text-[#8A7569]">
              <Package size={18} />
              <span className="text-[10px] uppercase font-bold text-[#493326] tracking-wider">Total Models</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#241B16]">
                {stats?.totalProducts ?? products.length}
              </span>
              <span className="text-[11px] text-[#8A7569] block mt-0.5">
                ({stats?.publishedProducts ?? products.filter(p => p.isPublished).length} live on site)
              </span>
            </div>
          </div>

          <div className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-[#B69764] transition-colors">
            <div className="flex items-center justify-between text-[#8A7569]">
              <Eye size={18} />
              <span className="text-[10px] uppercase font-bold text-[#493326] tracking-wider">Published</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-green-700">
                {stats?.publishedProducts ?? products.filter(p => p.isPublished).length}
              </span>
              <span className="text-[11px] text-[#8A7569] block mt-0.5">Available for buyers</span>
            </div>
          </div>

          <div className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-[#B69764] transition-colors">
            <div className="flex items-center justify-between text-[#8A7569]">
              <Layers size={18} />
              <span className="text-[10px] uppercase font-bold text-[#493326] tracking-wider">Categories</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#241B16]">
                {stats?.totalCategories ?? 8}
              </span>
              <Link to="/admin/categories" className="text-[11px] text-[#B69764] hover:underline block mt-0.5">
                Manage categories →
              </Link>
            </div>
          </div>

          <div className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-[#B69764] transition-colors">
            <div className="flex items-center justify-between text-[#8A7569]">
              <ImageIcon size={18} />
              <span className="text-[10px] uppercase font-bold text-[#493326] tracking-wider">Media Assets</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#241B16]">
                {stats?.totalImages ?? 0}
              </span>
              <Link to="/admin/media" className="text-[11px] text-[#B69764] hover:underline block mt-0.5">
                Open Media Library →
              </Link>
            </div>
          </div>
        </section>

        {/* Action Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#241B16]">
              Furniture Collection Catalog
            </h2>
            <p className="text-xs text-[#7A675B]">
              Add, update, publish and manage pieces in your public catalog
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7569]" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#DDD1C0] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
              />
            </div>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
              }}
              className="p-2 rounded-xl border border-[#DDD1C0] bg-white text-[#493326] hover:bg-[#FAF7F2] transition-colors"
              title="Refresh catalog"
            >
              <RefreshCw size={15} />
            </button>
            <Link
              to="/admin/products/new"
              className="bg-[#493326] hover:bg-[#34241A] text-[#F7F3EC] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>Add Furniture</span>
            </Link>
          </div>
        </div>

        {/* Product Management Grid / Table */}
        <section className="space-y-3">
          {productsQuery.isLoading ? (
            <div className="py-12 text-center text-xs text-[#8A7569] font-serif">
              Loading models from database...
            </div>
          ) : productsQuery.isError ? (
            <div className="py-8 text-center text-xs text-red-800 font-serif">
              <p>Unable to load products: {productsQuery.error.message}</p>
              <button
                type="button"
                onClick={() => productsQuery.refetch()}
                className="mt-2 underline font-semibold"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A7569] font-serif bg-white rounded-2xl border border-[#DDD1C0] p-8">
              {searchTerm ? `No furniture models matching "${searchTerm}"` : 'No products found in the database.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const displayImg = p.images?.[0]?.url || p.images?.[0]?.filePath;
                const imageCount = p.images?.length ?? 0;

                return (
                  <div
                    key={p.id}
                    className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl p-4 flex items-center justify-between gap-3.5 shadow-sm hover:shadow-md hover:border-[#B69764] transition-all"
                  >
                    {displayImg ? (
                      <img
                        src={displayImg}
                        alt={p.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#DFD5C6] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-[#DFD5C6] bg-[#FAF7F2] flex items-center justify-center text-[#8A7569] flex-shrink-0">
                        <ImageIcon size={20} aria-label="No photo" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-sm font-bold text-[#241B16] truncate">
                          {p.name}
                        </h3>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                            p.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8A7569] block mt-0.5">
                        {p.modelCode} • {p.category?.name || 'Solid Wood'}
                      </span>
                      <span className="text-[10px] text-[#695446] block truncate mt-0.5">
                        {p.material || 'Solid Teak Wood'}
                      </span>
                      <span className={`text-[10px] block mt-0.5 ${imageCount === 0 ? 'text-amber-800 font-semibold' : 'text-[#7A675B]'}`}>
                        {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link
                        to={`/admin/products/${encodeURIComponent(p.id)}/edit`}
                        className="p-2 rounded-xl border border-[#C8A77D] text-[#493326] hover:bg-[#F2ECE1] transition-colors"
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
                        className={`p-2 rounded-xl border transition-all ${
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
                        className="p-2 rounded-xl text-[#8A7569] hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete model"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
