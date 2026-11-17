import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, MapPin, Phone, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';
import { buildWhatsAppEnquiryUrl, SHOP_MAP_URL } from '../../constants/links';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1C1511] text-[#F7F3EC] border-t border-[#33251D] pt-12 sm:pt-16 pb-8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-[#2E2018]">
          
          {/* Col 1: Brand Info & Logo on Pure White */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-sm border border-[#EAE2D5] inline-flex items-center">
              <img
                src="/assets/annamalai-logo.png"
                alt="Annamalai Furniture"
                className="h-8 sm:h-10 w-auto object-contain max-w-[200px]"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-[#A89889] leading-relaxed font-sans max-w-sm">
              Generations of master woodworking in solid Teak, Rosewood, and Sheesham. Every piece is crafted by skilled artisans for timeless elegance and generational durability.
            </p>
            <div className="pt-1 flex items-center gap-2.5">
              <a
                href={SHOP_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#C8A77D] hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-[#493326]"
              >
                <MapPin size={13} />
                <span>Visit Showroom</span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          {/* Col 2: Furniture Collections */}
          <div>
            <h3 className="font-serif text-sm font-bold tracking-widest text-[#F7F3EC] uppercase mb-4 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#C8A77D]" />
              <span>Collections</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-[#B8A799] font-sans">
              <li>
                <Link to="/products?category=sofas" className="hover:text-[#C8A77D] transition-colors flex items-center gap-1.5">
                  <span>Solid Wood Sofas</span>
                </Link>
              </li>
              <li>
                <Link to="/collections/beds" className="hover:text-[#C8A77D] transition-colors flex items-center gap-1.5">
                  <span>Royal Teak Beds</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=dining-tables" className="hover:text-[#C8A77D] transition-colors flex items-center gap-1.5">
                  <span>Artisanal Dining Sets</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=wardrobes" className="hover:text-[#C8A77D] transition-colors flex items-center gap-1.5">
                  <span>Handcrafted Wardrobes</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=tv-units" className="hover:text-[#C8A77D] transition-colors flex items-center gap-1.5">
                  <span>Entertainment & TV Units</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=dressing-tables" className="hover:text-[#C8A77D] transition-colors flex items-center gap-1.5">
                  <span>Dressing Tables</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Craftsmanship & Company */}
          <div>
            <h3 className="font-serif text-sm font-bold tracking-widest text-[#F7F3EC] uppercase mb-4 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#C8A77D]" />
              <span>Heritage & Craft</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-[#B8A799] font-sans">
              <li>
                <Link to="/craftsmanship" className="hover:text-[#C8A77D] transition-colors">
                  The Art of Woodworking
                </Link>
              </li>
              <li>
                <Link to="/showcase" className="hover:text-[#C8A77D] transition-colors">
                  Customer Showcase Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C8A77D] transition-colors">
                  About Our Workshop
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C8A77D] transition-colors">
                  Contact & Location
                </Link>
              </li>
              <li>
                <Link to="/shortlist" className="hover:text-[#C8A77D] transition-colors">
                  Saved Shortlist
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#C8A77D] transition-colors inline-flex items-center gap-1 text-[#8A7569]">
                  <ShieldCheck size={12} />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Enquiries & Socials */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-bold tracking-widest text-[#F7F3EC] uppercase mb-4 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#C8A77D]" />
              <span>Consultations</span>
            </h3>
            <p className="text-xs text-[#A89889] leading-relaxed">
              Have a custom furniture design in mind? Send your room dimensions and reference photos directly to our master craftsmen.
            </p>
            <div className="space-y-2 text-xs">
              <a
                href={buildWhatsAppEnquiryUrl('Hello Annamalai Furniture, I would like to consult with you about custom furniture.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#2D211A] hover:bg-[#B69764] hover:text-[#241B16] text-[#C8A77D] px-4 py-2 rounded-xl border border-[#493326] transition-all font-serif font-semibold w-full justify-center"
              >
                <Phone size={14} />
                <span>WhatsApp: +91 94432 23344</span>
              </a>
            </div>

            {/* Social Media Channels */}
            <div className="pt-2 flex items-center gap-2.5 text-[#C8A77D]">
              <a
                href={buildWhatsAppEnquiryUrl('Hello Annamalai Furniture!')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full border border-[#493326] bg-[#241B16] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#B69764] hover:text-[#241B16] transition-all"
              >
                <Phone size={14} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-[#493326] bg-[#241B16] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#B69764] hover:text-[#241B16] transition-all"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full border border-[#493326] bg-[#241B16] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#B69764] hover:text-[#241B16] transition-all"
              >
                <Youtube size={14} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-[#493326] bg-[#241B16] flex items-center justify-center hover:border-[#C8A77D] hover:bg-[#B69764] hover:text-[#241B16] transition-all"
              >
                <Facebook size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A7569] font-sans">
          <p>© {new Date().getFullYear()} Annamalai Furniture. All rights reserved.</p>
          <p className="text-[11px] font-serif text-[#C8A77D]">
            Authentic Solid Wood Craftsmanship • Direct from the Workshop
          </p>
        </div>
      </div>
    </footer>
  );
};
