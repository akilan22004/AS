import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      headlinePost: 'Made for Home.',
      subtitle: 'Timeless wooden furniture that brings comfort, beauty and lasting value to your space.',
      buttonText: 'Explore Collection',
      link: '/products',
    },
    {
      image: '/assets/cat-beds.jpg',
      alt: 'Royal Comfort. Handcrafted Sleep.',
      eyebrow: 'ROYAL SUITES',
      headlinePre: 'Restful Sleep.',
      headlinePost: 'Built for Generations.',
      subtitle: 'Handcrafted solid teak beds designed for supreme ergonomic comfort and timeless bedroom elegance.',
      buttonText: 'View Bed Collection',
      link: '/collections/beds',
    },
    {
      image: '/assets/cat-dining.jpg',
      alt: 'Timeless Gathering. Art of Dining.',
      eyebrow: 'FAMILY & HERITAGE',
      headlinePre: 'Gather Together.',
      headlinePost: 'Around Natural Wood.',
      subtitle: 'Artisanal dining sets crafted from durable solid timber to celebrate memorable family moments.',
      buttonText: 'Explore Dining',
      link: '/products?category=dining-tables',
    },
  ];

  // Auto-advance hero carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
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

  // Featured Collection Slider State & Auto-rotation
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
    }, 6000);
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
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section
          className="relative bg-[#EAE2D5] overflow-hidden"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          {/* Hero Image with smooth transition */}
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#241B16]">
            <img
              key={currentHero.image}
              src={currentHero.image}
              alt={currentHero.alt}
              className="w-full h-full object-cover object-center animate-fade-in"
            />
            {/* Carousel navigation arrows */}
            <button
              onClick={prevHeroSlide}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-[2px] btn-press z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextHeroSlide}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-[2px] btn-press z-10"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Hero Typography & CTA */}
          <div className="px-5 pt-4 pb-3 text-center bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC]">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="w-6 h-[1px] bg-[#B69764]"></span>
              <span className="font-serif tracking-[0.22em] text-[8.5px] uppercase text-[#735A4B] font-semibold">
                {currentHero.eyebrow}
              </span>
              <span className="w-6 h-[1px] bg-[#B69764]"></span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-[26px] leading-[1.15] text-[#332218] font-bold tracking-tight">
              {currentHero.headlinePre}<br />
              <span className="font-serif italic font-normal text-[#493326]">{currentHero.headlinePost}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-[11px] text-[#695446] leading-relaxed max-w-[280px] mx-auto font-sans">
              {currentHero.subtitle}
            </p>

            {/* CTA Button */}
            <div className="mt-3.5 mb-2.5">
              <Link
                to={currentHero.link}
                className="inline-flex items-center gap-2 bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] px-5 py-2 rounded-full font-serif text-[12px] tracking-wide transition-all shadow-sm btn-press"
              >
                <span>{currentHero.buttonText}</span>
                <span className="text-sm">→</span>
              </Link>
            </div>

            {/* Interactive Carousel Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === heroIndex
                      ? 'w-4 h-1.5 bg-[#B69764]'
                      : 'w-1.5 h-1.5 bg-[#C8A77D]/50 hover:bg-[#B69764]/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 2. Explore Our Categories Section */}
        <section className="px-4 py-5 bg-[#F7F3EC]">
          {/* Section Heading with decorative flourishes */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <svg className="w-6 h-2 text-[#B69764]" viewBox="0 0 24 8" fill="none" stroke="currentColor">
              <path d="M1 4C5 1 9 7 13 4C17 1 21 7 23 4" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <h2 className="font-serif text-[18px] text-[#241B16] font-bold text-center tracking-tight">
              Explore Our Categories
            </h2>
            <svg className="w-6 h-2 text-[#B69764]" viewBox="0 0 24 8" fill="none" stroke="currentColor">
              <path d="M1 4C5 1 9 7 13 4C17 1 21 7 23 4" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* 8 Categories Grid (4 columns x 2 rows) */}
          <div className="grid grid-cols-4 gap-2">
            {categoriesQuery.isLoading && <p className="col-span-4 py-6 text-center text-xs text-[#7A675B]">Loading categories…</p>}
            {categoriesQuery.isError && (
              <p role="alert" className="col-span-4 py-4 text-center text-xs text-red-700">
                Categories could not be loaded.
                <button type="button" className="ml-2 underline" onClick={() => categoriesQuery.refetch()}>Retry</button>
              </p>
            )}
            {categories.map((cat) => (
              <div
                key={cat.slug}
                onClick={() => navigate(`/products?category=${cat.slug}`)}
                className="cursor-pointer group flex flex-col items-center"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#E2D8C9] border border-[#DDD1C0] shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-[1.03]">
                  {cat.image ? <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center img-zoom"
                  /> : <div className="w-full h-full flex items-center justify-center bg-[#EAE2D5] text-[8px] text-[#7A675B]">Photo coming soon</div>}
                </div>
                <span className="mt-1.5 font-serif text-[10.5px] text-[#241B16] font-semibold text-center leading-tight group-hover:text-[#B69764] transition-colors duration-200">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured Collection Section (Dark Wood Wave Banner) */}
        <section
          className="bg-[#38261D] text-[#F7F3EC] py-5 px-4 relative overflow-hidden"
          onTouchStart={handleFeaturedTouchStart}
          onTouchEnd={handleFeaturedTouchEnd}
        >
          {/* Header */}
          <div className="text-center mb-3">
            <h2 className="font-serif text-[18px] text-[#F7F3EC] font-bold tracking-tight">
              Featured Collection
            </h2>
            <p className="text-[10px] text-[#C8A77D] tracking-wide mt-0.5">
              Handpicked designs for modern Indian homes
            </p>
          </div>

          {/* Featured Carousel Card with interactive link & controls */}
          <div
            onClick={() => currentFeatured && navigate(currentFeatured.link)}
            className="cursor-pointer relative rounded-2xl overflow-hidden border border-[#523B2F] shadow-lg max-w-[380px] mx-auto aspect-[16/7] bg-[#241B16] group"
          >
            {currentFeatured ? (
              <img
                key={currentFeatured.image}
                src={currentFeatured.image}
                alt={currentFeatured.alt}
                className="w-full h-full object-cover animate-fade-in group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#D4C5B9]">
                {featuredProductsQuery.isLoading ? 'Loading featured products…' : 'Featured products will appear here.'}
              </div>
            )}
            {/* Gradient overlay at bottom with title info */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3 pointer-events-none">
              <span className="font-serif text-[13px] font-bold text-[#F7F3EC] leading-tight">
                {currentFeatured?.title}
              </span>
              <span className="text-[9px] text-[#C8A77D] mt-0.5 font-sans">
                {currentFeatured?.subtitle}
              </span>
            </div>

            {/* Arrows */}
            {featuredSlides.length > 1 && <button
              onClick={(e) => {
                e.stopPropagation();
                prevFeaturedSlide();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors btn-press z-10"
              aria-label="Previous featured item"
            >
              <ChevronLeft size={14} />
            </button>}
            {featuredSlides.length > 1 && <button
              onClick={(e) => {
                e.stopPropagation();
                nextFeaturedSlide();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors btn-press z-10"
              aria-label="Next featured item"
            >
              <ChevronRight size={14} />
            </button>}
          </div>

          {/* Interactive Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {featuredSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setFeaturedIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === featuredIndex
                    ? 'w-4 h-1.5 bg-[#B69764]'
                    : 'w-1.5 h-1.5 bg-[#523B2F] hover:bg-[#B69764]/60'
                }`}
                aria-label={`Go to featured slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* 4. The Beauty of Craftsmanship Section */}
        <section className="px-4 py-5 bg-[#F7F3EC]">
          <div className="flex items-center gap-3">
            {/* Left: Artisan photo */}
            <div className="w-[48%] rounded-2xl overflow-hidden aspect-[175/140] bg-[#E2D8C9] border border-[#DDD1C0] shadow-md flex-shrink-0">
              <img
                src="/assets/craft-artisan-senior.jpg"
                alt="Woodcarving Artisan"
                loading="lazy"
                className="w-full h-full object-cover img-zoom"
              />
            </div>

            {/* Right: Text and CTA */}
            <div className="flex-1">
              <h3 className="font-serif text-[17px] text-[#241B16] font-bold leading-tight">
                The Beauty of<br />Craftsmanship
              </h3>
              <div className="w-8 h-[1.5px] bg-[#B69764] my-2" />
              <p className="text-[9.5px] text-[#695446] leading-relaxed font-sans">
                Skilled hands, natural wood and timeless techniques come together to create furniture that lasts for generations.
              </p>
              <Link
                to="/craftsmanship"
                className="mt-2.5 inline-flex items-center gap-1.5 border border-[#493326] text-[#493326] hover:bg-[#493326] hover:text-[#F7F3EC] px-3 py-1 rounded-full text-[10px] font-serif transition-all btn-press"
              >
                <span>Our Craft Story</span>
                <span className="text-xs">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Dining Showcase Photograph */}
        <section className="w-full aspect-[16/7] overflow-hidden bg-[#241B16]">
          <img
            src="/assets/dining-showcase.jpg"
            alt="Handcrafted Dining Space"
            loading="lazy"
            className="w-full h-full object-cover img-zoom"
          />
        </section>

        {/* 6. WhatsApp Requirement Banner */}
        <WhatsAppBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
