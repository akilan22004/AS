import React from 'react';
import { useShortlist } from '../../context/ShortlistContext';

export const WhatsAppBanner: React.FC = () => {
  const { openEnquiryModal } = useShortlist();

  return (
    <div className="px-4 py-3 bg-[#F7F3EC]">
      <div className="max-w-[480px] mx-auto bg-[#FDFBF7] border border-[#E6DCC8] rounded-2xl p-3 shadow-md flex items-center justify-between gap-2.5">
        {/* WhatsApp Icon with pulse */}
        <div className="w-10 h-10 rounded-xl bg-[#25D366] flex-shrink-0 flex items-center justify-center text-white shadow-sm whatsapp-pulse">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.884 2.791.884 3.179 0 5.767-2.587 5.768-5.766.002-3.18-2.584-5.77-5.768-5.77zm3.365 8.163c-.14.394-.716.732-1.023.778-.291.043-.668.077-2.18-.553-1.849-.769-3.045-2.656-3.138-2.78-.093-.124-.754-1.003-.754-1.913 0-.911.478-1.358.648-1.542.17-.184.372-.23.496-.23.124 0 .248.002.356.008.115.006.269-.044.421.323.155.373.53 1.294.577 1.388.047.094.078.204.016.328-.063.125-.094.204-.187.313-.094.11-.198.245-.283.33-.094.094-.192.197-.082.386.11.189.49 1.808 1.401 2.228.468.216.862.308 1.157.34.295.031.544-.016.736-.233.193-.217.828-.962 1.05-1.29.222-.328.444-.275.748-.162.304.113 1.93.91 2.262 1.076.332.166.554.249.636.388.083.139.083.805-.057 1.199z"/>
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="font-serif text-[12.5px] font-bold text-[#241B16] leading-snug truncate">
            Have a Custom Requirement?
          </h4>
          <p className="text-[10px] text-[#6E5A4D] leading-tight">
            Chat with us on WhatsApp and let's craft it together.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => openEnquiryModal()}
          className="flex-shrink-0 bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] text-[10.5px] font-serif font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-sm btn-press"
        >
          <span>Enquire Now</span>
          <span className="text-xs">→</span>
        </button>
      </div>
    </div>
  );
};
