import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Bookmark, Check, ArrowRight, X } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import { useShortlist } from '../../context/ShortlistContext';
import { api, DEFAULT_CATEGORIES } from '../../services/api';
import { Product } from '../../types';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [inputSearch, setInputSearch] = useState(searchQuery);

  const { isInShortlist, toggleShortlist } = useShortlist();

  // Dynamic categories from database
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    initialData: DEFAULT_CATEGORIES,
  });

  // Fetch products from backend
  const { data, isLoading } = useQuery({
    queryKey: ['products', activeCategory, searchQuery],
    queryFn: () =>
      api.getProducts({
        category: activeCategory === 'all' ? undefined : activeCategory,
        search: searchQuery || undefined,
      }),
  });

  // Search input debouncer for smooth auto-filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputSearch.trim();
      if (trimmed !== searchQuery) {
        if (trimmed) {
          searchParams.set('search', trimmed);
        } else {
          searchParams.delete('search');
        }
        setSearchParams(searchParams, { replace: true });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [inputSearch, searchQuery, searchParams, setSearchParams]);

  const categoryList = categoriesQuery.data || DEFAULT_CATEGORIES;
  const filterTabs = [
    { label: 'All Furniture', value: 'all' },
    ...categoryList.map(c => ({ label: c.name, value: c.slug })),
  ];

  const handleCategoryChange = (val: string) => {
    if (val === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', val);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSearch.trim()) {
      searchParams.set('search', inputSearch.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const products: Product[] = data?.items || [];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        {/* Editorial Collection Banner */}
        <section className="bg-gradient-to-b from-[#F2ECE1] to-[#FAF8F5] border-b border-[#EAE2D5] py-8 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-xl">
                <span className="font-serif tracking-[0.25em] text-[10px] sm:text-xs text-[#8A7569] uppercase font-semibold block mb-2">
                  Annamalai Workshop Catalog
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#241B16] font-bold tracking-tight">
                  Our Handcrafted Collection
                </h1>
                <p className="mt-3 text-xs sm:text-sm text-[#695446] leading-relaxed">
                  Sculpted from whole timbers of seasoned Teak, Rosewood and Sheesham. Browse our catalog or enquire for custom dimension variations.
                </p>
              </div>

              {/* Status counter */}
              <div className="text-xs sm:text-sm text-[#8A7569] font-serif flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B69764]" />
                <span>Showing {products.length} {products.length === 1 ? 'model' : 'models'} available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls & Search Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
            
            {/* Search Input with Debounce */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search size={16} className="text-[#8A7569] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, model code, or timber..."
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                className="w-full bg-white pl-10 pr-9 py-2.5 rounded-full border border-[#DDD1C0] text-xs sm:text-sm text-[#241B16] placeholder-[#8A7569] focus:outline-none focus:border-[#493326] shadow-sm"
              />
              {inputSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setInputSearch('');
                    searchParams.delete('search');
                    setSearchParams(searchParams);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A7569] hover:text-[#241B16]"
                >
                  <X size={15} />
                </button>
              )}
            </form>

            {/* Quick Action: Reset filters if active */}
            {(activeCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setInputSearch('');
                  setSearchParams(new URLSearchParams());
                }}
                className="text-xs text-[#8A7569] hover:text-[#241B16] underline self-start md:self-auto font-serif"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filter Pills (Smooth scrollable on mobile, wraps cleanly on desktop) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
            {filterTabs.map((tab) => {
              const active = activeCategory === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleCategoryChange(tab.value)}
                  className={`px-4 py-2 rounded-full text-xs font-serif whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#493326] text-[#F7F3EC] border-[#493326] shadow-md font-semibold'
                      : 'bg-white text-[#493326] border-[#DDD1C0] hover:bg-[#F2ECE1] shadow-sm'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Responsive Product Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
          {isLoading ? (
            <div className="py-20 text-center font-serif text-sm text-[#8A7569] animate-pulse">
              Loading handcrafted furniture pieces from our workshop…
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#EAE2D5] p-8 max-w-xl mx-auto shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] text-[#8A7569] flex items-center justify-center mb-3">
                <Search size={20} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#241B16]">No models match your criteria</h3>
              <p className="text-xs text-[#695446] mt-1 mb-4">
                Try searching with different terms or reset your category filter.
              </p>
              <button
                onClick={() => {
                  setInputSearch('');
                  setSearchParams(new URLSearchParams());
                }}
                className="bg-[#493326] text-white px-5 py-2 rounded-full text-xs font-serif hover:bg-[#38251C]"
              >
                Show All Furniture
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {products.map((product) => {
                const shortlisted = isInShortlist(product.id);
                const displayImg = product.images?.[0]?.url || product.images?.[0]?.filePath;

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.slug}`)}
                    className="cursor-pointer bg-white border border-[#EAE2D5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C8A77D] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Image Container with Shortlist Toggle */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE1]">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={`${product.name} photo`}
                          className="w-full h-full flex items-center justify-center bg-[#F0EAE1] text-xs text-[#8A7569]"
                        >
                          Photo coming soon
                        </div>
                      )}

                      {/* Floating Shortlist Bookmark */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist(product);
                        }}
                        className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                          shortlisted
                            ? 'bg-[#B69764] text-[#241B16] shadow-md scale-105'
                            : 'bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm'
                        }`}
                        title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                        aria-label="Bookmark"
                      >
                        {shortlisted ? <Check size={14} strokeWidth={2.5} /> : <Bookmark size={14} />}
                      </button>

                      {/* Model Code Pill */}
                      <div className="absolute bottom-2 left-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono tracking-wider">
                        {product.modelCode}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[9px] sm:text-[10px] text-[#B69764] font-serif uppercase tracking-wider block mb-0.5">
                          {product.category?.name || 'Solid Wood'}
                        </span>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-[#241B16] leading-tight line-clamp-1 group-hover:text-[#B69764] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[10.5px] sm:text-xs text-[#695446] leading-relaxed mt-1 line-clamp-2">
                          {product.description || 'Premium solid wood furniture handcrafted for your home.'}
                        </p>
                      </div>

                      {/* Material tag & Details Link */}
                      <div className="mt-3 pt-2.5 border-t border-[#F2ECE1] flex items-center justify-between text-xs">
                        <span className="text-[10px] sm:text-xs text-[#8A7569] truncate max-w-[120px]">
                          {product.material || 'Solid Teak'}
                        </span>
                        <span className="font-serif font-semibold text-[#493326] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>View</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* WhatsApp Banner */}
        <WhatsAppBanner />
      </main>

      <Footer />
    </div>
  );
};
