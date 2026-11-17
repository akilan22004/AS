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
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative px-5 pt-5 pb-4 bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC] overflow-hidden">
          {/* Breadcrumb */}
          <div className="text-[9.5px] text-[#7A675B] flex items-center gap-1 mb-2 font-sans">
            <Link to="/" className="hover:text-[#241B16]">Home</Link>
            <span>›</span>
            <Link to="/collections" className="hover:text-[#241B16]">Collections</Link>
            <span>›</span>
            <span className="text-[#241B16] font-medium">Beds</span>
          </div>

          <div className="max-w-[210px] relative z-10">
            <h1 className="font-serif text-[24px] text-[#241B16] font-bold leading-tight">
              Beds<br />Collection
            </h1>
            <div className="w-10 h-[1.5px] bg-[#B69764] my-2"></div>
            <p className="text-[10px] text-[#695446] leading-relaxed">
              Comfort, style and lasting craftsmanship for your perfect sleep.
            </p>
          </div>

          {/* Right Hero Bed Image Crop */}
          <div className="absolute right-0 top-0 bottom-0 w-[155px] overflow-hidden">
            <img
              src="/assets/beds-hero.jpg"
              alt="Beds Collection Hero"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </section>

        {/* 4 Feature Badges (Sculpted bar) */}
        <section className="px-3 py-3 bg-[#FAF7F2] border-t border-b border-[#E8DFC8]">
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Bed size={14} />
              </div>
              <span className="text-[8px] font-semibold text-[#241B16] leading-tight">Ergonomic Comfort</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Trees size={14} />
              </div>
              <span className="text-[8px] font-semibold text-[#241B16] leading-tight">Premium Wood</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <ShieldCheck size={14} />
              </div>
              <span className="text-[8px] font-semibold text-[#241B16] leading-tight">Long Durability</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Sparkles size={14} />
              </div>
              <span className="text-[8px] font-semibold text-[#241B16] leading-tight">Elegant Design</span>
            </div>
          </div>
        </section>

        {/* Explore Our Bed Collection */}
        <section className="px-3 pt-4 pb-2">
          {/* Heading with flourish */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-5 h-[1px] bg-[#B69764]"></span>
            <h2 className="font-serif text-[17px] font-bold text-[#241B16] tracking-tight">
              Explore Our Bed Collection
            </h2>
            <span className="w-5 h-[1px] bg-[#B69764]"></span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            {filterTabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full text-[10px] font-serif whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#493326] text-[#F7F3EC] border-[#493326] shadow-sm'
                      : 'bg-[#F2ECE1] text-[#493326] border-[#DDD1C0] hover:bg-[#EAE2D5]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* 2-Column Bed Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            {isLoading ? (
              <div className="col-span-2 py-8 text-center text-xs text-[#8A7569] font-serif">
                Loading handcrafted beds...
              </div>
            ) : beds.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-[#8A7569] font-serif">
                No bed models currently listed.
              </div>
            ) : (
              beds.map((bed) => {
                const shortlisted = isInShortlist(bed.id);
                const displayImg = bed.images?.[0]?.url || bed.images?.[0]?.filePath;

                return (
                  <div
                    key={bed.id}
                    className="bg-[#FDFBF7] border border-[#DDD1C0] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    {/* Photo with Bookmark button */}
                    <div className="relative aspect-[156/96] w-full overflow-hidden bg-[#E2D8C9]">
                      {displayImg ? (
                        <img src={displayImg} alt={bed.name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          role="img"
                          aria-label={`${bed.name} photo unavailable`}
                          className="w-full h-full"
                        />
                      )}
                      <button
                        onClick={() => toggleShortlist(bed)}
                        className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                          shortlisted
                            ? 'bg-[#B69764] text-[#241B16] shadow-md'
                            : 'bg-black/35 hover:bg-black/60 text-white'
                        }`}
                        title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      >
                        {shortlisted ? <Check size={13} strokeWidth={2.5} /> : <Bookmark size={13} />}
                      </button>
                    </div>

                    {/* Details */}
                    <div className="p-2.5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-serif text-[12px] font-bold text-[#241B16] leading-tight line-clamp-1">
                          {bed.name}
                        </h3>
                        <span className="text-[8.5px] font-mono text-[#8A7569] block mt-0.5">
                          Model: {bed.modelCode}
                        </span>
                        <p className="text-[8px] text-[#695446] leading-tight mt-1 line-clamp-2">
                          {bed.description}
                        </p>
                      </div>

                      {/* Actions: View Details + Enquire */}
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/products/${bed.slug}`)}
                          className="flex-1 bg-[#493326] text-[#F7F3EC] py-1 px-2 rounded-full font-serif text-[8.5px] hover:bg-[#38251C] transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openEnquiryModal(bed)}
                          className="w-6 h-6 rounded-full bg-[#B69764] hover:bg-[#9A7D4E] text-[#241B16] flex items-center justify-center flex-shrink-0"
                          title="Enquire on WhatsApp"
                        >
                          <MessageSquare size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Why Our Beds Stand Out? (Dark Wood Banner) */}
        <section className="bg-[#38261D] text-[#F7F3EC] my-3 py-4 px-4 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex-1 z-10">
            <h3 className="font-serif text-[15px] font-bold text-[#F7F3EC] leading-tight">
              Why Our Beds<br />Stand Out?
            </h3>
            <div className="w-8 h-[1px] bg-[#B69764] my-2"></div>
            <ul className="space-y-1.5 text-[8.5px] text-[#C8A77D]">
              <li className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-[#A3E635] flex-shrink-0" />
                <span>Engineered for better sleep</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-[#A3E635] flex-shrink-0" />
                <span>Strong & durable wooden frames</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-[#A3E635] flex-shrink-0" />
                <span>Timeless designs for every home</span>
              </li>
            </ul>
          </div>
          <div className="w-[42%] aspect-[186/120] rounded-xl overflow-hidden border border-[#523B2F] flex-shrink-0 shadow-md">
            <img src="/assets/beds-carved-post.jpg" alt="Carved Bed Post Detail" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* Custom Bed Designs */}
        <section className="px-3 py-2 flex items-center gap-3">
          <div className="w-[48%] aspect-[210/100] rounded-xl overflow-hidden border border-[#DDD1C0] shadow-sm flex-shrink-0">
            <img src="/assets/beds-custom-design.jpg" alt="Custom Bed Design" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-[14px] font-bold text-[#241B16] leading-tight">
              Custom Bed Designs
            </h3>
            <p className="mt-1 text-[8.5px] text-[#695446] leading-snug">
              Get a bed designed to match your space, style and needs.
            </p>
            <button
              onClick={() => openEnquiryModal()}
              className="mt-2 inline-flex items-center gap-1 bg-[#493326] text-[#F7F3EC] px-2.5 py-1 rounded-full text-[8.5px] font-serif hover:bg-[#38251C]"
            >
              <span>Request Custom Design</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* 4 Trust Badges */}
        <section className="px-3 py-4 mt-2 bg-[#FAF7F2] border-t border-[#DFD5C6]">
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="flex flex-col items-center">
              <Truck size={16} className="text-[#8A7569] mb-1" />
              <span className="text-[7.5px] font-bold text-[#241B16]">Free Delivery*</span>
            </div>
            <div className="flex flex-col items-center">
              <Wrench size={16} className="text-[#8A7569] mb-1" />
              <span className="text-[7.5px] font-bold text-[#241B16]">Installation Support</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck size={16} className="text-[#8A7569] mb-1" />
              <span className="text-[7.5px] font-bold text-[#241B16]">Quality Assurance</span>
            </div>
            <div className="flex flex-col items-center">
              <Headphones size={16} className="text-[#8A7569] mb-1" />
              <span className="text-[7.5px] font-bold text-[#241B16]">Expert Assistance</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
