import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Hammer,
  Leaf,
  Armchair,
  MapPin,
  ArrowRight,
  Star,
  Quote
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SHOP_MAP_URL } from '../../constants/links';

interface CustomerStory {
  id: string;
  image: string;
  alt: string;
  quote: string;
  author: string;
  location: string;
}

const customerStories: CustomerStory[] = [
  {
    id: '1',
    image: '/assets/showcase-living.jpg',
    alt: 'Handcrafted Wooden Sofa in a home setting',
    quote: 'Excellent craftsmanship and genuine solid teak quality. The carved floral armrests and natural walnut polish completely elevated our living room!',
    author: 'Prakash R.',
    location: 'Chennai, Tamil Nadu',
  },
  {
    id: '2',
    image: '/assets/showcase-bedroom.jpg',
    alt: 'Royal Carved Bed in a bedroom setting',
    quote: 'Sturdy, quiet and truly generational. The mortise joints are flawless — zero creaking, solid wood slats, and beautiful antique headboard detailing.',
    author: 'Divya S.',
    location: 'Coimbatore, Tamil Nadu',
  },
  {
    id: '3',
    image: '/assets/showcase-dining.jpg',
    alt: 'Solid Wood Dining Set in a dining room',
    quote: 'The 6-seater dining table is a triumph of design — thick solid timber top, comfortably sculpted chairs, and delivered in pristine condition.',
    author: 'Karthik M.',
    location: 'Madurai, Tamil Nadu',
  },
];

export const ShowcasePage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative bg-[#2B1E17] text-[#FAF7F2] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl">
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase font-semibold block mb-2">
                Homeowner Experiences
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight mb-3">
                Homes Transformed by Handcrafted Wood
              </h1>
              <div className="w-16 h-1 bg-[#B69764] mb-5 rounded-full"></div>
              <p className="text-sm sm:text-base text-[#D4C5B9] leading-relaxed">
                Read firsthand stories and view real living spaces styled with Annamalai Furniture. Over two decades of proud homeowner trust.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-[#B69764] hover:bg-[#A38350] text-[#241B16] font-semibold px-6 py-3 rounded-full text-xs sm:text-sm font-serif transition-colors shadow-md"
                >
                  Browse Catalog
                </Link>
                <a
                  href="#stories-grid"
                  className="border border-[#C8A77D] text-[#FAF7F2] hover:bg-white/10 px-6 py-3 rounded-full text-xs sm:text-sm font-serif transition-colors"
                >
                  Read Reviews
                </a>
              </div>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/assets/testimonials-hero-armchair.jpg"
                alt="Handcrafted Wood Furniture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Testimonials List Section */}
        <section id="stories-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
              Verified Buyers
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#3B281C]">
              Customer Stories & Real Homes
            </h2>
            <div className="w-12 h-0.5 bg-[#B69764] mx-auto my-3"></div>
            <p className="text-xs sm:text-sm text-[#7A675B]">
              Every piece of Annamalai furniture is custom-crafted to blend seamlessly with real family lifestyles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {customerStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#B69764] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-[16/10] overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={story.image}
                      alt={story.alt}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-[#C8A051] mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill="#C8A051" />
                      ))}
                    </div>

                    {/* Quote Text */}
                    <p className="text-xs sm:text-sm text-[#3B281C] italic leading-relaxed">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Author & Location */}
                <div className="px-6 pb-6 pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-serif font-bold text-[#241B16] block">
                      {story.author}
                    </span>
                    <span className="text-xs text-[#8A7569]">
                      {story.location}
                    </span>
                  </div>
                  <div className="text-[#C8A77D]">
                    <Quote size={22} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Why Choose Annamalai Furniture? */}
        <section className="bg-white border-t border-b border-[#EAE2D5] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
                The Annamalai Advantage
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B281C]">
                Why Homeowners Across South India Choose Us
              </h2>
              <div className="w-12 h-0.5 bg-[#B69764] mx-auto my-3"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Award size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">Certified Timber</h4>
                <p className="text-xs text-[#7A675B] mt-1">100% genuine solid teak and rosewood.</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Hammer size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">Master Joinery</h4>
                <p className="text-xs text-[#7A675B] mt-1">Mortise, tenon and dovetail construction.</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Leaf size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">Eco Seasoning</h4>
                <p className="text-xs text-[#7A675B] mt-1">Kiln-dried with zero harmful chemical varnishes.</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Armchair size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">Lifetime Support</h4>
                <p className="text-xs text-[#7A675B] mt-1">Direct artisan repair and repolish services.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Real Homes Photo Gallery */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
              Visual Showcase
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B281C]">
              Living, Dining &amp; Bedroom Installations
            </h3>
            <div className="w-12 h-0.5 bg-[#B69764] mx-auto my-3"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-sm group">
              <img
                src="/assets/showcase-living.jpg"
                alt="Living room installation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-sm group">
              <img
                src="/assets/showcase-bedroom.jpg"
                alt="Bedroom installation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-sm group">
              <img
                src="/assets/showcase-dining.jpg"
                alt="Dining room installation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* Section: Visit Showroom CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="relative rounded-3xl overflow-hidden bg-[#241B16] text-[#FAF7F2] p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg z-10">
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase">
                Visit In Person
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight mt-1 mb-3">
                Experience Handcrafted Comfort Firsthand
              </h3>
              <p className="text-xs sm:text-sm text-[#D8C9BC] leading-relaxed mb-6">
                Walk through our furnished model rooms, test cushion densities, and discuss custom timber options directly with our master woodcraft specialists.
              </p>
              <a
                href={SHOP_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B69764] hover:bg-[#A38350] text-[#241B16] text-xs sm:text-sm font-serif font-bold shadow-md transition-all"
              >
                <MapPin size={16} />
                <span>Get Directions to Our Showroom</span>
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden border border-[#523B2F] shadow-xl">
              <img
                src="/assets/about-showroom.jpg"
                alt="Annamalai Furniture Showroom"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
