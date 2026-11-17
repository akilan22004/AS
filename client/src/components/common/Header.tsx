import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bookmark, ShieldCheck, Phone, ChevronRight } from 'lucide-react';
import { useShortlist } from '../../context/ShortlistContext';
import { buildWhatsAppEnquiryUrl } from '../../constants/links';

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { shortlist } = useShortlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/collections' },
    { label: 'Beds', path: '/collections/beds' },
    { label: 'Catalog', path: '/products' },
    { label: 'Craftsmanship', path: '/craftsmanship' },
    { label: 'Showcase', path: '/showcase' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#1C1511] text-[#D8C9B9] text-[10px] sm:text-[11px] py-1.5 px-4 border-b border-[#30221A] text-center tracking-wider font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline-block text-[#B69764] font-medium">✦ Handcrafted Solid Teak, Rosewood & Sheesham</span>
          <span className="mx-auto sm:mx-0">Direct Workshop Delivery across Tamil Nadu • Custom Designs Welcome</span>
          <a
            href={buildWhatsAppEnquiryUrl('Hello Annamalai Furniture, I have an enquiry regarding your luxury collection.')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-[#C8A77D] hover:text-white transition-colors"
          >
            <span>WhatsApp Enquiry: +91 94432 23344</span>
          </a>
        </div>
      </div>

      {/* Main Responsive Header */}
      <header className="sticky top-0 z-40 bg-[#241B16] text-[#F7F3EC] shadow-lg border-b border-[#3D2C22] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Mobile Left: Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -ml-2 text-[#F7F3EC] hover:text-[#C8A77D] rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo Container with PURE WHITE Background */}
          <Link to="/" className="flex items-center group flex-shrink-0" title="Annamalai Furniture Home">
            <div className="bg-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg shadow-sm border border-[#EAE2D5] flex items-center justify-center transition-transform group-hover:scale-[1.02]">
              <img
                src="/assets/annamalai-logo.png"
                alt="Annamalai Furniture"
                className="h-7 sm:h-9 md:h-10 w-auto object-contain max-w-[180px] sm:max-w-[220px]"
                loading="eager"
              />
            </div>
          </Link>

          {/* Desktop Center: Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-xs font-serif tracking-wider uppercase">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors py-1 relative hover:text-[#C8A77D] ${
                    isActive ? 'text-[#C8A77D] font-bold' : 'text-[#EFE9DF]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8A77D] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, Shortlist, WhatsApp Consultation */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#F7F3EC] hover:text-[#C8A77D] rounded-full hover:bg-white/5 transition-colors"
              aria-label="Search furniture"
              title="Search products"
            >
              <Search size={20} />
            </button>

            {/* Shortlist / Wishlist Button */}
            <Link
              to="/shortlist"
              className="p-2 text-[#F7F3EC] hover:text-[#C8A77D] rounded-full hover:bg-white/5 transition-colors relative"
              aria-label="View Shortlist"
              title="Saved items"
            >
              <Bookmark size={20} />
              {shortlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#B69764] text-[#241B16] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                  {shortlist.length}
                </span>
              )}
            </Link>

            {/* Desktop WhatsApp Action Button */}
            <a
              href={buildWhatsAppEnquiryUrl('Hello Annamalai Furniture, I would like to book a furniture consultation.')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-[#493326] hover:bg-[#B69764] text-[#F7F3EC] hover:text-[#241B16] px-3.5 py-1.5 rounded-full font-serif text-xs font-semibold tracking-wide transition-all border border-[#594338] shadow-sm"
            >
              <Phone size={13} />
              <span>Consultation</span>
            </a>
          </div>
        </div>

        {/* Collapsible Search Bar (Responsive full width) */}
        {searchOpen && (
          <div className="bg-[#2D211A] px-4 py-3 border-t border-[#3D2C22] shadow-inner animate-fadeIn">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search handcrafted beds, sofas, dining tables, wardrobes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-[#18110D] text-[#F7F3EC] text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-full border border-[#493326] focus:outline-none focus:border-[#C8A77D] placeholder-[#8A7569]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7569] hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#B69764] text-[#241B16] font-serif font-bold px-5 py-2.5 rounded-full text-xs hover:bg-[#C8A77D] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex animate-fadeIn">
          <div className="w-[85%] max-w-[340px] bg-[#241B16] text-[#F7F3EC] h-full shadow-2xl flex flex-col justify-between p-5 sm:p-6 overflow-y-auto animate-slideRight">
            <div>
              {/* Drawer Header with Pure White Logo Container */}
              <div className="flex items-center justify-between pb-5 border-b border-[#3D2C22]">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <img
                    src="/assets/annamalai-logo.png"
                    alt="Annamalai Furniture"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-[#8A7569] hover:text-white rounded-lg"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="mt-5 flex flex-col space-y-1.5 font-serif text-sm">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>Home</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/collections"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>Collections & Categories</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/collections/beds"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>Royal Beds Collection</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>Handcrafted Catalog</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/craftsmanship"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>The Art of Craftsmanship</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/showcase"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>Customer Gallery & Showcase</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>About Our Workshop</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-[#C8A77D] transition-colors flex items-center justify-between"
                >
                  <span>Showroom & Contact</span>
                  <ChevronRight size={16} className="text-[#8A7569]" />
                </Link>
                <Link
                  to="/shortlist"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/5 text-[#C8A77D] font-bold transition-colors flex items-center justify-between mt-2"
                >
                  <span>Saved Shortlist</span>
                  <span className="bg-[#B69764] text-[#241B16] text-[10px] px-2 py-0.5 rounded-full">
                    {shortlist.length}
                  </span>
                </Link>
              </nav>
            </div>

            {/* Drawer Footer with Admin link */}
            <div className="pt-6 border-t border-[#3D2C22] space-y-3">
              <a
                href={buildWhatsAppEnquiryUrl('Hello Annamalai Furniture, I would like to book a furniture consultation.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#493326] text-[#F7F3EC] py-2.5 px-4 rounded-xl text-xs font-serif flex items-center justify-center gap-2 hover:bg-[#B69764] hover:text-[#241B16] transition-colors font-semibold"
              >
                <Phone size={14} />
                <span>WhatsApp Consultation</span>
              </a>
              <Link
                to="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-xs text-[#8A7569] hover:text-[#C8A77D] py-1 transition-colors"
              >
                <ShieldCheck size={14} />
                <span>Admin Portal</span>
              </Link>
              <p className="text-[10px] text-[#7A675B] text-center font-serif">
                Handcrafted Solid Wood Furniture • Est. Tamil Nadu
              </p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
