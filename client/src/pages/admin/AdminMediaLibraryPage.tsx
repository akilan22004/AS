import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Search, UploadCloud, FolderPlus, X, ExternalLink, Copy, Check } from 'lucide-react';
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
        <div className="grid grid-cols-3 gap-2">
          <label className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2 px-2.5 rounded-2xl font-serif text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-center">
            <UploadCloud size={14} />
            <span>{uploading ? 'Optimizing...' : 'Upload Image'}</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleDirectUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <Link to="/admin/products/new" className="bg-[#594338] hover:bg-[#493326] text-[#F7F3EC] py-2 px-2.5 rounded-2xl font-serif text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all text-center">
            <span>+ Add Model</span>
          </Link>
          <Link to="/admin/categories" className="border border-[#493326] text-[#493326] hover:bg-[#F2ECE1] py-2 px-2.5 rounded-2xl font-serif text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all text-center">
            <FolderPlus size={14} />
            <span>Categories</span>
          </Link>
        </div>

        {uploadMessage && (
          <div className="bg-[#EAE2D5] border border-[#B69764] text-[#241B16] px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
            <Check size={15} className="text-green-800" />
            <span>{uploadMessage}</span>
          </div>
        )}

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
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#C8A77D] transition-all cursor-pointer group"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#E2D8C9]">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>

              <div className="p-1.5 text-center">
                <span className="font-mono text-[9px] font-bold text-[#241B16] block truncate">
                  {item.name}
                </span>
                <span className="text-[7.5px] text-[#8A7569] block mt-0.5">
                  {item.productName} · Image {item.order + 1}
                </span>
              </div>
            </div>
          ))}
          {!productsQuery.isLoading && !productsQuery.isError && filteredItems.length === 0 && (
            <p className="col-span-3 py-8 text-center text-xs text-[#7A675B]">No product photos match this filter.</p>
          )}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#FAF7F2] border border-[#DDD1C0] rounded-2xl max-w-[420px] w-full overflow-hidden shadow-2xl relative text-[#241B16]">
              <div className="flex items-center justify-between p-3 border-b border-[#DDD1C0] bg-[#F2ECE1]">
                <div>
                  <h3 className="font-serif text-xs font-bold text-[#241B16] truncate max-w-[300px]">
                    {selectedImage.productName}
                  </h3>
                  <p className="font-mono text-[9px] text-[#7A675B]">
                    Model: {selectedImage.modelCode || 'AF-MODEL'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 text-[#7A675B] hover:text-[#241B16]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-black flex items-center justify-center max-h-[340px] overflow-hidden">
                <img
                  src={selectedImage.fullUrl}
                  alt={selectedImage.name}
                  className="max-h-[320px] w-auto object-contain rounded-lg"
                />
              </div>

              <div className="p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(selectedImage.fullUrl)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-[#DDD1C0] bg-white hover:bg-[#FAF7F2] text-xs font-serif flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-green-700" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Image URL'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const prodId = selectedImage.productId;
                      setSelectedImage(null);
                      if (prodId) {
                        navigate(`/admin/products/${encodeURIComponent(prodId)}/edit`);
                      } else {
                        navigate('/admin/products/new');
                      }
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#493326] text-[#F7F3EC] hover:bg-[#38251C] text-xs font-serif flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ExternalLink size={14} />
                    <span>{selectedImage.productId ? 'Edit Model' : 'Use in Model'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
