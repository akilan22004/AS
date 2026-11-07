import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bookmark, ShieldCheck } from 'lucide-react';
import { useShortlist } from '../../context/ShortlistContext';

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { shortlist } = useShortlist();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#241B16] text-[#F7F3EC] shadow-md border-b border-[#3D2C22]">
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-[#F7F3EC] hover:text-[#C8A77D] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Center: Brand Logo & Typography */}
          <Link to="/" className="flex flex-col items-center justify-center -space-y-0.5 group">
            <div className="flex items-center gap-1.5">
              <img
                src="/assets/tree-logo.png"
                alt="Annamalai Furniture Logo"
                className="h-6 w-auto object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                onError={(e) => {
                  // Fallback to inline SVG if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-serif tracking-[0.2em] text-[15px] font-bold text-[#F7F3EC] uppercase group-hover:text-[#C8A77D] transition-colors">
                ANNAMALAI
              </span>
            </div>
            <span className="font-serif tracking-[0.28em] text-[8px] font-medium text-[#C8A77D] uppercase">
              FURNITURE
            </span>
          </Link>

          {/* Right: Search & Shortlist */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-[#F7F3EC] hover:text-[#C8A77D] transition-colors"
              aria-label="Search furniture"
            >
              <Search size={20} />
            </button>
            <Link
              to="/shortlist"
              className="p-1.5 text-[#F7F3EC] hover:text-[#C8A77D] transition-colors relative"
              aria-label="View Shortlist"
            >
              <Bookmark size={20} />
              {shortlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#B69764] text-[#241B16] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {shortlist.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Collapsible Search Bar */}
        {searchOpen && (
          <div className="bg-[#2E221C] px-4 py-2 border-t border-[#3D2C22] max-w-[480px] mx-auto animate-fadeIn">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search furniture models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-[#1A130F] text-[#F7F3EC] text-xs px-3 py-2 rounded-full border border-[#493326] focus:outline-none focus:border-[#C8A77D] placeholder-[#8A7569]"
              />
              <button
                type="submit"
                className="bg-[#493326] text-[#F7F3EC] px-3 py-2 rounded-full text-xs font-medium hover:bg-[#B69764] hover:text-[#241B16] transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-[280px] bg-[#241B16] text-[#F7F3EC] h-full shadow-2xl flex flex-col justify-between p-6 animate-slideRight">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#3D2C22]">
                <div className="flex items-center gap-2">
                  <img src="/assets/tree-logo.png" alt="Logo" className="h-7 w-auto object-contain" />
                  <div>
                    <h2 className="font-serif tracking-[0.15em] text-sm font-bold uppercase">ANNAMALAI</h2>
                    <p className="font-serif tracking-[0.25em] text-[7px] text-[#C8A77D] uppercase">FURNITURE</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="text-[#8A7569] hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-4 font-serif text-sm">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Home <span>→</span>
                </Link>
                <Link
                  to="/collections"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Explore Our Craft <span>→</span>
                </Link>
                <Link
                  to="/collections/beds"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Beds Collection <span>→</span>
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Handcrafted Catalog <span>→</span>
                </Link>
                <Link
                  to="/featured-collections"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Featured Collections <span>→</span>
                </Link>
                <Link
                  to="/craftsmanship"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Our Craftsmanship <span>→</span>
                </Link>
                <Link
                  to="/showcase"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Customer Stories <span>→</span>
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  About Our Craft <span>→</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Contact & Showroom <span>→</span>
                </Link>
                <Link
                  to="/shortlist"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#C8A77D] transition-colors py-1 flex items-center justify-between"
                >
                  Enquiry Shortlist ({shortlist.length}) <span>→</span>
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#3D2C22]">
              <Link
                to="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-xs text-[#C8A77D] hover:text-white transition-colors"
              >
                <ShieldCheck size={16} /> Admin Portal
              </Link>
              <p className="text-[10px] text-[#8A7569] mt-3">The Art of Wood — Handcrafted Luxury</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
