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
      <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8 text-xs font-serif text-[#8A7569]">
          Loading handcrafted furniture details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="font-serif text-lg font-bold text-[#241B16]">Model Not Found</h2>
          <p className="text-xs text-[#8A7569] mt-2 mb-4">The requested furniture model could not be found.</p>
          <Link
            to="/products"
            className="bg-[#493326] text-[#F7F3EC] px-4 py-2 rounded-full text-xs font-serif"
          >
            Browse Collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const shortlisted = isInShortlist(product.id);

  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="px-4 py-2 text-[10px] text-[#7A675B] flex items-center gap-1.5 border-b border-[#E8DFC8]">
          <Link to="/" className="hover:text-[#241B16] flex items-center gap-1">
            <span>⌂</span> Home
          </Link>
          <span>›</span>
          <Link
            to={`/products?category=${product.category?.slug || 'sofas'}`}
            className="hover:text-[#241B16]"
          >
            {product.category?.name || 'Sofas'}
          </Link>
          <span>›</span>
          <span className="text-[#241B16] font-medium truncate max-w-[140px]">
            {product.name}
          </span>
        </div>

        {/* Product Gallery Section */}
        <section className="px-3 pt-3 pb-2">
          {/* Main Photo Viewer */}
          <div
            className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#E2D8C9] border border-[#D9CDBF] shadow-md"
            aria-label={`${product.name} photo gallery`}
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
              <div className="w-full h-full flex items-center justify-center px-6 text-center text-xs text-[#695446]">
                Product photos have not been added yet.
              </div>
            )}

            {/* Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors btn-press"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors btn-press"
                  aria-label="Next photo"
                >
                  <ChevronRight size={15} />
                </button>
              </>
            )}

            {/* Fullscreen Button */}
            {gallery.length > 0 && <button
              onClick={() => setFullscreen(true)}
              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              aria-label="Fullscreen view"
            >
              <Maximize2 size={13} />
            </button>}

            {/* Image counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-[9px] px-2 py-0.5 rounded-full font-mono">
                {activeImageIdx + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {galleryThumbnails.map((img, idx) => {
              const isActive = idx === activeImageIdx;
              return (
                <button
                  key={idx}
                  onClick={() => showImage(idx)}
                  type="button"
                  aria-label={`View photo ${idx + 1} of ${galleryImages.length}`}
                  aria-pressed={isActive}
                  className={`aspect-[74/45] w-[calc((100%-1.5rem)/4)] flex-none rounded-xl overflow-hidden border-2 transition-all ${
                    isActive
                      ? 'border-[#B69764] shadow-md scale-[1.02]'
                      : 'border-transparent opacity-65 hover:opacity-100 hover:border-[#C8A77D]'
                  }`}
                >
                  <img
                    src={img}
                    alt={gallery[idx]?.altText || `View ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Info & WhatsApp CTA */}
        <section className="px-4 py-3">
          <h1 className="font-serif text-[22px] font-bold text-[#241B16] leading-tight">
            {product.name}
          </h1>

          {/* Model & Category Tags */}
          <div className="flex items-center gap-3 text-[10px] text-[#7A675B] my-2">
            <span className="flex items-center gap-1 font-mono font-medium">
              <Tag size={12} className="text-[#B69764]" />
              Model: <strong className="text-[#241B16]">{product.modelCode}</strong>
            </span>
            <span className="text-[#C8A77D]">|</span>
            <span className="flex items-center gap-1 font-sans">
              <Armchair size={12} className="text-[#B69764]" />
              Category: <strong className="text-[#241B16]">{product.category?.name || 'Sofas'}</strong>
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-[#59463B] leading-relaxed font-sans mb-4">
            {product.description ||
              'A timeless wooden sofa that blends traditional craftsmanship with modern comfort. Built from quality solid wood, it adds warmth, elegance and lasting style to your living space.'}
          </p>

          {/* Actions: Large WhatsApp CTA + Bookmark */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEnquiryModal(product)}
              className="flex-1 bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2.5 px-4 rounded-full font-serif text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {/* WhatsApp Icon */}
              <svg className="w-4 h-4 fill-current text-[#A3E635]" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.884 2.791.884 3.179 0 5.767-2.587 5.768-5.766.002-3.18-2.584-5.77-5.768-5.77zm3.365 8.163c-.14.394-.716.732-1.023.778-.291.043-.668.077-2.18-.553-1.849-.769-3.045-2.656-3.138-2.78-.093-.124-.754-1.003-.754-1.913 0-.911.478-1.358.648-1.542.17-.184.372-.23.496-.23.124 0 .248.002.356.008.115.006.269-.044.421.323.155.373.53 1.294.577 1.388.047.094.078.204.016.328-.063.125-.094.204-.187.313-.094.11-.198.245-.283.33-.094.094-.192.197-.082.386.11.189.49 1.808 1.401 2.228.468.216.862.308 1.157.34.295.031.544-.016.736-.233.193-.217.828-.962 1.05-1.29.222-.328.444-.275.748-.162.304.113 1.93.91 2.262 1.076.332.166.554.249.636.388.083.139.083.805-.057 1.199z"/>
              </svg>
              <span>Enquire on WhatsApp</span>
              <span className="text-sm">→</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => toggleShortlist(product)}
              className={`p-2.5 rounded-full border transition-all ${
                shortlisted
                  ? 'bg-[#B69764] text-[#241B16] border-[#B69764]'
                  : 'bg-[#F2ECE1] text-[#493326] border-[#D9CDBF] hover:bg-[#EAE2D5]'
              }`}
              title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
            >
              {shortlisted ? <Check size={18} strokeWidth={2.5} /> : <Bookmark size={18} />}
            </button>
          </div>
        </section>

        {/* Product Highlights Badges */}
        <section className="px-4 py-3 bg-[#F4EEE3] my-2">
          <h2 className="font-serif text-[15px] font-bold text-[#241B16] text-center mb-2.5">
            Product Highlights
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#DFD6C9] flex flex-col items-center text-center">
              <Trees size={18} className="text-[#B69764] mb-1" />
              <span className="text-[8.5px] font-medium text-[#241B16] leading-tight">Solid Wood Build</span>
            </div>
            <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#DFD6C9] flex flex-col items-center text-center">
              <Hammer size={18} className="text-[#B69764] mb-1" />
              <span className="text-[8.5px] font-medium text-[#241B16] leading-tight">Handcrafted Detailing</span>
            </div>
            <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#DFD6C9] flex flex-col items-center text-center">
              <ShieldCheck size={18} className="text-[#B69764] mb-1" />
              <span className="text-[8.5px] font-medium text-[#241B16] leading-tight">Durable & Long Lasting</span>
            </div>
            <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#DFD6C9] flex flex-col items-center text-center">
              <Armchair size={18} className="text-[#B69764] mb-1" />
              <span className="text-[8.5px] font-medium text-[#241B16] leading-tight">Comfortable Design</span>
            </div>
          </div>
        </section>

        <section className="px-4 py-3" aria-label="Product dimensions">
          <h2 className="font-serif text-[15px] font-bold text-[#241B16] text-center mb-2.5">
            Product Dimensions
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Length', value: product.length },
              { label: 'Width', value: product.width },
              { label: 'Height', value: product.height },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[#DFD6C9] bg-[#FAF7F2] p-2 text-center">
                <span className="block text-[9px] text-[#7A675B]">{label}</span>
                <span className="mt-1 block text-[10px] font-medium text-[#241B16]">
                  {value != null
                    ? `${value}${product.dimensionUnit ? ` ${product.dimensionUnit}` : ' (unit not specified)'}`
                    : 'Needs to be provided'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* The Craft in Every Detail Section */}
        <section className="px-4 py-4 flex items-center gap-3">
          <div className="w-[45%] aspect-[175/140] rounded-xl overflow-hidden border border-[#D9CDBF] shadow-sm flex-shrink-0">
            <img src="/assets/product-detail-artisan.jpg" alt="Artisan Craft" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-[16px] font-bold text-[#241B16] leading-tight">
              The Craft<br />in Every Detail
            </h3>
            <div className="w-8 h-[1px] bg-[#B69764] my-1.5"></div>
            <p className="text-[9.5px] text-[#695446] leading-relaxed">
              From the finest wood selection to intricate hand carving, each piece is crafted with precision and care.
            </p>
          </div>
        </section>

        {/* Material & Craftsmanship Section */}
        <section className="px-4 py-3 bg-[#FAF7F2] border-t border-b border-[#E8DFC8]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#B69764]"></span>
            <h3 className="font-serif text-[14px] font-bold text-[#241B16]">
              Material & Craftsmanship
            </h3>
            <span className="w-6 h-[1px] bg-[#B69764]"></span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[35%] aspect-[122/75] rounded-xl overflow-hidden border border-[#D9CDBF] shadow-sm flex-shrink-0">
              <img src="/assets/product-detail-solid-wood.jpg" alt="Natural wood grain and rings" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="font-serif text-[11px] font-bold text-[#241B16]">
                  🌳 Premium Solid Wood
                </h4>
                <p className="text-[8.5px] text-[#695446] leading-tight">
                  Carefully selected, strong and durable natural wood.
                </p>
              </div>
              <div>
                <h4 className="font-serif text-[11px] font-bold text-[#241B16]">
                  🪑 Handcrafted Excellence
                </h4>
                <p className="text-[8.5px] text-[#695446] leading-tight">
                  Skilled craftsmanship with detailed finishing and smooth texture.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* You May Also Like Section */}
        <section className="px-3 py-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#B69764]"></span>
            <h3 className="font-serif text-[14px] font-bold text-[#241B16]">
              You May Also Like
            </h3>
            <span className="w-6 h-[1px] bg-[#B69764]"></span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {related.slice(0, 3).map((r) => ({
                  name: r.name,
                  code: r.modelCode,
                  img: r.images?.[0]?.url || r.images?.[0]?.filePath || null,
                  slug: r.slug,
                })).map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FDFBF7] border border-[#DDD1C0] rounded-xl p-1.5 flex flex-col justify-between shadow-sm"
              >
                <div className="aspect-[103/56] rounded-lg overflow-hidden bg-[#E2D8C9] mb-1.5">
                  {item.img
                    ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[8px] text-[#7A675B]">Image unavailable</div>}
                </div>
                <div>
                  <h4 className="font-serif text-[10px] font-bold text-[#241B16] truncate">{item.name}</h4>
                  <span className="text-[7.5px] font-mono text-[#8A7569] block">{item.code}</span>
                </div>
                <button
                  onClick={() => navigate(`/products/${item.slug}`)}
                  className="mt-1.5 w-full bg-[#493326] text-[#F7F3EC] py-0.5 rounded-full text-[7.5px] font-serif hover:bg-[#38251C]"
                >
                  View Details →
                </button>
              </div>
            ))}
            {related.length === 0 && (
              <p className="col-span-3 py-3 text-center text-[10px] text-[#7A675B]">
                More models in this collection will be added soon.
              </p>
            )}
          </div>
        </section>

        {/* Explore Collection Teaser Banner */}
        <section className="mx-3 mb-2 rounded-2xl overflow-hidden relative aspect-[341/78] bg-[#38251C] text-[#F7F3EC] flex items-center justify-between px-4">
          <div className="relative z-10">
            <h3 className="font-serif text-[15px] font-bold leading-tight">
              Explore Our<br />{product.category?.name || 'Furniture'} Collection
            </h3>
            <Link
              to={`/products?category=${product.category?.slug || 'sofas'}`}
              className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-serif border border-[#C8A77D]/60 text-[#C8A77D] px-2.5 py-0.5 rounded-full hover:bg-[#C8A77D] hover:text-[#241B16] transition-colors"
            >
              <span>View More {product.category?.name || 'Models'}</span>
              <span>→</span>
            </Link>
          </div>
          <div className="w-[45%] h-full overflow-hidden flex-shrink-0 -mr-4">
            <img
              src="/assets/p-detail-sofa-main.jpg"
              alt="Furniture Craft Detail"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* WhatsApp Requirement Banner */}
        <WhatsAppBanner />
      </main>

      {/* Fullscreen Lightbox Modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={activeImage}
            alt={product.name}
            className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
          />
          <p className="text-white/70 text-xs mt-3 font-serif">Tap anywhere to close</p>
        </div>
      )}

      <Footer />
    </div>
  );
};
