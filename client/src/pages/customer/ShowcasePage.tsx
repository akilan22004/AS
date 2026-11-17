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
}

const customerStories: CustomerStory[] = [
  {
    id: '1',
    image: '/assets/showcase-living.jpg',
    alt: 'Handcrafted Wooden Sofa in a home setting',
    quote: 'Excellent craftsmanship and premium wood quality. The sofa completely transformed our living room!',
    author: 'Prakash R.',
  },
  {
    id: '2',
    image: '/assets/showcase-bedroom.jpg',
    alt: 'Royal Carved Bed in a bedroom setting',
    quote: 'Sturdy, elegant and truly long-lasting. The bed is super comfortable and beautifully designed.',
    author: 'Divya S.',
  },
  {
    id: '3',
    image: '/assets/showcase-dining.jpg',
    alt: 'Solid Wood Dining Set in a dining room',
    quote: 'The dining table is just perfect — solid, stylish and spacious for our family.',
    author: 'Karthik M.',
  },
];

export const ShowcasePage: React.FC = () => {
  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative px-5 pt-6 pb-6 bg-[#2B1E17] text-[#FAF7F2] overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none">
            <img
              src="/assets/testimonials-hero-armchair.jpg"
              alt="Handcrafted Wood Furniture"
              className="w-full h-full object-cover object-left opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B1E17] via-[#2B1E17]/60 to-transparent"></div>
          </div>

          <div className="max-w-[210px] relative z-10">
            <h1 className="font-serif text-[24px] text-[#FAF7F2] font-bold leading-tight tracking-tight mb-2">
              Customer<br />Testimonials
            </h1>
            <div className="w-9 h-[1.5px] bg-[#B69764] mb-3"></div>
            <p className="text-[10px] text-[#D4C5B9] leading-relaxed">
              Real stories from our valued customers who have brought the warmth of Annamalai Furniture into their homes.
            </p>
          </div>
        </section>

        {/* Decorative Wave Divider */}
        <div className="relative w-full h-4 bg-[#2B1E17]">
          <div className="absolute inset-0 bg-[#F7F3EC] rounded-t-[20px]"></div>
        </div>

        {/* Testimonials List */}
        <section className="px-4 py-3 space-y-3">
          {customerStories.map((story) => (
            <div
              key={story.id}
              className="flex bg-[#FFFDF9] rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-sm p-2.5 gap-2.5 items-stretch card-hover"
            >
              {/* Left Photo */}
              <div className="w-[125px] flex-shrink-0 rounded-xl overflow-hidden border border-[#EDE2D4]">
                <img
                  src={story.image}
                  alt={story.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col justify-between py-0.5 relative">
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 text-[#C8A051] mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="#C8A051" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-[9.5px] text-[#3B281C] italic leading-tight line-clamp-3">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>

                {/* Author & Quote Mark */}
                <div className="flex items-end justify-between pt-2 border-t border-[#F2ECE1]">
                  <div>
                    <span className="text-[9.5px] font-bold text-[#241B16] block leading-tight">
                      — {story.author}
                    </span>
                  </div>
                  <div className="text-[#DFCBB5]">
                    <Quote size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Section: Why Choose Annamalai Furniture? */}
        <section className="px-3 py-4 mt-2 bg-[#FAF7F2] border-t border-b border-[#EAE1D2]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
            <h2 className="font-serif text-[13px] font-bold text-[#3B281C] tracking-wide text-center">
              Why Choose Annamalai Furniture?
            </h2>
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Award size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Trusted<br />Quality
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Hammer size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Skilled<br />Artisans
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Leaf size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Sustainable<br />&amp; Natural Wood
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Armchair size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Timeless<br />Designs
              </span>
            </div>
          </div>
        </section>

        {/* Section: Our Happy Homes */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
            <h3 className="font-serif text-[13px] font-bold text-[#3B281C] tracking-wide text-center">
              Our Happy Homes
            </h3>
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-[1/1] rounded-xl overflow-hidden border border-[#D9CDBF] shadow-2xs">
              <img
                src="/assets/showcase-living.jpg"
                alt="Living room setup"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-[1/1] rounded-xl overflow-hidden border border-[#D9CDBF] shadow-2xs">
              <img
                src="/assets/showcase-bedroom.jpg"
                alt="Bedroom setup"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-[1/1] rounded-xl overflow-hidden border border-[#D9CDBF] shadow-2xs">
              <img
                src="/assets/showcase-dining.jpg"
                alt="Dining room setup"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </section>

        {/* Section: Experience It In Person */}
        <section className="px-4 pb-5">
          <div className="relative rounded-2xl overflow-hidden bg-[#241B16] text-[#FAF7F2] p-5 shadow-md">
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/assets/about-showroom.jpg"
                alt="Annamalai Furniture Showroom"
                className="w-full h-full object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241B16] via-[#241B16]/80 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-[220px]">
              <h3 className="font-serif text-[17px] font-bold text-[#FAF7F2] leading-tight mb-2">
                Experience It<br />In Person
              </h3>
              <p className="text-[9.5px] text-[#D8C9BC] leading-relaxed mb-4">
                Visit our showroom to explore our complete collection and feel the craftsmanship firsthand.
              </p>
              <a
                href={SHOP_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#8C6D3B] to-[#6E4F28] hover:from-[#A07D45] hover:to-[#7E5A2E] text-[#FFF] text-[10px] font-semibold tracking-wide shadow-sm transition-all"
              >
                <MapPin size={12} />
                <span>Get Directions</span>
                <ArrowRight size={11} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
