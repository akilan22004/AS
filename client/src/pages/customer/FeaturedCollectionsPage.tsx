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
    sofas: <Sofa size={18} />,
    beds: <Bed size={18} />,
    dining: <UtensilsCrossed size={18} />,
    'dining-tables': <UtensilsCrossed size={18} />,
    wardrobes: <DoorClosed size={18} />,
    'tv-units': <Tv size={18} />,
    'dressing-tables': <Sparkles size={18} />,
  };
  const categories = (categoriesQuery.data || []).map((category: Category) => ({
    id: category.id,
    name: category.name,
    subtitle: category.description || 'Handcrafted for lasting comfort and style.',
    image: category.coverImage,
    link: category.slug === 'beds' ? '/collections/beds' : `/products?category=${encodeURIComponent(category.slug)}`,
    icon: categoryIcons[category.slug] || <Sparkles size={18} />,
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
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative bg-[#2B1E17] text-[#FAF7F2] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl">
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase font-semibold block mb-2">
                Annamalai Heritage Catalog
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight mb-3">
                Curated Handcrafted Collections
              </h1>
              <div className="w-16 h-1 bg-[#B69764] mb-5 rounded-full"></div>
              <p className="text-sm sm:text-base text-[#D4C5B9] leading-relaxed">
                Explore an extensive range of solid teak, rosewood, and hardwood furniture created for gracious homes, resorts, and modern living sanctuaries.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#categories-section"
                  className="bg-[#B69764] hover:bg-[#A38350] text-[#241B16] font-semibold px-6 py-3 rounded-full text-xs sm:text-sm font-serif transition-colors shadow-md"
                >
                  Explore Categories
                </a>
                <button
                  onClick={handleCustomEnquiry}
                  className="border border-[#C8A77D] text-[#FAF7F2] hover:bg-white/10 px-6 py-3 rounded-full text-xs sm:text-sm font-serif transition-colors"
                >
                  Custom Design
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/assets/collections-hero-armchair.jpg"
                alt="Handcrafted Wood Furniture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* 4 Feature Badges */}
        <section className="bg-white border-b border-[#EAE2D5] py-8 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <TreePine size={22} />
                </div>
                <span className="text-sm font-serif font-bold text-[#3B281C]">Seasoned Timber</span>
                <span className="text-xs text-[#7A675B] mt-0.5">Teak, Rosewood, Mahogany</span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Hammer size={22} />
                </div>
                <span className="text-sm font-serif font-bold text-[#3B281C]">Handcrafted Joinery</span>
                <span className="text-xs text-[#7A675B] mt-0.5">Dovetail & tenon construction</span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Diamond size={22} />
                </div>
                <span className="text-sm font-serif font-bold text-[#3B281C]">Generational Strength</span>
                <span className="text-xs text-[#7A675B] mt-0.5">Natural oil hand-rubbed finish</span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Truck size={22} />
                </div>
                <span className="text-sm font-serif font-bold text-[#3B281C]">White-Glove Delivery</span>
                <span className="text-xs text-[#7A675B] mt-0.5">Fully assembled & positioned</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Explore by Category */}
        <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
              Browse Living Spaces
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#3B281C]">
              Explore by Furniture Category
            </h2>
            <div className="w-12 h-0.5 bg-[#B69764] mx-auto my-3"></div>
            <p className="text-xs sm:text-sm text-[#7A675B]">
              Select a room collection to view available models, materials, and customization choices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoriesQuery.isLoading && <p className="col-span-full py-12 text-center text-sm text-[#7A675B]">Loading collections…</p>}
            {categoriesQuery.isError && (
              <p role="alert" className="col-span-full py-8 text-center text-sm text-red-700 bg-red-50 rounded-2xl p-4">
                Categories could not be loaded.
                <button type="button" className="ml-2 underline font-semibold" onClick={() => categoriesQuery.refetch()}>Retry</button>
              </p>
            )}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="group flex flex-col bg-white rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#B69764] transition-all"
              >
                {/* Photo */}
                <div className="w-full aspect-[16/10] overflow-hidden bg-[#FAF7F2]">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#EAE2D5] text-xs text-[#7A675B]">
                      Photo coming soon
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 text-[#8C6D3B] mb-1">
                      {cat.icon}
                      <span className="font-serif text-base font-bold text-[#241B16]">
                        {cat.name}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A675B] line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#EFE8DC] text-[#8C6D3B] group-hover:bg-[#8C6D3B] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-xs">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Custom Furniture Made for You */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative rounded-3xl overflow-hidden bg-[#2D1F18] text-[#FAF7F2] p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl z-10">
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase">
                Bespoke Atelier Service
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight mt-1 mb-3">
                Custom Furniture Crafted to Your Architecture
              </h3>
              <p className="text-xs sm:text-sm text-[#D8C9BC] leading-relaxed mb-6">
                Have specific dimensions, fabric upholstery, or wood species in mind? Our woodcarvers and master artisans turn your sketches or blueprints into heirloom furniture.
              </p>
              <button
                type="button"
                onClick={handleCustomEnquiry}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B69764] hover:bg-[#A38350] text-[#241B16] text-xs sm:text-sm font-serif font-bold shadow-md transition-all cursor-pointer"
              >
                <Wrench size={16} />
                <span>Request Custom Blueprint Consultation</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden border border-[#523B2F] shadow-xl">
              <img
                src="/assets/collections-custom-artisan.jpg"
                alt="Custom Wood Carving"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Section: Featured Bestsellers */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
              Customer Favorites
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#3B281C]">
              Signature Masterpieces
            </h3>
            <div className="w-12 h-0.5 bg-[#B69764] mx-auto my-3"></div>
            <p className="text-xs sm:text-sm text-[#7A675B]">
              Handcrafted pieces most requested by homeowners and interior decorators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProductsQuery.isLoading && <p className="col-span-full py-12 text-center text-sm text-[#7A675B]">Loading featured products…</p>}
            {featuredProductsQuery.isError && (
              <p role="alert" className="col-span-full py-8 text-center text-sm text-red-700 bg-red-50 rounded-2xl p-4">
                Featured products could not be loaded.
                <button type="button" className="ml-2 underline font-semibold" onClick={() => featuredProductsQuery.refetch()}>Retry</button>
              </p>
            )}
            {bestsellers.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#B69764] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full aspect-[4/3] overflow-hidden bg-[#FAF7F2] relative">
                    {item.images?.length ? (
                      <img
                        src={item.images.find(image => image.isPrimary)?.url || item.images[0].url || item.images[0].filePath}
                        alt={item.images.find(image => image.isPrimary)?.altText || item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#EAE2D5] text-xs text-[#7A675B]">
                        Product photos coming soon
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                      {item.modelCode}
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-serif text-base font-bold text-[#241B16] line-clamp-1 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#695446] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${item.slug}`)}
                    className="flex-1 py-2.5 rounded-full border border-[#241B16] text-[#241B16] hover:bg-[#241B16] hover:text-white text-xs font-serif font-semibold transition-colors text-center"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnquire(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#B69764] text-[#241B16] hover:bg-[#A38350] text-xs font-serif font-bold transition-colors shadow-sm"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Visit Our Showroom banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-10 rounded-3xl bg-[#241B16] text-[#FAF7F2] shadow-xl gap-6">
            <div>
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase">
                Showroom & Workshop
              </span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight mt-1">
                Experience Handcrafted Solid Wood in Person
              </h4>
              <p className="text-xs sm:text-sm text-[#D8C9BC] mt-1.5 max-w-lg">
                Visit our Tamil Nadu showroom to touch the timber grain, inspect the mortise-and-tenon joints, and consult with our woodcraft master.
              </p>
            </div>
            <a
              href={SHOP_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B69764] text-[#241B16] text-xs sm:text-sm font-serif font-bold hover:bg-[#C8A77D] transition-colors flex-shrink-0 shadow-md"
            >
              <MapPin size={16} />
              <span>Get Directions to Showroom</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
