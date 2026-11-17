import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Shield, Award, ArrowRight } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import { useQuery } from '@tanstack/react-query';
import { api, DEFAULT_CATEGORIES } from '../../services/api';
import { Category } from '../../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    initialData: DEFAULT_CATEGORIES,
  });
  const featuredProductsQuery = useQuery({ queryKey: ['featured-products'], queryFn: api.getFeaturedProducts });

  // Hero Carousel State & Auto-rotation
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTouchStartX = useRef<number | null>(null);

  const heroSlides = [
    {
      image: '/assets/hero-sofa.jpg',
      alt: 'Crafted by Hand. Made for Home.',
      eyebrow: 'THE ART OF WOOD',
      headlinePre: 'Crafted by Hand.',
      headlinePost: 'Made for Generations.',
      subtitle: 'Timeless solid wood furniture sculpted from seasoned Teak, Rosewood and Sheesham for gracious living.',
      buttonText: 'Explore Collection',
      link: '/products',
    },
    {
      image: '/assets/cat-beds.jpg',
      alt: 'Royal Comfort. Handcrafted Sleep.',
      eyebrow: 'ROYAL BEDROOM SUITES',
      headlinePre: 'Restful Sleep.',
      headlinePost: 'Built from Solid Teak.',
      subtitle: 'Handcrafted solid wood beds designed for supreme ergonomic comfort and regal bedroom elegance.',
      buttonText: 'View Bed Collection',
      link: '/collections/beds',
    },
    {
      image: '/assets/cat-dining.jpg',
      alt: 'Timeless Gathering. Art of Dining.',
      eyebrow: 'FAMILY & HERITAGE',
      headlinePre: 'Gather Together.',
      headlinePost: 'Around Natural Wood.',
      subtitle: 'Artisanal dining sets crafted from durable solid timber to celebrate memorable family gatherings.',
      buttonText: 'Explore Dining',
      link: '/products?category=dining-tables',
    },
  ];

  // Auto-advance hero carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevHeroSlide = () => {
    setHeroIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const nextHeroSlide = () => {
    setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    heroTouchStartX.current = e.touches[0].clientX;
  };

  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    if (heroTouchStartX.current === null) return;
    const diff = heroTouchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextHeroSlide();
    } else if (diff < -40) {
      prevHeroSlide();
    }
    heroTouchStartX.current = null;
  };

  // Featured Collection Slider State
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredTouchStartX = useRef<number | null>(null);

  const featuredSlides = (featuredProductsQuery.data || [])
    .map(product => {
      const image = [...product.images]
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder)[0];
      return image ? {
        image: image.url || image.filePath,
        alt: image.altText || product.name,
        title: product.name,
        subtitle: product.category?.name || product.modelCode,
        material: product.material || 'Solid Wood',
        link: `/products/${product.slug}`,
      } : null;
    })
    .filter((slide): slide is NonNullable<typeof slide> => slide !== null);

  useEffect(() => {
    if (featuredSlides.length < 2) {
      setFeaturedIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredSlides.length]);

  const prevFeaturedSlide = () => {
    if (featuredSlides.length < 2) return;
    setFeaturedIndex((prev) => (prev === 0 ? featuredSlides.length - 1 : prev - 1));
  };

  const nextFeaturedSlide = () => {
    if (featuredSlides.length < 2) return;
    setFeaturedIndex((prev) => (prev + 1) % featuredSlides.length);
  };

  const handleFeaturedTouchStart = (e: React.TouchEvent) => {
    featuredTouchStartX.current = e.touches[0].clientX;
  };

  const handleFeaturedTouchEnd = (e: React.TouchEvent) => {
    if (featuredTouchStartX.current === null) return;
    const diff = featuredTouchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextFeaturedSlide();
    } else if (diff < -40) {
      prevFeaturedSlide();
    }
    featuredTouchStartX.current = null;
  };

  const categories = (categoriesQuery.data || []).map((category: Category) => ({
    name: category.name,
    slug: category.slug,
    image: category.coverImage,
  }));

  const currentHero = heroSlides[heroIndex];
  const currentFeatured = featuredSlides.length
    ? featuredSlides[Math.min(featuredIndex, featuredSlides.length - 1)]
    : null;

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans relative overflow-x-hidden transition-colors">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* 1. Hero Section (Responsive Full-Width / Max-7xl) */}
        <section
          className="relative bg-[#1C1511] overflow-hidden"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 lg:py-8">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden sm:rounded-3xl shadow-2xl bg-[#140E0A]">
              <img
                key={currentHero.image}
                src={currentHero.image}
                alt={currentHero.alt}
                className="w-full h-full object-cover object-center animate-fade-in scale-[1.02] transition-transform duration-1000"
                loading="eager"
              />
              
              {/* Deep Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/55 sm:via-black/40 to-transparent flex flex-col justify-end sm:justify-center p-6 sm:p-12 lg:p-16">
                <div className="max-w-xl text-left">
                  {/* Eyebrow */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="w-6 h-[1.5px] bg-[#C8A77D]"></span>
                    <span className="font-serif tracking-[0.25em] text-[9px] sm:text-xs uppercase text-[#C8A77D] font-semibold">
                      {currentHero.eyebrow}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl leading-[1.15] text-[#F7F3EC] font-bold tracking-tight">
                    {currentHero.headlinePre}{' '}
                    <span className="font-serif italic font-normal text-[#D8C2AA] block sm:inline">
                      {currentHero.headlinePost}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm lg:text-base text-[#D4C3B5] leading-relaxed max-w-lg font-sans">
                    {currentHero.subtitle}
                  </p>

                  {/* CTA Button */}
                  <div className="mt-5 sm:mt-8 flex items-center gap-3">
                    <Link
                      to={currentHero.link}
                      className="inline-flex items-center gap-2 bg-[#FAF8F5] hover:bg-[#C8A77D] text-[#1C1511] px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-serif text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-lg hover:shadow-xl btn-press"
                    >
                      <span>{currentHero.buttonText}</span>
                      <ArrowRight size={15} />
                    </Link>
                    <Link
                      to="/craftsmanship"
                      className="hidden sm:inline-flex items-center gap-2 border border-white/30 hover:border-white text-white px-6 py-3.5 rounded-full font-serif text-sm transition-all"
                    >
                      <span>Our Craft Story</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevHeroSlide}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextHeroSlide}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === heroIndex
                        ? 'w-6 sm:w-8 h-1.5 bg-[#C8A77D]'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Explore Our Categories (Responsive 4-col mobile, 8-col desktop) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-8 h-[1px] bg-[#B69764]" />
              <span className="font-serif tracking-[0.2em] text-[10px] sm:text-xs uppercase text-[#8A7569] font-semibold">
                Curated Collections
              </span>
              <span className="w-8 h-[1px] bg-[#B69764]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#241B16] font-bold tracking-tight">
              Explore Our Handcrafted Categories
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#695446] leading-relaxed">
              From majestic solid wood sofas to handcrafted royal beds, discover master craftsmanship for every room.
            </p>
          </div>

          {/* Dynamic Responsive Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
            {categoriesQuery.isLoading && (
              <p className="col-span-full py-8 text-center text-xs text-[#7A675B] font-serif">
                Loading categories…
              </p>
            )}
            {categoriesQuery.isError && (
              <div role="alert" className="col-span-full py-6 text-center text-xs text-red-700">
                Categories could not be loaded.
                <button type="button" className="ml-2 underline font-bold" onClick={() => categoriesQuery.refetch()}>Retry</button>
              </div>
            )}
            {categories.map((cat) => (
              <div
                key={cat.slug}
                onClick={() => navigate(`/products?category=${cat.slug}`)}
                className="cursor-pointer group flex flex-col items-center bg-white p-2.5 sm:p-3 rounded-2xl border border-[#EAE2D5] shadow-sm hover:shadow-md hover:border-[#C8A77D] transition-all duration-300"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#F2ECE1] border border-[#EFE8DC] mb-2 sm:mb-2.5">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F2ECE1] text-[9px] text-[#8A7569] p-2 text-center">
                      {cat.name}
                    </div>
                  )}
                </div>
                <span className="font-serif text-xs sm:text-sm text-[#241B16] font-semibold text-center leading-tight group-hover:text-[#B69764] transition-colors">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured Collection Section (Dark Walnut Banner) */}
        <section
          className="bg-[#241B16] text-[#F7F3EC] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
          onTouchStart={handleFeaturedTouchStart}
          onTouchEnd={handleFeaturedTouchEnd}
        >
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <span className="font-serif tracking-[0.25em] text-[10px] sm:text-xs text-[#C8A77D] uppercase font-semibold block mb-2">
                Handpicked Masterpieces
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#F7F3EC] font-bold tracking-tight">
                Featured Collection
              </h2>
              <p className="text-xs sm:text-sm text-[#D4C3B5] mt-2 leading-relaxed">
                Signature bespoke furniture celebrating the natural grain and strength of solid Indian timber.
              </p>
            </div>

            {/* Featured Slider Card */}
            <div
              onClick={() => currentFeatured && navigate(currentFeatured.link)}
              className="cursor-pointer relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#3E2D22] shadow-2xl max-w-4xl mx-auto aspect-[16/9] sm:aspect-[21/9] bg-[#1A130E] group"
            >
              {currentFeatured ? (
                <img
                  key={currentFeatured.image}
                  src={currentFeatured.image}
                  alt={currentFeatured.alt}
                  className="w-full h-full object-cover animate-fade-in group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#D4C5B9] font-serif">
                  {featuredProductsQuery.isLoading ? 'Loading featured products…' : 'Featured products will appear here.'}
                </div>
              )}

              {/* Gradient Overlay with Details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-5 sm:p-10 pointer-events-none">
                <span className="font-serif text-base sm:text-2xl lg:text-3xl font-bold text-[#F7F3EC] leading-tight">
                  {currentFeatured?.title}
                </span>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs sm:text-sm text-[#C8A77D]">
                  <span>{currentFeatured?.subtitle}</span>
                  {currentFeatured?.material && (
                    <>
                      <span>•</span>
                      <span className="text-[#D4C3B5]">{currentFeatured.material}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Slider Arrows */}
              {featuredSlides.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevFeaturedSlide();
                    }}
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all z-10"
                    aria-label="Previous featured item"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextFeaturedSlide();
                    }}
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all z-10"
                    aria-label="Next featured item"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Slider Dots */}
            {featuredSlides.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
                {featuredSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeaturedIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === featuredIndex
                        ? 'w-6 h-1.5 bg-[#C8A77D]'
                        : 'w-1.5 h-1.5 bg-[#523B2F] hover:bg-[#C8A77D]/60'
                    }`}
                    aria-label={`Go to featured slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 4. The Beauty of Craftsmanship (Split-Screen on Desktop) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="bg-white rounded-3xl border border-[#EAE2D5] shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              
              {/* Left Photo */}
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#E2D8C9] border border-[#DDD1C0] shadow-md">
                <img
                  src="/assets/craft-artisan-senior.jpg"
                  alt="Senior Woodcarving Artisan at Annamalai Workshop"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Narrative */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-[1.5px] bg-[#B69764]" />
                  <span className="font-serif tracking-[0.2em] text-[10px] sm:text-xs uppercase text-[#8A7569] font-semibold">
                    Generations of Mastery
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#241B16] font-bold leading-tight">
                  The Beauty of Genuine Handcrafted Wood
                </h3>
                <p className="text-xs sm:text-sm text-[#695446] leading-relaxed font-sans">
                  Unlike mass-produced engineered boards, every single creation at Annamalai Furniture begins with seasoned whole logs of solid Teak, Rosewood, and Sheesham. Traditional mortise-and-tenon joints, hand-carved motifs, and organic oil polishes give our furniture the soul to endure across lifetimes.
                </p>

                {/* Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#F2ECE1]">
                  <div className="text-center p-3 rounded-xl bg-[#FAF8F5]">
                    <Shield className="w-5 h-5 mx-auto text-[#B69764] mb-1" />
                    <span className="block font-serif text-xs font-bold text-[#241B16]">100% Solid</span>
                    <span className="text-[9px] text-[#8A7569]">Zero MDF or particle board</span>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#FAF8F5]">
                    <Sparkles className="w-5 h-5 mx-auto text-[#B69764] mb-1" />
                    <span className="block font-serif text-xs font-bold text-[#241B16]">Hand Carved</span>
                    <span className="text-[9px] text-[#8A7569]">Artisanal crests & fluting</span>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#FAF8F5]">
                    <Award className="w-5 h-5 mx-auto text-[#B69764] mb-1" />
                    <span className="block font-serif text-xs font-bold text-[#241B16]">Direct Delivery</span>
                    <span className="text-[9px] text-[#8A7569]">Direct from workshop</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/craftsmanship"
                    className="inline-flex items-center gap-2 bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] px-6 py-2.5 rounded-full text-xs font-serif font-semibold transition-all shadow-sm"
                  >
                    <span>Read Our Wood Story</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Full-Width Dining Showcase */}
        <section className="relative w-full aspect-[16/7] sm:aspect-[21/8] overflow-hidden bg-[#241B16]">
          <img
            src="/assets/dining-showcase.jpg"
            alt="Handcrafted Dining Space"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 sm:p-12">
            <div className="max-w-xl text-white">
              <span className="font-serif tracking-[0.2em] text-[10px] sm:text-xs text-[#C8A77D] uppercase font-semibold block mb-1">
                Bespoke Dining Sets
              </span>
              <h3 className="font-serif text-xl sm:text-3xl font-bold leading-tight">
                Designed for Lifetime Family Gatherings
              </h3>
            </div>
          </div>
        </section>

        {/* 6. WhatsApp Requirement Banner */}
        <WhatsAppBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
