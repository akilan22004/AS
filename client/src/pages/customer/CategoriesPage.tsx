import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import { Armchair, Bed, UtensilsCrossed, DoorClosed, Tv, Sparkles, Archive, Disc, ArrowRight } from 'lucide-react';
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
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">
        {/* Top Header Intro Banner */}
        <section className="pt-8 sm:pt-14 pb-8 px-4 text-center bg-gradient-to-b from-[#F2ECE1] to-[#FAF8F5] border-b border-[#EAE2D5]">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-6 h-[1.5px] bg-[#B69764]" />
              <span className="font-serif tracking-[0.25em] text-[10px] sm:text-xs uppercase text-[#735A4B] font-semibold">
                A Gallery of Handcrafted Living
              </span>
              <span className="w-6 h-[1.5px] bg-[#B69764]" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#241B16] font-bold tracking-tight">
              Explore Our Collections
            </h1>

            <p className="mt-3 text-xs sm:text-sm lg:text-base text-[#695446] leading-relaxed max-w-xl mx-auto">
              Discover our signature solid wood furniture lines, where generational Tamil Nadu craftsmanship meets timeless design.
            </p>
          </div>
        </section>

        {/* Responsive Grid of Category Cards (2 cols on tablet/desktop, 1 col on mobile) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {categoriesQuery.isLoading && (
            <p className="py-12 text-center text-xs text-[#7A675B] font-serif">
              Loading collections…
            </p>
          )}
          {categoriesQuery.isError && (
            <div role="alert" className="py-8 text-center text-xs text-red-700">
              Collections could not be loaded.
              <button type="button" className="ml-2 underline font-bold" onClick={() => categoriesQuery.refetch()}>Retry</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isDark = cat.theme === 'dark';

              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                  className="group cursor-pointer rounded-3xl overflow-hidden border border-[#EAE2D5] shadow-sm hover:shadow-xl hover:border-[#C8A77D] transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-[180px] bg-white hover:-translate-y-1"
                >
                  {/* Text / Info Side */}
                  <div
                    className={`w-full sm:w-[50%] p-5 sm:p-6 flex flex-col justify-between order-2 sm:order-1 ${
                      isDark ? 'bg-[#241B16] text-[#F7F3EC]' : 'bg-[#FAF8F5] text-[#241B16]'
                    }`}
                  >
                    <div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${isDark ? 'bg-white/10 text-[#C8A77D]' : 'bg-[#EFE9DF] text-[#493326]'}`}>
                        <Icon size={18} strokeWidth={2} />
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight">
                        {cat.title}
                      </h3>
                      <p className={`text-xs mt-1 leading-snug line-clamp-2 ${isDark ? 'text-[#D4C3B5]' : 'text-[#695446]'}`}>
                        {cat.subtitle}
                      </p>
                    </div>

                    <div className="pt-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-serif font-semibold group-hover:gap-2 transition-all ${
                        isDark ? 'text-[#C8A77D]' : 'text-[#493326]'
                      }`}>
                        <span>Discover Collection</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>

                  {/* Photo Side */}
                  <div className="w-full sm:w-[50%] h-44 sm:h-full overflow-hidden bg-[#F2ECE1] order-1 sm:order-2">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#F2ECE1] text-xs text-[#7A675B]">
                        Photo coming soon
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* WhatsApp Banner */}
        <WhatsAppBanner />
      </main>

      <Footer />
    </div>
  );
};
