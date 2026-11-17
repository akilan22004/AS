import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Phone, ArrowLeft, BookmarkCheck, ArrowRight } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import { useShortlist } from '../../context/ShortlistContext';

export const ShortlistPage: React.FC = () => {
  const { shortlist, removeFromShortlist, clearShortlist, openEnquiryModal } = useShortlist();
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EAE2D5] mb-6 sm:mb-8">
          <div>
            <span className="font-serif tracking-[0.2em] text-[10px] sm:text-xs text-[#8A7569] uppercase font-semibold block mb-1">
              Personalized Collection
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#241B16]">
              Your Enquiry Shortlist
            </h1>
            <p className="text-xs sm:text-sm text-[#7A675B] mt-1">
              {shortlist.length} {shortlist.length === 1 ? 'furniture piece' : 'furniture pieces'} saved for direct workshop consultation
            </p>
          </div>
          {shortlist.length > 0 && (
            <button
              onClick={clearShortlist}
              className="text-xs text-red-700 hover:text-red-900 flex items-center gap-1.5 font-serif self-start sm:self-auto"
            >
              <Trash2 size={14} /> <span>Clear All Items</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {shortlist.length === 0 ? (
          <div className="bg-white border border-[#EAE2D5] rounded-3xl p-10 sm:p-16 text-center my-6 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-[#8A7569] flex items-center justify-center mx-auto mb-4 border border-[#EFE8DC]">
              <BookmarkCheck size={30} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#241B16]">Your shortlist is empty</h3>
            <p className="text-xs sm:text-sm text-[#7A675B] mt-2 mb-6 leading-relaxed max-w-md mx-auto">
              Explore our handcrafted wooden furniture models and click the bookmark icon on any piece to save it for consultation.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#493326] text-[#F7F3EC] px-7 py-3 rounded-full font-serif text-xs font-semibold hover:bg-[#38251C] transition-all shadow-sm"
            >
              <span>Explore Furniture Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* List of shortlisted items in 2-column or 1-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortlist.map((product) => {
                const displayImg = product.images?.[0]?.url || product.images?.[0]?.filePath;

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-[#EAE2D5] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {displayImg ? (
                      <img
                        src={displayImg}
                        alt={product.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-[#EAE2D5] flex-shrink-0 cursor-pointer"
                        onClick={() => navigate(`/products/${product.slug}`)}
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`${product.name} photo`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-[#EAE2D5] flex-shrink-0 bg-[#F2ECE1]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#B69764] font-serif uppercase tracking-wider block">
                        {product.category?.name || 'Solid Wood'}
                      </span>
                      <h3
                        onClick={() => navigate(`/products/${product.slug}`)}
                        className="font-serif text-sm sm:text-base font-bold text-[#241B16] truncate cursor-pointer hover:text-[#B69764] transition-colors"
                      >
                        {product.name}
                      </h3>
                      <span className="text-xs font-mono text-[#8A7569] block mt-0.5">
                        Code: {product.modelCode}
                      </span>
                      <button
                        onClick={() => openEnquiryModal(product)}
                        className="text-xs font-serif text-[#493326] hover:text-[#B69764] mt-2 inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Enquire this item</span>
                        <span>→</span>
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromShortlist(product.id)}
                      className="text-[#A38D80] hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove from shortlist"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Combined WhatsApp Action Card */}
            <div className="bg-[#FAF8F5] border border-[#EAE2D5] rounded-3xl p-6 sm:p-8 text-center mt-6">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#241B16] mb-1">
                Ready to Enquire?
              </h3>
              <p className="text-xs sm:text-sm text-[#7A675B] mb-5 max-w-md mx-auto">
                Send all {shortlist.length} selected pieces together in a single formatted WhatsApp message for immediate availability & pricing.
              </p>
              <button
                onClick={() => openEnquiryModal(shortlist)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#241B16] hover:bg-[#38251C] text-[#F7F3EC] py-3.5 px-8 rounded-full font-serif text-sm font-semibold shadow-lg hover:shadow-xl transition-all btn-press"
              >
                <Phone size={16} className="text-[#25D366]" />
                <span>Enquire all {shortlist.length} items on WhatsApp</span>
              </button>
            </div>

            <div className="text-center pt-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#7A675B] hover:text-[#241B16] font-serif transition-colors"
              >
                <ArrowLeft size={16} /> <span>Continue browsing furniture collection</span>
              </Link>
            </div>
          </div>
        )}

        {/* WhatsApp Banner */}
        <div className="mt-12">
          <WhatsAppBanner />
        </div>
      </main>

      <Footer />
    </div>
  );
};
