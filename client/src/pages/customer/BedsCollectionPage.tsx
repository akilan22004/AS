import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bed,
  Trees,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  CheckCircle,
  Headphones,
  Bookmark,
  Check,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useShortlist } from '../../context/ShortlistContext';
import { api } from '../../services/api';
import { Product } from '../../types';

export const BedsCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isInShortlist, toggleShortlist, openEnquiryModal } = useShortlist();
  const [activeTab, setActiveTab] = useState('All Beds');

  const { data, isLoading } = useQuery({
    queryKey: ['products-beds'],
    queryFn: () => api.getProducts({ category: 'beds' }),
  });

  const filterTabs = ['All Beds', 'King Size', 'Queen Size', 'Single Bed', 'Storage Bed'];

  const allBeds: Product[] = data?.items || [];

  const beds = allBeds.filter((bed) => {
    if (activeTab === 'All Beds') return true;
    const text = `${bed.name} ${bed.description} ${bed.specifications || ''} ${bed.modelCode}`.toLowerCase();
    if (activeTab === 'King Size') return text.includes('king') || bed.modelCode.includes('BD001') || bed.modelCode.includes('BD002');
    if (activeTab === 'Queen Size') return text.includes('queen') || bed.modelCode.includes('BD003');
    if (activeTab === 'Storage Bed') return text.includes('storage') || bed.modelCode.includes('BD004');
    if (activeTab === 'Single Bed') return text.includes('single') || text.includes('canopy') || bed.modelCode.includes('BD005');
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative bg-gradient-to-b from-[#F2ECE1] to-[#FAF8F5] border-b border-[#EAE2D5] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              {/* Breadcrumb */}
              <div className="text-xs text-[#7A675B] flex items-center gap-1.5 mb-3 font-sans">
                <Link to="/" className="hover:text-[#241B16] transition-colors">Home</Link>
                <span>›</span>
                <Link to="/products" className="hover:text-[#241B16] transition-colors">Catalog</Link>
                <span>›</span>
                <span className="text-[#241B16] font-semibold">Beds Collection</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#241B16] leading-tight">
                Solid Wood Beds Collection
              </h1>
              <div className="w-16 h-1 bg-[#B69764] my-4 rounded-full"></div>
              <p className="text-sm sm:text-base text-[#695446] leading-relaxed">
                Handcrafted from seasoned Teak and Rosewood. Engineered with mortise-and-tenon joinery for ergonomic comfort, silent stability, and lasting generations.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openEnquiryModal()}
                  className="bg-[#241B16] hover:bg-[#3D2C22] text-[#F7F3EC] px-6 py-3 rounded-full text-xs sm:text-sm font-serif font-semibold transition-all shadow-md flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>Custom Size Consultation</span>
                </button>
                <a
                  href="#collection-grid"
                  className="border border-[#241B16] text-[#241B16] hover:bg-[#241B16] hover:text-white px-5 py-3 rounded-full text-xs sm:text-sm font-serif font-semibold transition-all"
                >
                  Browse Models ({beds.length})
                </a>
              </div>
            </div>

            {/* Right Hero Bed Image Crop */}
            <div className="w-full md:w-1/2 aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-[#DDD1C0]">
              <img
                src="/assets/beds-hero.jpg"
                alt="Solid Wood Bed Masterpiece"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* 4 Feature Badges Bar */}
        <section className="bg-white border-b border-[#EAE2D5] py-6 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]/80">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-2 shadow-xs">
                  <Bed size={20} />
                </div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">Ergonomic Posture</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Heavy slat support system</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]/80">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-2 shadow-xs">
                  <Trees size={20} />
                </div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">Solid Seasoned Wood</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Zero MDF, zero particle board</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]/80">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-2 shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">Tenon Joinery</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Creak-free lifetime guarantee</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]/80">
                <div className="w-10 h-10 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-2 shadow-xs">
                  <Sparkles size={20} />
                </div>
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">Artisan Finish</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Natural walnut & teak polish</span>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Our Bed Collection Section */}
        <section id="collection-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
              Sleep in Authentic Luxury
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#241B16]">
              Explore Our Bed Models
            </h2>
            <div className="w-12 h-[2px] bg-[#B69764] mx-auto my-3"></div>
            <p className="text-xs sm:text-sm text-[#695446]">
              Available in King, Queen, hydraulic storage, and custom bespoke dimensions.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
            {filterTabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-serif whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#241B16] text-[#F7F3EC] border-[#241B16] shadow-sm'
                      : 'bg-white text-[#493326] border-[#DDD1C0] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Responsive Product Cards Grid (1 col mobile, 2 sm, 3 md, 4 lg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoading ? (
              <div className="col-span-full py-16 text-center text-sm text-[#8A7569] font-serif">
                Loading handcrafted beds...
              </div>
            ) : beds.length === 0 ? (
              <div className="col-span-full py-16 text-center text-sm text-[#8A7569] font-serif bg-white rounded-3xl border border-[#DDD1C0] p-8">
                No bed models currently listed under &quot;{activeTab}&quot;.
              </div>
            ) : (
              beds.map((bed) => {
                const shortlisted = isInShortlist(bed.id);
                const displayImg = bed.images?.[0]?.url || bed.images?.[0]?.filePath;

                return (
                  <div
                    key={bed.id}
                    className="group bg-white border border-[#EAE2D5] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C8A77D] transition-all flex flex-col justify-between"
                  >
                    {/* Photo with Bookmark button */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2]">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={bed.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={`${bed.name} photo unavailable`}
                          className="w-full h-full bg-[#EAE2D5] flex items-center justify-center text-[#8A7569]"
                        >
                          <Bed size={32} />
                        </div>
                      )}

                      {/* Model Code Badge */}
                      <span className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                        {bed.modelCode}
                      </span>

                      {/* Bookmark / Shortlist button */}
                      <button
                        onClick={() => toggleShortlist(bed)}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
                          shortlisted
                            ? 'bg-[#B69764] text-[#241B16]'
                            : 'bg-black/40 hover:bg-black/70 text-white'
                        }`}
                        title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      >
                        {shortlisted ? <Check size={16} strokeWidth={2.5} /> : <Bookmark size={15} />}
                      </button>
                    </div>

                    {/* Details */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#241B16] leading-tight line-clamp-1 group-hover:text-[#B69764] transition-colors">
                          {bed.name}
                        </h3>
                        <p className="text-xs text-[#7A675B] font-mono mt-1">
                          {bed.material || 'Solid Teak Wood'}
                        </p>
                        <p className="text-xs text-[#695446] leading-relaxed mt-2 line-clamp-2">
                          {bed.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/products/${bed.slug}`)}
                          className="flex-1 bg-[#241B16] hover:bg-[#3D2C22] text-[#F7F3EC] py-2 px-3 rounded-full font-serif text-xs font-semibold transition-colors text-center"
                        >
                          View Specifications
                        </button>
                        <button
                          onClick={() => openEnquiryModal(bed)}
                          className="w-9 h-9 rounded-full bg-[#B69764] hover:bg-[#9A7D4E] text-[#241B16] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
                          title="Enquire on WhatsApp"
                          aria-label="Enquire on WhatsApp"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Why Our Beds Stand Out? (Dark Wood Luxury Banner) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <div className="bg-[#241B16] text-[#F7F3EC] rounded-3xl p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="flex-1 z-10 max-w-xl">
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase">
                Artisan Engineering
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight mt-1">
                Why Annamalai Beds Stand Apart
              </h3>
              <div className="w-12 h-[2px] bg-[#B69764] my-4"></div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#C8A77D]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="text-[#A3E635] flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Plywood / Particle Board:</strong> We build 100% solid timber structures designed to withstand decades of use without warping.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="text-[#A3E635] flex-shrink-0 mt-0.5" />
                  <span><strong>Acoustically Silent:</strong> Precision interlocking tenons eliminate squeaks and creaks permanently.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={18} className="text-[#A3E635] flex-shrink-0 mt-0.5" />
                  <span><strong>Custom Headboards & Storage:</strong> Hydraulic lifts, under-bed pull-outs, and custom carved headboard crests.</span>
                </li>
              </ul>
              <div className="mt-6">
                <button
                  onClick={() => openEnquiryModal()}
                  className="bg-[#B69764] hover:bg-[#9A7D4E] text-[#241B16] px-6 py-3 rounded-full text-xs sm:text-sm font-serif font-bold transition-all shadow-md inline-flex items-center gap-2"
                >
                  <span>Consult our Master Craftsman</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden border border-[#523B2F] flex-shrink-0 shadow-xl">
              <img
                src="/assets/beds-carved-post.jpg"
                alt="Carved Bed Post Detail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Custom Bed Designs Split Block */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white border border-[#EAE2D5] rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-xs">
            <div className="w-full md:w-1/2 aspect-[16/9] rounded-2xl overflow-hidden border border-[#DDD1C0] shadow-sm flex-shrink-0">
              <img
                src="/assets/beds-custom-design.jpg"
                alt="Custom Bed Design"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                Bespoke Bedroom Architecture
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B16] leading-tight mt-1">
                Custom Bed Dimensions & Custom Wood Finishes
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#695446] leading-relaxed">
                Whether you need a California King to fit a master bedroom, an antique poster canopy bed, or hidden hydraulic box storage, our workshop drafts and crafts it precisely to your architectural drawings.
              </p>
              <button
                onClick={() => openEnquiryModal()}
                className="mt-6 inline-flex items-center gap-2 bg-[#241B16] hover:bg-[#3D2C22] text-[#F7F3EC] px-6 py-3 rounded-full text-xs sm:text-sm font-serif font-semibold transition-all shadow-sm"
              >
                <span>Request Custom Blueprint & Pricing</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* 4 Trust Badges */}
        <section className="bg-white border-t border-[#EAE2D5] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Truck size={24} className="text-[#8A7569] mb-2" />
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">Direct Delivery</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Safely wrapped and delivered</span>
              </div>
              <div className="flex flex-col items-center">
                <Wrench size={24} className="text-[#8A7569] mb-2" />
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">On-Site Assembly</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Assembled by our carpenters</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck size={24} className="text-[#8A7569] mb-2" />
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">10-Year Guarantee</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Timber authenticity certificate</span>
              </div>
              <div className="flex flex-col items-center">
                <Headphones size={24} className="text-[#8A7569] mb-2" />
                <span className="text-xs sm:text-sm font-serif font-bold text-[#241B16]">Artisan Support</span>
                <span className="text-[11px] text-[#7A675B] mt-0.5">Direct WhatsApp consultation</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
