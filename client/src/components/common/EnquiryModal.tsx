import React from 'react';
import { X, MessageSquare, ExternalLink } from 'lucide-react';
import { useShortlist } from '../../context/ShortlistContext';
import { Product } from '../../types';
import { buildWhatsAppEnquiryUrl } from '../../constants/links';

export const EnquiryModal: React.FC = () => {
  const { enquiryModalProduct, closeEnquiryModal } = useShortlist();

  if (!enquiryModalProduct) return null;

  const isArray = Array.isArray(enquiryModalProduct);
  const products: Product[] = isArray ? enquiryModalProduct : [enquiryModalProduct];

  let messageText = '';
  if (products.length === 0) {
    messageText = `Hello Annamalai Furniture,\n\nI have a custom furniture requirement. Please let me know how we can discuss further.\n\nThank you.`;
  } else if (products.length === 1) {
    const p = products[0];
    messageText = `Hello Annamalai Furniture,\n\nI am interested in the following furniture model:\n\n• ${p.name} (Model: ${p.modelCode})\nCategory: ${p.category?.name || 'Furniture'}\n\nPlease share availability, customization options, and further details.\n\nThank you.`;
  } else {
    messageText = `Hello Annamalai Furniture,\n\nI am interested in the following furniture models:\n\n` +
      products.map((p, idx) => `${idx + 1}. ${p.name} — ${p.modelCode} (${p.category?.name || 'Furniture'})`).join('\n') +
      `\n\nPlease share availability and further details.\n\nThank you.`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FAF7F2] border border-[#D9CDBF] rounded-2xl max-w-[420px] w-full p-5 shadow-2xl relative text-[#241B16]">
        {/* Close Button */}
        <button
          onClick={closeEnquiryModal}
          className="absolute top-4 right-4 text-[#8A7569] hover:text-[#241B16] transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header with Pure White Logo */}
        <div className="flex items-center justify-between gap-3 mb-4 pr-6">
          <div className="bg-white px-2.5 py-1 rounded-lg border border-[#EAE2D5] shadow-sm">
            <img
              src="/assets/annamalai-logo.png"
              alt="Annamalai Furniture"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="text-right">
            <h3 className="font-serif text-sm font-bold text-[#241B16]">
              WhatsApp Enquiry
            </h3>
            <p className="text-[10px] text-[#7A675B]">
              {products.length} {products.length === 1 ? 'item' : 'items'} selected
            </p>
          </div>
        </div>

        {/* Selected Products List */}
        {products.length > 0 && (
          <div className="max-h-36 overflow-y-auto mb-4 space-y-2 pr-1">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-2.5 p-2 bg-[#F0EAE1] rounded-xl border border-[#DFD5C6]">
                {p.images?.[0]?.url || p.images?.[0]?.filePath ? (
                  <img
                    src={p.images[0].url || p.images[0].filePath}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={`${p.name} photo unavailable`}
                    className="w-10 h-10 rounded-lg flex-shrink-0 bg-[#E2D8C9]"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-serif font-bold text-[#241B16] truncate">{p.name}</h4>
                  <span className="text-[10px] text-[#8C7667] font-mono font-medium block">
                    Model: {p.modelCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formatted Message Preview */}
        <div className="mb-4">
          <label className="text-[10.5px] font-medium text-[#7A675B] uppercase tracking-wider block mb-1">
            Formatted Enquiry Message
          </label>
          <div className="bg-[#FFFFFF] border border-[#D9CDBF] rounded-xl p-3 text-xs text-[#241B16] whitespace-pre-wrap font-sans max-h-40 overflow-y-auto leading-relaxed shadow-inner">
            {messageText}
          </div>
        </div>

        <a
          href={buildWhatsAppEnquiryUrl(messageText)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeEnquiryModal}
          className="w-full bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2.5 px-4 rounded-full font-serif text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-md mb-3"
        >
          <ExternalLink size={16} />
          <span>Send via WhatsApp</span>
        </a>

        <div className="bg-[#EFE9DF] border border-[#DDD3C4] rounded-xl p-2.5 text-[10px] text-[#7A675B] leading-tight">
          Review the prefilled message and confirm sending in WhatsApp.
        </div>
      </div>
    </div>
  );
};
