import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, MessageSquare, ArrowLeft, BookmarkCheck } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import { useShortlist } from '../../context/ShortlistContext';

export const ShortlistPage: React.FC = () => {
  const { shortlist, removeFromShortlist, clearShortlist, openEnquiryModal } = useShortlist();
  const navigate = useNavigate();

  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1 px-4 py-5">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-[22px] font-bold text-[#241B16]">
              Enquiry Shortlist
            </h1>
            <p className="text-[11px] text-[#7A675B]">
              {shortlist.length} {shortlist.length === 1 ? 'model' : 'models'} selected for enquiry
            </p>
          </div>
          {shortlist.length > 0 && (
            <button
              onClick={clearShortlist}
              className="text-[10px] text-red-700 hover:underline flex items-center gap-1 font-serif"
            >
              <Trash2 size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Empty State */}
        {shortlist.length === 0 ? (
          <div className="bg-[#FAF7F2] border border-[#DFD5C6] rounded-2xl p-8 text-center my-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#8A7569] flex items-center justify-center mx-auto mb-3">
              <BookmarkCheck size={24} />
            </div>
            <h3 className="font-serif text-base font-bold text-[#241B16]">Your shortlist is empty</h3>
            <p className="text-xs text-[#7A675B] mt-1 mb-4 leading-relaxed">
              Explore our handcrafted wooden furniture models and bookmark pieces you'd like to enquire about.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#493326] text-[#F7F3EC] px-5 py-2 rounded-full font-serif text-xs"
            >
              <span>Explore Collection</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* List of shortlisted items */}
            {shortlist.map((product) => {
              const displayImg = product.images?.[0]?.url || product.images?.[0]?.filePath;

              return (
                <div
                  key={product.id}
                  className="bg-[#FAF7F2] border border-[#DFD5C6] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm"
                >
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-[#DDD1C0] flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/products/${product.slug}`)}
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={`${product.name} photo unavailable`}
                      className="w-16 h-16 rounded-xl border border-[#DDD1C0] flex-shrink-0 bg-[#E2D8C9]"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => navigate(`/products/${product.slug}`)}
                      className="font-serif text-[13px] font-bold text-[#241B16] truncate cursor-pointer hover:text-[#B69764] transition-colors"
                    >
                      {product.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#8A7569] block mt-0.5">
                      Model: {product.modelCode}
                    </span>
                    <span className="text-[9px] text-[#7A675B] block truncate mt-0.5">
                      {product.category?.name || 'Solid Wood'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    <button
                      onClick={() => removeFromShortlist(product.id)}
                      className="text-[#A38D80] hover:text-red-700 p-1"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => openEnquiryModal(product)}
                      className="text-[9.5px] font-serif text-[#493326] hover:underline"
                    >
                      Enquire →
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Combined WhatsApp Action Button */}
            <div className="pt-3">
              <button
                onClick={() => openEnquiryModal(shortlist)}
                className="w-full bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-3 rounded-full font-serif text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare size={16} className="text-[#A3E635]" />
                <span>Enquire via WhatsApp ({shortlist.length} Items)</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs text-[#7A675B] hover:text-[#241B16] font-serif"
              >
                <ArrowLeft size={14} /> Continue browsing
              </Link>
            </div>
          </div>
        )}

        {/* WhatsApp Banner */}
        <div className="mt-6">
          <WhatsAppBanner />
        </div>
      </main>

      <Footer />
    </div>
  );
};
