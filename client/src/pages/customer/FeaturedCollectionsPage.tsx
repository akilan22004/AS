import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  TreePine,
  Hammer,
  Diamond,
  Truck,
  ArrowRight,
  MapPin,
  MessageCircle,
  Sofa,
  Bed,
  UtensilsCrossed,
  DoorClosed,
  Tv,
  Sparkles,
  Wrench
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SHOP_MAP_URL } from '../../constants/links';
import { useShortlist } from '../../context/ShortlistContext';
import { api, DEFAULT_CATEGORIES } from '../../services/api';
import { Category, Product } from '../../types';

export const FeaturedCollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { openEnquiryModal } = useShortlist();
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    initialData: DEFAULT_CATEGORIES,
  });
  const featuredProductsQuery = useQuery({ queryKey: ['featured-products'], queryFn: api.getFeaturedProducts });
  const categoryIcons: Record<string, React.ReactNode> = {
    sofas: <Sofa size={14} />,
    beds: <Bed size={14} />,
    dining: <UtensilsCrossed size={14} />,
    'dining-tables': <UtensilsCrossed size={14} />,
    wardrobes: <DoorClosed size={14} />,
    'tv-units': <Tv size={14} />,
    'dressing-tables': <Sparkles size={14} />,
  };
  const categories = (categoriesQuery.data || []).map((category: Category) => ({
    id: category.id,
    name: category.name,
    subtitle: category.description || 'Handcrafted for lasting comfort and style.',
    image: category.coverImage,
    link: category.slug === 'beds' ? '/collections/beds' : `/products?category=${encodeURIComponent(category.slug)}`,
    icon: categoryIcons[category.slug] || <MapPin size={14} />,
  }));
  const bestsellers: Product[] = featuredProductsQuery.data || [];

  const handleEnquire = (item: Product) => {
    openEnquiryModal(item);
  };

  const handleCustomEnquiry = () => {
    const product: Product = {
      id: 'custom-furniture',
      name: 'Custom Wooden Furniture Consultation',
      modelCode: 'AF-CUSTOM',
      slug: 'custom-furniture',
      categoryId: '',
      isFeatured: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [],
    };
    openEnquiryModal(product);
  };

  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative px-5 pt-6 pb-6 bg-[#2B1E17] text-[#FAF7F2] overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none">
            <img
              src="/assets/collections-hero-armchair.jpg"
              alt="Handcrafted Wood Furniture"
              className="w-full h-full object-cover object-left opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B1E17] via-[#2B1E17]/60 to-transparent"></div>
          </div>

          <div className="max-w-[210px] relative z-10">
            <h1 className="font-serif text-[24px] text-[#FAF7F2] font-bold leading-tight tracking-tight mb-2">
              Our<br />Collections
            </h1>
            <div className="w-9 h-[1.5px] bg-[#B69764] mb-3"></div>
            <p className="text-[10px] text-[#D4C5B9] leading-relaxed">
              A curated range of handcrafted wooden furniture for every space in your home.
            </p>
          </div>
        </section>

        {/* Decorative Wave Divider */}
        <div className="relative w-full h-4 bg-[#2B1E17]">
          <div className="absolute inset-0 bg-[#F7F3EC] rounded-t-[20px]"></div>
        </div>

        {/* 4 Feature Badges */}
        <section className="px-3 pt-2 pb-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <TreePine size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Premium<br />Wood
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Hammer size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Handcrafted<br />Designs
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Diamond size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Long<br />Durability
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Truck size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Safe<br />Delivery
              </span>
            </div>
          </div>
        </section>

        {/* Section: Explore by Category */}
        <section className="px-4 py-3 bg-[#FAF7F2] border-t border-b border-[#EAE1D2]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
            <h2 className="font-serif text-[13px] font-bold text-[#3B281C] tracking-wide text-center">
              Explore by Category
            </h2>
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {categoriesQuery.isLoading && <p className="col-span-2 py-6 text-center text-xs text-[#7A675B]">Loading categories…</p>}
            {categoriesQuery.isError && (
              <p role="alert" className="col-span-2 py-4 text-center text-xs text-red-700">
                Categories could not be loaded.
                <button type="button" className="ml-2 underline" onClick={() => categoriesQuery.refetch()}>Retry</button>
              </p>
            )}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="group flex flex-col bg-[#FFFDF9] rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-2xs hover:shadow-sm transition-all"
              >
                {/* Photo */}
                <div className="w-full aspect-[148/72] overflow-hidden">
                  {cat.image ? <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  /> : <div className="w-full h-full flex items-center justify-center bg-[#EAE2D5] text-[8px] text-[#7A675B]">Photo coming soon</div>}
                </div>

                {/* Details */}
                <div className="p-2 flex items-center justify-between">
                  <div className="flex-1 pr-1">
                    <div className="flex items-center gap-1 text-[#8C6D3B] mb-0.5">
                      {cat.icon}
                      <span className="font-serif text-[11px] font-bold text-[#241B16] leading-none">
                        {cat.name}
                      </span>
                    </div>
                    <p className="text-[7.5px] text-[#7A675B] leading-tight line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#EFE8DC] text-[#8C6D3B] group-hover:bg-[#8C6D3B] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                    <ArrowRight size={10} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Custom Furniture Made for You */}
        <section className="px-4 py-4">
          <div className="relative rounded-2xl overflow-hidden bg-[#2D1F18] text-[#FAF7F2] p-5 shadow-md">
            <div className="absolute right-0 top-0 bottom-0 w-[50%] pointer-events-none">
              <img
                src="/assets/collections-custom-artisan.jpg"
                alt="Custom Wood Carving"
                className="w-full h-full object-cover object-left"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D1F18] via-[#2D1F18]/70 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-[190px]">
              <h3 className="font-serif text-[17px] font-bold text-[#FAF7F2] leading-tight mb-1.5">
                Custom Furniture<br />Made for You
              </h3>
              <p className="text-[9.5px] text-[#D8C9BC] leading-relaxed mb-3">
                Get furniture designed to fit your space, style and needs perfectly.
              </p>
              <button
                type="button"
                onClick={handleCustomEnquiry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#8C6D3B] to-[#6E4F28] hover:from-[#A07D45] hover:to-[#7E5A2E] text-[#FFF] text-[9.5px] font-semibold tracking-wide shadow-sm transition-all"
              >
                <Wrench size={11} />
                <span>Request Custom Design</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </section>

        {/* Section: Bestsellers */}
        <section className="px-4 py-3 bg-[#FAF7F2] border-t border-b border-[#EAE1D2]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
            <h3 className="font-serif text-[13px] font-bold text-[#3B281C] tracking-wide text-center">
              Bestsellers
            </h3>
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {featuredProductsQuery.isLoading && <p className="col-span-3 py-5 text-center text-xs text-[#7A675B]">Loading featured products…</p>}
            {featuredProductsQuery.isError && (
              <p role="alert" className="col-span-3 py-4 text-center text-xs text-red-700">
                Featured products could not be loaded.
                <button type="button" className="ml-2 underline" onClick={() => featuredProductsQuery.refetch()}>Retry</button>
              </p>
            )}
            {bestsellers.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFDF9] rounded-xl border border-[#E8DFC8] overflow-hidden shadow-2xs product-card flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-[4/3] overflow-hidden">
                    {item.images?.length ? (
                      <img
                        src={item.images.find(image => image.isPrimary)?.url || item.images[0].url || item.images[0].filePath}
                        alt={item.images.find(image => image.isPrimary)?.altText || item.name}
                        loading="lazy"
                        className="w-full h-full object-cover img-zoom"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#EAE2D5] text-[8px] text-[#7A675B]">
                        Product photos coming soon
                      </div>
                    )}
                  </div>
                  <div className="p-1.5">
                    <h4 className="font-serif text-[9.5px] font-bold text-[#241B16] line-clamp-1 mb-0.5">
                      {item.name}
                    </h4>
                    {/* Model Code — replacing prohibited price/rating */}
                    <span className="text-[8px] font-mono font-medium text-[#7A675B] block mb-1">
                      {item.modelCode}
                    </span>
                  </div>
                </div>

                <div className="px-1.5 pb-1.5">
                  <button
                    type="button"
                    onClick={() => handleEnquire(item)}
                    className="w-full flex items-center justify-center gap-1 py-1 rounded-lg bg-[#3B281C] text-[#FAF7F2] hover:bg-[#5C3E29] text-[8px] font-semibold transition-colors btn-press"
                  >
                    <MessageCircle size={9} />
                    <span>Enquire</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Visit Our Showroom banner */}
        <section className="px-4 py-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#3B281C] text-[#FAF7F2] shadow-sm">
            <div>
              <h4 className="font-serif text-[12px] font-bold text-[#FAF7F2] leading-tight">
                Visit Our Showroom
              </h4>
              <p className="text-[8px] text-[#D8C9BC]">
                Experience the quality, craftsmanship and comfort in person.
              </p>
            </div>
            <a
              href={SHOP_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B69764] text-[#241B16] text-[8.5px] font-bold hover:bg-[#C8A77D] transition-colors flex-shrink-0"
            >
              <MapPin size={9} />
              <span>Get Directions</span>
              <ArrowRight size={8} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
