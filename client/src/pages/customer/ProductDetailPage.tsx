import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Tag,
  Armchair,
  Trees,
  Hammer,
  ShieldCheck,
  Check,
  Bookmark,
  Share2,
  Ruler,
  Phone,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import { useShortlist } from '../../context/ShortlistContext';
import { api } from '../../services/api';
import { Product } from '../../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isInShortlist, toggleShortlist, openEnquiryModal } = useShortlist();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const galleryTrackRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.getProductBySlug(slug || ''),
    enabled: !!slug,
  });

  const product: Product | undefined = data?.product;
  const related: Product[] = data?.related || [];

  const gallery = product?.images
    ? [...product.images].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  const galleryImages = gallery.map((img) => img.url || img.filePath);
  const galleryThumbnails = gallery.map((img) => img.thumbUrl || img.url || img.filePath);

  const activeImage = galleryImages[activeImageIdx] || galleryImages[0];

  useEffect(() => {
    setActiveImageIdx(0);
    galleryTrackRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [slug, product?.updatedAt]);

  const showImage = (index: number) => {
    if (!galleryImages.length) return;
    const nextIndex = (index + galleryImages.length) % galleryImages.length;
    const track = galleryTrackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * nextIndex, behavior: 'smooth' });
    setActiveImageIdx(nextIndex);
  };

  const handlePrevImage = () => showImage(activeImageIdx - 1);
  const handleNextImage = () => showImage(activeImageIdx + 1);

  const handleGalleryScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveImageIdx(Math.min(index, galleryImages.length - 1));
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12 text-sm font-serif text-[#8A7569] animate-pulse">
          Loading handcrafted furniture details from our workshop…
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-16">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-[#8A7569] mb-4">
            <Armchair size={28} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#241B16]">Model Not Found</h2>
          <p className="text-xs text-[#8A7569] mt-2 mb-6">
            The requested furniture model could not be found or has been updated in our catalog.
          </p>
          <Link
            to="/products"
            className="bg-[#493326] text-[#F7F3EC] px-6 py-2.5 rounded-full text-xs font-serif font-semibold hover:bg-[#38251C]"
          >
            Browse Full Collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const shortlisted = isInShortlist(product.id);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-[#EAE2D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-[#7A675B] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:text-[#241B16] flex items-center gap-1">
              <span>Home</span>
            </Link>
            <span>›</span>
            <Link
              to={`/products?category=${product.category?.slug || 'sofas'}`}
              className="hover:text-[#241B16] whitespace-nowrap"
            >
              {product.category?.name || 'Furniture'}
            </Link>
            <span>›</span>
            <span className="text-[#241B16] font-semibold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </div>
        </div>

        {/* Main Product Presentation (2 Columns on Desktop) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            
            {/* Left Column: Photo Gallery (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              {/* Main Photo Viewer */}
              <div
                className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F2ECE1] border border-[#EAE2D5] shadow-sm"
                aria-label={`${product.name} gallery`}
              >
                {gallery.length ? (
                  <div
                    ref={galleryTrackRef}
                    onScroll={handleGalleryScroll}
                    className="absolute inset-0 flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth touch-pan-x no-scrollbar"
                    role="region"
                    aria-label="Product photos"
                  >
                    {gallery.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => {
                          setActiveImageIdx(index);
                          setFullscreen(true);
                        }}
                        aria-label={`Open photo ${index + 1} of ${gallery.length}`}
                        className="relative h-full w-full flex-none snap-center cursor-zoom-in"
                      >
                        <img
                          src={image.url || image.filePath}
                          alt={image.altText || product.name}
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center px-6 text-center text-xs text-[#695446] font-serif">
                    Product photos have not been added yet.
                  </div>
                )}

                {/* Left/Right Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Fullscreen Button */}
                {gallery.length > 0 && (
                  <button
                    onClick={() => setFullscreen(true)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                    aria-label="Fullscreen view"
                  >
                    <Maximize2 size={15} />
                  </button>
                )}

                {/* Image counter pill */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full font-mono backdrop-blur-sm">
                    {activeImageIdx + 1} / {galleryImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {galleryThumbnails.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
                  {galleryThumbnails.map((img, idx) => {
                    const isActive = idx === activeImageIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => showImage(idx)}
                        type="button"
                        aria-label={`View photo ${idx + 1}`}
                        className={`aspect-[4/3] w-16 sm:w-24 flex-none rounded-xl overflow-hidden border-2 transition-all ${
                          isActive
                            ? 'border-[#B69764] shadow-md scale-102'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#C8A77D]'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Specifications, Materials & Enquiry (5 cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Model Pill */}
                <div className="flex items-center gap-2.5">
                  <span className="bg-[#EFE9DF] text-[#493326] px-3 py-1 rounded-full text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider">
                    {product.category?.name || 'Solid Wood'}
                  </span>
                  <span className="text-xs font-mono text-[#8A7569] bg-white px-2.5 py-1 rounded-full border border-[#DDD1C0]">
                    Code: {product.modelCode}
                  </span>
                </div>

                {/* Product Title */}
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241B16] leading-tight">
                  {product.name}
                </h1>

                {/* Timber Specification */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8A7569]">
                  <Trees size={16} className="text-[#B69764]" />
                  <span>Crafted in: <strong className="text-[#241B16]">{product.material || 'Solid Teak Wood'}</strong></span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#59463B] leading-relaxed font-sans pt-1">
                  {product.description ||
                    'A timeless solid wood creation blending traditional South Indian craftsmanship with contemporary ergonomics. Built from carefully seasoned whole timber.'}
                </p>

                {/* Dimensions Grid */}
                <div className="bg-white p-4 rounded-2xl border border-[#EAE2D5] shadow-sm">
                  <div className="flex items-center gap-2 mb-2.5 text-xs font-serif font-bold text-[#241B16]">
                    <Ruler size={14} className="text-[#B69764]" />
                    <span>Dimensions ({product.dimensionUnit || 'cm'})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0EAE1]">
                      <span className="text-[10px] text-[#8A7569] block">Length</span>
                      <span className="text-xs sm:text-sm font-bold text-[#241B16] mt-0.5 block">
                        {product.length != null ? `${product.length} ${product.dimensionUnit || 'cm'}` : 'Custom'}
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0EAE1]">
                      <span className="text-[10px] text-[#8A7569] block">Width / Depth</span>
                      <span className="text-xs sm:text-sm font-bold text-[#241B16] mt-0.5 block">
                        {product.width != null ? `${product.width} ${product.dimensionUnit || 'cm'}` : 'Custom'}
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0EAE1]">
                      <span className="text-[10px] text-[#8A7569] block">Height</span>
                      <span className="text-xs sm:text-sm font-bold text-[#241B16] mt-0.5 block">
                        {product.height != null ? `${product.height} ${product.dimensionUnit || 'cm'}` : 'Custom'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Specifications if available */}
                {product.specifications && (
                  <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE2D5] text-xs text-[#695446]">
                    <strong className="font-serif text-[#241B16] block mb-1">Artisan Notes:</strong>
                    <p className="leading-relaxed">{product.specifications}</p>
                  </div>
                )}
              </div>

              {/* Call to Actions: WhatsApp Enquiry + Shortlist Bookmark */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEnquiryModal(product)}
                    className="flex-1 bg-[#241B16] hover:bg-[#38251C] text-[#F7F3EC] py-3.5 px-6 rounded-full font-serif text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl btn-press"
                  >
                    <Phone size={16} className="text-[#25D366]" />
                    <span>Enquire on WhatsApp</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    onClick={() => toggleShortlist(product)}
                    className={`p-3.5 rounded-full border transition-all ${
                      shortlisted
                        ? 'bg-[#B69764] text-[#241B16] border-[#B69764] shadow-md'
                        : 'bg-white text-[#493326] border-[#DDD1C0] hover:bg-[#F2ECE1]'
                    }`}
                    title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    aria-label="Bookmark"
                  >
                    {shortlisted ? <Check size={20} strokeWidth={2.5} /> : <Bookmark size={20} />}
                  </button>
                </div>

                <p className="text-[11px] text-[#8A7569] text-center font-sans">
                  Direct pricing & customization options provided upon enquiry • Workshop in Tamil Nadu
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Product Highlights Section */}
        <section className="bg-white border-t border-b border-[#EAE2D5] py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241B16] text-center mb-8">
              Why Choose Annamalai Furniture
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE2D5] text-center flex flex-col items-center">
                <Trees size={26} className="text-[#B69764] mb-2" />
                <h4 className="font-serif text-sm font-bold text-[#241B16]">100% Solid Wood</h4>
                <p className="text-xs text-[#7A675B] mt-1">Whole seasoned Teak, Rosewood & Sheesham timber</p>
              </div>
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE2D5] text-center flex flex-col items-center">
                <Hammer size={26} className="text-[#B69764] mb-2" />
                <h4 className="font-serif text-sm font-bold text-[#241B16]">Handcrafted Detailing</h4>
                <p className="text-xs text-[#7A675B] mt-1">Intricate hand carvings and interlocking joinery</p>
              </div>
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE2D5] text-center flex flex-col items-center">
                <ShieldCheck size={26} className="text-[#B69764] mb-2" />
                <h4 className="font-serif text-sm font-bold text-[#241B16]">Lifetime Durability</h4>
                <p className="text-xs text-[#7A675B] mt-1">Organic weather-resistant oil and natural polishes</p>
              </div>
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE2D5] text-center flex flex-col items-center">
                <Armchair size={26} className="text-[#B69764] mb-2" />
                <h4 className="font-serif text-sm font-bold text-[#241B16]">Custom Modifications</h4>
                <p className="text-xs text-[#7A675B] mt-1">Tailored dimensions and upholstery options available</p>
              </div>
            </div>
          </div>
        </section>

        {/* You May Also Like Section (Responsive 4-column) */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="text-center mb-8 sm:mb-12">
              <span className="font-serif tracking-[0.2em] text-xs text-[#8A7569] uppercase font-semibold block mb-1">
                More from {product.category?.name || 'this collection'}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B16]">
                You May Also Like
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.slice(0, 4).map((r) => {
                const img = r.images?.[0]?.url || r.images?.[0]?.filePath;
                return (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/products/${r.slug}`)}
                    className="cursor-pointer bg-white border border-[#EAE2D5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#C8A77D] transition-all p-3 flex flex-col justify-between group"
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F2ECE1] mb-2.5">
                      {img ? (
                        <img src={img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#8A7569]">
                          Image coming soon
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#8A7569] block">{r.modelCode}</span>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#241B16] truncate">{r.name}</h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${r.slug}`);
                      }}
                      className="mt-2.5 w-full bg-[#FAF8F5] hover:bg-[#493326] hover:text-white text-[#493326] py-1.5 rounded-full text-xs font-serif transition-colors text-center font-medium border border-[#EAE2D5]"
                    >
                      View Details →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* WhatsApp Banner */}
        <WhatsAppBanner />
      </main>

      {/* Fullscreen Lightbox Modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={activeImage}
            alt={product.name}
            className="max-h-[85vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl"
          />
          <p className="text-white/75 text-xs sm:text-sm mt-4 font-serif">Tap anywhere to close lightbox</p>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#241B16] border-t border-[#3D2C22] p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-serif font-bold text-[#F7F3EC] truncate">{product.name}</p>
          <p className="text-[10px] font-mono text-[#C8A77D]">{product.modelCode}</p>
        </div>
        <button
          onClick={() => openEnquiryModal(product)}
          className="bg-[#B69764] text-[#1C1511] font-serif font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 flex-shrink-0 shadow-md"
        >
          <Phone size={13} />
          <span>Enquire</span>
        </button>
      </div>

      <Footer />
    </div>
  );
};
