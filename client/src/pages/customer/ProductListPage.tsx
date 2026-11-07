import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Bookmark, Check } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import { useShortlist } from '../../context/ShortlistContext';
import { api } from '../../services/api';
import { Product } from '../../types';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [inputSearch, setInputSearch] = useState(searchQuery);

  const { isInShortlist, toggleShortlist } = useShortlist();

  // Fetch products from backend
  const { data, isLoading } = useQuery({
    queryKey: ['products', activeCategory, searchQuery],
    queryFn: () =>
      api.getProducts({
        category: activeCategory === 'all' ? undefined : activeCategory,
        search: searchQuery || undefined,
      }),
  });

  const filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Sofas', value: 'sofas' },
    { label: 'Beds', value: 'beds' },
    { label: 'Dining', value: 'dining-tables' },
    { label: 'Wardrobes', value: 'wardrobes' },
    { label: 'Chairs', value: 'chairs' },
    { label: 'TV Units', value: 'tv-units' },
    { label: 'Dressing Tables', value: 'dressing-tables' },
    { label: 'Storage Cabinets', value: 'storage-cabinets' },
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
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Header Banner with carved armrest accent */}
        <section className="relative px-5 pt-6 pb-4 bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC] overflow-hidden">
          <div className="max-w-[240px]">
            <h1 className="font-serif text-[23px] text-[#241B16] font-bold leading-tight tracking-tight">
              Our Handcrafted Collection
            </h1>
            <div className="w-12 h-[1px] bg-[#B69764] my-2"></div>
            <p className="text-[10px] text-[#695446] leading-relaxed">
              A curated range of solid wood furniture, crafted for comfort, style and lasting value.
            </p>
          </div>
          {/* Carved sofa armrest decorative background crop */}
          <div className="absolute right-0 top-0 bottom-0 w-[125px] overflow-hidden opacity-90 pointer-events-none">
            <img
              src="/assets/p-detail-thumb-2.jpg"
              alt="Handcrafted Wood Carving"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </section>

        {/* Search & Filter Controls */}
        <section className="px-4 py-2">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-3">
            <div className="flex-1 relative flex items-center bg-[#ECE4D8] rounded-full px-3 py-2 border border-[#DDD1C0]">
              <Search size={16} className="text-[#8A7569] mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search furniture..."
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-[#241B16] placeholder-[#8A7569] focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-[#493326] text-[#F7F3EC] flex items-center justify-center flex-shrink-0 hover:bg-[#38251C] transition-colors"
              aria-label="Filter"
            >
              <SlidersHorizontal size={16} />
            </button>
          </form>

          {/* Filter Chips (Horizontal scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {filterTabs.map((tab) => {
              const active = activeCategory === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleCategoryChange(tab.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-serif whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#493326] text-[#F7F3EC] border-[#493326] shadow-sm'
                      : 'bg-[#F2ECE1] text-[#493326] border-[#DDD1C0] hover:bg-[#EAE2D5]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2-Column Product Grid */}
        <section className="px-3 py-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#8A7569] font-serif">
              Loading handcrafted collection...
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A7569] font-serif">
              No furniture models found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {products.map((product) => {
                const shortlisted = isInShortlist(product.id);
                const displayImg = product.images?.[0]?.url || product.images?.[0]?.filePath;

                return (
                  <div
                    key={product.id}
                    className="bg-[#FDFBF7] border border-[#DDD1C0] rounded-2xl overflow-hidden shadow-sm product-card flex flex-col justify-between"
                  >
                    {/* Image Container with Bookmark button */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E2D8C9]">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover img-zoom"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={`${product.name} photo unavailable`}
                          className="w-full h-full"
                        />
                      )}
                      {/* Shortlist Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist(product);
                        }}
                        className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                          shortlisted
                            ? 'bg-[#B69764] text-[#241B16] shadow-md'
                            : 'bg-black/35 hover:bg-black/60 text-white'
                        }`}
                        title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                        aria-label="Bookmark"
                      >
                        {shortlisted ? <Check size={13} strokeWidth={2.5} /> : <Bookmark size={13} />}
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="p-2.5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-serif text-[12.5px] font-bold text-[#241B16] leading-tight line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="text-[9px] font-mono text-[#8A7569] block mt-0.5">
                          {product.modelCode}
                        </span>
                        <p className="text-[8.5px] text-[#695446] leading-snug mt-1 line-clamp-2">
                          {product.description || 'Premium solid wood furniture handcrafted for your home.'}
                        </p>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => navigate(`/products/${product.slug}`)}
                        className="mt-2.5 w-full bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-1 px-2 rounded-full font-serif text-[9.5px] font-medium flex items-center justify-center gap-1 transition-colors btn-press"
                      >
                        <span>View Details</span>
                        <span className="text-[10px]">→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Dark Wood Craftsmanship Banner */}
        <section className="bg-[#38261D] text-[#F7F3EC] py-4 px-4 my-2 flex items-center gap-3">
          <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#523B2F]">
            <img
              src="/assets/craft-artisan-senior.jpg"
              alt="Handcrafted with Precision"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-[14px] font-bold text-[#F7F3EC] leading-tight">
              Handcrafted with Precision
            </h3>
            <p className="mt-1 text-[8.5px] text-[#C8A77D] leading-relaxed">
              Thoughtful design, skilled craftsmanship and the beauty of natural wood.
            </p>
            <button
              onClick={() => navigate('/collections')}
              className="mt-2 border border-[#C8A77D]/60 text-[#C8A77D] hover:bg-[#C8A77D] hover:text-[#241B16] px-2.5 py-0.5 rounded-full text-[8.5px] font-serif transition-colors flex items-center gap-1"
            >
              <span>Discover Our Craft</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* WhatsApp Banner */}
        <WhatsAppBanner />
      </main>

      <Footer />
    </div>
  );
};
