import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, MapPin } from 'lucide-react';
import { buildWhatsAppEnquiryUrl, SHOP_MAP_URL } from '../../constants/links';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#241B16] text-[#F7F3EC] pt-6 pb-4 border-t border-[#3D2C22]">
      <div className="max-w-[480px] mx-auto px-4">
        {/* Brand & Nav row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#382820]">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2">
            <img src="/assets/tree-logo.png" alt="Logo" className="h-6 w-auto object-contain" />
            <div className="text-left">
              <span className="block font-serif tracking-[0.18em] text-[13px] font-bold uppercase leading-none">
                ANNAMALAI
              </span>
              <span className="block font-serif tracking-[0.26em] text-[7.5px] text-[#C8A77D] uppercase mt-0.5 leading-none">
                FURNITURE
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-3 text-[11px] font-sans text-[#E0D7CD]">
            <Link to="/" className="hover:text-[#C8A77D] transition-colors">
              Home
            </Link>
            <span className="text-[#594338]">•</span>
            <Link to="/collections" className="hover:text-[#C8A77D] transition-colors">
              Collection
            </Link>
            <span className="text-[#594338]">•</span>
            <Link to="/about" className="hover:text-[#C8A77D] transition-colors">
              About Us
            </Link>
            <span className="text-[#594338]">•</span>
            <Link to="/contact" className="hover:text-[#C8A77D] transition-colors">
              Contact
            </Link>
            <a href={SHOP_MAP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#C8A77D] transition-colors inline-flex items-center gap-1">
              <MapPin size={11} />
              Get Directions
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2 text-[#C8A77D]">
            {/* WhatsApp */}
            <a
              href={buildWhatsAppEnquiryUrl('Hello Annamalai Furniture, I would like to make an enquiry.')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send an enquiry via WhatsApp"
              className="w-6 h-6 rounded-full border border-[#594338] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#38251C] transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.884 2.791.884 3.179 0 5.767-2.587 5.768-5.766.002-3.18-2.584-5.77-5.768-5.77zm3.365 8.163c-.14.394-.716.732-1.023.778-.291.043-.668.077-2.18-.553-1.849-.769-3.045-2.656-3.138-2.78-.093-.124-.754-1.003-.754-1.913 0-.911.478-1.358.648-1.542.17-.184.372-.23.496-.23.124 0 .248.002.356.008.115.006.269-.044.421.323.155.373.53 1.294.577 1.388.047.094.078.204.016.328-.063.125-.094.204-.187.313-.094.11-.198.245-.283.33-.094.094-.192.197-.082.386.11.189.49 1.808 1.401 2.228.468.216.862.308 1.157.34.295.031.544-.016.736-.233.193-.217.828-.962 1.05-1.29.222-.328.444-.275.748-.162.304.113 1.93.91 2.262 1.076.332.166.554.249.636.388.083.139.083.805-.057 1.199z"/>
              </svg>
            </a>
            {/* Instagram */}
            <div className="w-6 h-6 rounded-full border border-[#594338] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#38251C] transition-colors cursor-pointer">
              <Instagram size={13} />
            </div>
            {/* YouTube */}
            <div className="w-6 h-6 rounded-full border border-[#594338] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#38251C] transition-colors cursor-pointer">
              <Youtube size={13} />
            </div>
            {/* Facebook */}
            <div className="w-6 h-6 rounded-full border border-[#594338] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#38251C] transition-colors cursor-pointer">
              <Facebook size={13} />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-3 text-center">
          <p className="text-[9.5px] text-[#8A7569] tracking-wider">
            © 2025 Annamalai Furniture. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
