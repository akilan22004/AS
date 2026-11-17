import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Armchair, Bed, UtensilsCrossed, DoorClosed, Tv, Sparkles, Archive, Disc } from 'lucide-react';
import { api, DEFAULT_CATEGORIES } from '../../services/api';
import { Category } from '../../types';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    initialData: DEFAULT_CATEGORIES,
  });
  const iconBySlug: Record<string, typeof Armchair> = {
    sofas: Armchair,
    beds: Bed,
    'dining-tables': UtensilsCrossed,
    dining: UtensilsCrossed,
    wardrobes: DoorClosed,
    chairs: Armchair,
    'tv-units': Tv,
    'dressing-tables': Sparkles,
    'storage-cabinets': Archive,
  };
  const categories = (categoriesQuery.data || []).map((category: Category, index) => ({
    id: category.slug,
    title: category.name,
    subtitle: category.description || 'Handcrafted for lasting comfort and style.',
    image: category.coverImage,
    icon: iconBySlug[category.slug] || Disc,
    theme: index % 2 === 0 ? 'dark' : 'light',
  }));

  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Header Intro */}
        <section className="pt-6 pb-4 px-4 text-center bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC]">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-5 h-[1px] bg-[#B69764]"></span>
            <span className="font-serif tracking-[0.2em] text-[8.5px] uppercase text-[#735A4B] font-semibold">
              A Gallery of Handcrafted Living
            </span>
            <span className="w-5 h-[1px] bg-[#B69764]"></span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[24px] text-[#241B16] font-bold tracking-tight">
            Explore Our Craft
          </h1>

          {/* Subtitle */}
          <p className="mt-1 text-[10.5px] text-[#695446] leading-relaxed max-w-[310px] mx-auto">
            Discover our thoughtfully crafted furniture collections, where timeless design meets the warmth of natural wood.
          </p>

          {/* Leaf feather motif */}
          <div className="flex items-center justify-center mt-2 text-[#C8A77D]">
            <span className="text-sm">🍃</span>
          </div>
        </section>

        {/* 8 Wavy Alternating Category Cards */}
        <section className="px-3 pb-6 space-y-3">
          {categoriesQuery.isLoading && <p className="py-8 text-center text-xs text-[#7A675B]">Loading collections…</p>}
          {categoriesQuery.isError && (
            <div role="alert" className="py-5 text-center text-xs text-red-700">
              Collections could not be loaded.
              <button type="button" className="ml-2 underline" onClick={() => categoriesQuery.refetch()}>Retry</button>
            </div>
          )}
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isDark = cat.theme === 'dark';

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-[#D9CEBF] shadow-sm hover:shadow-lg transition-all duration-300 flex h-[120px] bg-[#FDFBF7] hover:-translate-y-0.5"
              >
                {/* Left Side */}
                {isDark ? (
                  // Dark walnut side with wavy right edge
                  <div className="w-[48%] bg-[#493326] text-[#F7F3EC] p-3 flex flex-col justify-between relative rounded-r-[28px] z-10 shadow-md">
                    <div>
                      <div className="w-5 h-5 mb-1 text-[#C8A77D]">
                        <Icon size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="font-serif text-[14px] font-bold text-[#F7F3EC] leading-tight">
                        {cat.title}
                      </h3>
                      <p className="text-[8.5px] text-[#D4C3B5] leading-tight mt-0.5 line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 border border-[#C8A77D]/40 text-[#C8A77D] rounded-full px-2 py-0.5 text-[8px] font-serif w-max group-hover:bg-[#C8A77D] group-hover:text-[#241B16] transition-colors">
                      <span>Discover Collection</span>
                      <span className="text-[9px]">→</span>
                    </div>
                  </div>
                ) : (
                  // Photo on left
                  <div className="w-[52%] h-full overflow-hidden">
                    {cat.image ? <img
                      src={cat.image}
                      alt={cat.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    /> : <div className="h-full w-full flex items-center justify-center bg-[#EAE2D5] text-[9px] text-[#7A675B]">Photo coming soon</div>}
                  </div>
                )}

                {/* Right Side */}
                {isDark ? (
                  // Photo on right
                  <div className="w-[52%] h-full overflow-hidden -ml-3">
                    {cat.image ? <img
                      src={cat.image}
                      alt={cat.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    /> : <div className="h-full w-full flex items-center justify-center bg-[#EAE2D5] text-[9px] text-[#7A675B]">Photo coming soon</div>}
                  </div>
                ) : (
                  // Ivory wave side on right
                  <div className="w-[48%] bg-[#F7F3EC] text-[#241B16] p-3 flex flex-col justify-between relative rounded-l-[28px] -ml-3 z-10 border-l border-[#D9CEBF] shadow-sm">
                    <div>
                      <div className="w-5 h-5 mb-1 text-[#8A7569]">
                        <Icon size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="font-serif text-[14px] font-bold text-[#241B16] leading-tight">
                        {cat.title}
                      </h3>
                      <p className="text-[8.5px] text-[#695446] leading-tight mt-0.5 line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 border border-[#8A7569]/50 text-[#493326] rounded-full px-2 py-0.5 text-[8px] font-serif w-max group-hover:bg-[#493326] group-hover:text-white transition-colors">
                      <span>Discover Collection</span>
                      <span className="text-[9px]">→</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Bottom Craftsmanship Banner */}
        <section className="bg-[#FAF6F0] border-t border-[#DFD6C9] py-4 px-4 flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-serif text-[15px] font-bold text-[#241B16] leading-tight">
              The Art of<br />Craftsmanship
            </h3>
            <p className="mt-1 text-[9px] text-[#695446] leading-relaxed">
              Every piece is a blend of skilled hands, natural wood and lasting design.
            </p>
          </div>
          <div className="w-36 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-[#D9CEBF]">
            <img
              src="/assets/craft-artisan-senior.jpg"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
