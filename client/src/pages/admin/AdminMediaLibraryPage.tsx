import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Search, UploadCloud, FolderPlus, X, ExternalLink, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { optimizeImage } from '../../utils/imageOptimizer';

export const AdminMediaLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [uploadedMedia, setUploadedMedia] = useState<Array<{
    id: string;
    productId: string;
    productName: string;
    modelCode: string;
    name: string;
    url: string;
    fullUrl: string;
    category: string;
    order: number;
    filePath: string;
  }>>([]);

  const productsQuery = useQuery({ queryKey: ['admin-products'], queryFn: api.getAllProductsAdmin });
  const mediaItems = [
    ...(productsQuery.data?.items || []).flatMap(product =>
      product.images.map(image => ({
        id: image.id,
        productId: product.id,
        productName: product.name,
        modelCode: product.modelCode,
        name: image.altText || `${product.modelCode} image`,
        url: image.thumbUrl || image.url || image.filePath,
        fullUrl: image.url || image.thumbUrl || image.filePath,
        category: product.category?.name || 'Other',
        order: image.displayOrder,
        filePath: image.filePath,
      }))
    ),
    ...uploadedMedia,
  ];

  const filterTabs = ['All', ...new Set(mediaItems.map(item => item.category))];
  const filteredItems = mediaItems.filter(item => {
    const matchCategory = activeTab === 'All' || item.category === activeTab;
    const matchSearch = `${item.name} ${item.productName} ${item.modelCode}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    e.target.value = '';
    setUploading(true);
    setUploadMessage(null);

    try {
      if (!supabase) throw new Error('Supabase Storage is not initialized.');
      let count = 0;
      const newItems: typeof uploadedMedia = [];
      for (const file of files) {
        const optimized = await optimizeImage(file);
        const ext = optimized.name.split('.').pop() || 'webp';
        const storagePath = `media-library/${Date.now()}-${count}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('furniture_image')
          .upload(storagePath, optimized, { contentType: optimized.type, upsert: true });
        if (uploadError) throw uploadError;

        const { data: pubData } = supabase.storage.from('furniture_image').getPublicUrl(storagePath);
        newItems.push({
          id: storagePath,
          productId: '',
          productName: 'Media Library Upload',
          modelCode: 'DIRECT-UPLOAD',
          name: file.name,
          url: pubData.publicUrl,
          fullUrl: pubData.publicUrl,
          category: 'Direct Uploads',
          order: count,
          filePath: storagePath,
        });
        count++;
      }
      setUploadedMedia(prev => [...newItems, ...prev]);
      setUploadMessage(`Successfully uploaded ${count} photo${count === 1 ? '' : 's'} to Supabase Storage!`);
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F3EC] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="bg-[#241B16] text-[#F7F3EC] sticky top-0 z-30 shadow-md border-b border-[#3D2C22]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
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
                  Media Library
                </h1>
                <p className="text-[9px] text-[#C8A77D] tracking-widest uppercase mt-0.5 leading-none">
                  Admin Studio
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-1.5 bg-[#B69764] hover:bg-[#A38350] text-[#241B16] font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              + Add Furniture
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Banner with Stats & Upload */}
        <div className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#241B16]">
              Furniture Photography & Media
            </h2>
            <p className="text-xs text-[#7A675B] mt-1">
              {mediaItems.length} photos active in catalog. High-resolution storage hosted on Supabase CDN.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
              <UploadCloud size={16} />
              <span>{uploading ? 'Optimizing...' : 'Upload Photos'}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleDirectUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <Link
              to="/admin/categories"
              className="border border-[#493326] text-[#493326] hover:bg-[#F2ECE1] py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FolderPlus size={15} />
              <span>Categories</span>
            </Link>
          </div>
        </div>

        {uploadMessage && (
          <div className="bg-[#EAE2D5] border border-[#B69764] text-[#241B16] px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
            <Check size={16} className="text-green-800" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1 sm:max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7569]" />
            <input
              type="text"
              placeholder="Search images by model, title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#DDD1C0] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {filterTabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif whitespace-nowrap transition-all border ${
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
        </div>

        {/* Media Responsive Grid (2 cols mobile, 3 tablet, 4-6 desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-1">
          {productsQuery.isLoading && (
            <p className="col-span-full py-12 text-center text-xs text-[#7A675B]">Loading product photos…</p>
          )}
          {productsQuery.isError && (
            <div role="alert" className="col-span-full py-8 text-center text-xs text-red-700 bg-red-50 rounded-2xl p-4">
              Product photos could not be loaded.
              <button type="button" className="ml-2 underline font-semibold" onClick={() => productsQuery.refetch()}>
                Retry
              </button>
            </div>
          )}

          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#C8A77D] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative aspect-square overflow-hidden bg-[#FAF7F2]">
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono">
                  {item.modelCode}
                </span>
              </div>
              <div className="p-2 sm:p-2.5">
                <p className="text-xs font-serif font-bold text-[#241B16] truncate">
                  {item.productName}
                </p>
                <p className="text-[10px] text-[#8A7569] truncate mt-0.5">
                  {item.category}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#241B16]">
                    {selectedImage.productName}
                  </h3>
                  <p className="text-xs text-[#7A675B] font-mono">
                    Model: {selectedImage.modelCode || 'DIRECT-UPLOAD'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#DDD1C0]">
                <img
                  src={selectedImage.fullUrl}
                  alt={selectedImage.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedImage.fullUrl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD1C0] text-xs font-serif text-[#493326] hover:bg-[#FAF7F2] transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-700" /> : <Copy size={14} />}
                  <span>{copied ? 'Link Copied!' : 'Copy Photo URL'}</span>
                </button>

                {selectedImage.productId && (
                  <Link
                    to={`/admin/products/${encodeURIComponent(selectedImage.productId)}/edit`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#493326] text-white text-xs font-semibold hover:bg-[#34241A] transition-colors"
                  >
                    <span>Edit Model Details</span>
                    <ExternalLink size={13} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
