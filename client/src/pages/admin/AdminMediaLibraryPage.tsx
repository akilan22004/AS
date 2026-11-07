import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Search, UploadCloud, FolderPlus } from 'lucide-react';
import { api } from '../../services/api';

export const AdminMediaLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const productsQuery = useQuery({ queryKey: ['admin-products'], queryFn: api.getAllProductsAdmin });
  const mediaItems = (productsQuery.data?.items || []).flatMap(product =>
    product.images.map(image => ({
      id: image.id,
      productId: product.id,
      productName: product.name,
      name: image.altText || `${product.modelCode} image`,
      url: image.thumbUrl || image.url || image.filePath,
      category: product.category?.name || 'Other',
      order: image.displayOrder,
    }))
  );
  const filterTabs = ['All', ...new Set(mediaItems.map(item => item.category))];
  const filteredItems = mediaItems.filter(item => {
    const matchCategory = activeTab === 'All' || item.category === activeTab;
    const matchSearch = `${item.name} ${item.productName}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto min-h-screen bg-[#F7F3EC] shadow-2xl flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Mobile Bar */}
      <div className="bg-[#241B16] text-[#F7F3EC] px-4 py-2 flex items-center justify-between border-b border-[#3D2C22]">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-1 hover:text-[#C8A77D]">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-1.5">
            <img src="/assets/tree-logo.png" alt="Logo" className="h-6 w-auto object-contain" />
            <div>
              <span className="font-serif tracking-widest text-[11px] font-bold uppercase block leading-none">
                ANNAMALAI
              </span>
              <span className="font-serif tracking-[0.2em] text-[7px] text-[#C8A77D] uppercase block mt-0.5 leading-none">
                FURNITURE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative px-5 pt-4 pb-3 flex items-center justify-between overflow-hidden bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC]">
        <div className="relative z-10 max-w-[260px]">
          <h1 className="font-serif text-[18px] font-bold text-[#241B16] leading-tight">
            Furniture Media Library
          </h1>
          <p className="text-[9.5px] text-[#695446] mt-0.5 leading-snug">
            Review uploaded product photos. Open a product to upload, replace, reorder, or remove its gallery images.
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#B69764]">
            <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
            <span>🍃</span>
            <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
          </div>
        </div>

        {/* Right Wood Stack with Chisel Crop */}
        <div className="w-28 h-20 overflow-hidden flex-shrink-0 rounded-xl opacity-95">
          <img
            src="/assets/media-lib-wood.jpg"
            alt="Timber Blocks"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <main className="flex-1 px-4 pb-6 space-y-3">
        <div className="bg-[#FAF7F2] border border-[#DDD1C0] rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-[#241B16]">Product Photos</span>
              <span className="text-[10px] text-[#7A675B]">{mediaItems.length} saved in the catalog</span>
            </div>
            <div className="w-full bg-[#E8DFC8] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#493326] h-full rounded-full"
                style={{ width: `${mediaItems.length ? Math.min(100, Math.max(4, mediaItems.length * 2)) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link to="/admin/products/new" className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2.5 px-3 rounded-2xl font-serif text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all">
            <UploadCloud size={16} />
            <span>Add Product Photos</span>
          </Link>
          <Link to="/admin/categories" className="border border-[#493326] text-[#493326] hover:bg-[#F2ECE1] py-2.5 px-3 rounded-2xl font-serif text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
            <FolderPlus size={16} />
            <span>Manage Categories</span>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center bg-[#FAF7F2] rounded-full px-3 py-2 border border-[#DDD1C0]">
            <Search size={15} className="text-[#8A7569] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-[#241B16] placeholder-[#8A7569] focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-[10px] font-serif whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-[#493326] text-[#F7F3EC] border-[#493326]'
                    : 'bg-[#F2ECE1] text-[#493326] border-[#DDD1C0] hover:bg-[#EAE2D5]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Media 3-Column Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {productsQuery.isLoading && <p className="col-span-3 py-8 text-center text-xs text-[#7A675B]">Loading product photos…</p>}
          {productsQuery.isError && (
            <div role="alert" className="col-span-3 py-5 text-center text-xs text-red-700">
              Product photos could not be loaded.
              <button type="button" className="ml-2 underline" onClick={() => productsQuery.refetch()}>Retry</button>
            </div>
          )}
          {filteredItems.map(item => (
              <Link
                key={item.id}
                to={`/admin/products/${encodeURIComponent(item.productId)}/edit`}
                className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#C8A77D] transition-all"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#E2D8C9]">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                </div>

                <div className="p-1.5 text-center">
                  <span className="font-mono text-[9px] font-bold text-[#241B16] block truncate">
                    {item.name}
                  </span>
                  <span className="text-[7.5px] text-[#8A7569] block mt-0.5">
                    {item.productName} · Image {item.order + 1}
                  </span>
                </div>
              </Link>
          ))}
          {!productsQuery.isLoading && !productsQuery.isError && filteredItems.length === 0 && (
            <p className="col-span-3 py-8 text-center text-xs text-[#7A675B]">No product photos match this filter.</p>
          )}
        </div>
      </main>
    </div>
  );
};
