import React from 'react';
import { Link } from 'react-router-dom';
import { Trees, Hammer, Sparkles, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative bg-gradient-to-b from-[#F2ECE1] to-[#FAF8F5] border-b border-[#EAE2D5] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs uppercase font-serif tracking-widest text-[#B69764] font-semibold block mb-2">
                Our Heritage & Story
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#241B16] leading-tight">
                Crafting Spaces, Creating Heirloom Memories
              </h1>
              <div className="w-16 h-1 bg-[#B69764] my-4 rounded-full"></div>
              <p className="text-sm sm:text-base text-[#695446] leading-relaxed">
                At Annamalai Furniture, we bring the timeless beauty of 100% solid wood into everyday family life. Rooted in traditional South Indian timber craft, every sofa, dining table, and bed frame is shaped by generational masters.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-[#241B16] hover:bg-[#3D2C22] text-[#F7F3EC] px-6 py-3 rounded-full text-xs sm:text-sm font-serif font-semibold transition-all shadow-md inline-flex items-center gap-2"
                >
                  <span>Explore Furniture Catalog</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/craftsmanship"
                  className="border border-[#241B16] text-[#241B16] hover:bg-[#241B16] hover:text-white px-6 py-3 rounded-full text-xs sm:text-sm font-serif font-semibold transition-all"
                >
                  Our Woodworking Process
                </Link>
              </div>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-[#DDD1C0]">
              <img
                src="/assets/about-hero-armchair.jpg"
                alt="Handcrafted Luxury Armchair"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* 3 Value Pillars Bar */}
        <section className="bg-white border-b border-[#EAE2D5] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-3">
                  <Trees size={24} />
                </div>
                <h3 className="font-serif text-base font-bold text-[#241B16]">100% Natural Timber</h3>
                <p className="text-xs text-[#7A675B] mt-1 max-w-xs">
                  Sustainably sourced, kiln-seasoned Teak, Rosewood and Mahogany with zero engineered wood.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-3">
                  <Hammer size={24} />
                </div>
                <h3 className="font-serif text-base font-bold text-[#241B16]">Generational Artisans</h3>
                <p className="text-xs text-[#7A675B] mt-1 max-w-xs">
                  Hand-chiseled accents and precision interlocking mortise-and-tenon joints.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-3">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-serif text-base font-bold text-[#241B16]">Timeless Aesthetic</h3>
                <p className="text-xs text-[#7A675B] mt-1 max-w-xs">
                  Designs that outlive seasonal trends, finished with organic hand-rubbed oils.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: The Beauty of Craftsmanship */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-14">
            <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-lg flex-shrink-0">
              <img
                src="/assets/craft-artisan.jpg"
                alt="The Beauty of Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 max-w-xl">
              <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                The Touch of Masters
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#241B16] leading-tight mt-1">
                The Art & Patience of True Woodcraft
              </h2>
              <div className="w-12 h-[2px] bg-[#B69764] my-4"></div>
              <p className="text-xs sm:text-sm text-[#695446] leading-relaxed mb-4">
                In a world of mass-produced flat-pack furniture, Annamalai stands as a sanctuary of authentic carpentry. Every log is hand-inspected for grain continuity, moisture resistance, and structural integrity.
              </p>
              <p className="text-xs sm:text-sm text-[#695446] leading-relaxed">
                Our carvers spend days carving subtle curves, fluting, and ergonomic contours that industrial machines simply cannot replicate.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Our Design Philosophy */}
        <section className="bg-white border-t border-b border-[#EAE2D5] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 sm:gap-14">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-lg flex-shrink-0">
                <img
                  src="/assets/about-wood-blocks.jpg"
                  alt="Natural Wood Timbers"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 max-w-xl">
                <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                  Philosophy
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#241B16] leading-tight mt-1">
                  Furniture That Becomes Family
                </h2>
                <div className="w-12 h-[2px] bg-[#B69764] my-4"></div>
                <p className="text-xs sm:text-sm text-[#695446] leading-relaxed mb-4">
                  We believe furniture should be far more than utilitarian storage or seating. It frames the stories of your life — festive dinners around the dining table, quiet evenings on the sofa, and restful nights in an heirloom bed.
                </p>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D5] text-xs text-[#241B16] italic font-serif">
                  &ldquo;A solid wood dining table isn&apos;t just wood and screws; it is where five decades of conversations, laughter, and celebrations happen.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Showroom Banner */}
        <section className="relative w-full aspect-[21/9] sm:aspect-[24/8] overflow-hidden bg-[#241B16]">
          <img
            src="/assets/about-showroom.jpg"
            alt="Annamalai Furniture Showroom"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 sm:p-14">
            <div className="max-w-xl text-white">
              <h3 className="font-serif text-xl sm:text-3xl font-bold mb-2">Our Grand Showroom Experience</h3>
              <p className="text-xs sm:text-sm text-[#EAE2D5]">
                Over 5,000 sq.ft of furnished living rooms, bedrooms, and dining spaces ready for your personal inspection.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Built on Natural Wood Grain */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-14">
            <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-lg flex-shrink-0">
              <img
                src="/assets/about-wood-rings.jpg"
                alt="Natural Wood Grain Cross Section"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 max-w-xl">
              <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                Timber Authenticity
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#241B16] leading-tight mt-1">
                Rooted in Genuine Natural Timber
              </h2>
              <div className="w-12 h-[2px] bg-[#B69764] my-4"></div>
              <p className="text-xs sm:text-sm text-[#695446] leading-relaxed mb-4">
                We select only dense, mature forest timber that has cured naturally over years. The growth rings and distinct radial rays in our wood ensure natural pest resistance and monumental tensile strength.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#241B16]">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#B69764]" />
                  <span>Naturally termite and borer resistant</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#B69764]" />
                  <span>Eco-conscious seasoning and zero VOC sealants</span>
                </li>
                <li className="flex items-center gap-2">
                  <HeartHandshake size={16} className="text-[#B69764]" />
                  <span>Backed by our 10-Year timber integrity warranty</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: Explore Our Collection CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="rounded-3xl overflow-hidden bg-[#241B16] text-[#F7F3EC] p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-lg">
              <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight mb-2">
                Discover Our Complete Handcrafted Collection
              </h3>
              <p className="text-xs sm:text-sm text-[#D8C9BC] leading-relaxed mb-6">
                Explore sofas, beds, dining sets, wardrobes, and TV units designed to enhance your everyday home living.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#B69764] hover:bg-[#A38350] text-[#241B16] px-6 py-3 rounded-full text-xs sm:text-sm font-serif font-bold transition-all shadow-md"
              >
                <span>Browse Furniture Models</span>
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="w-full md:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden border border-[#523B2F] shadow-xl">
              <img
                src="/assets/p-detail-sofa-main.jpg"
                alt="Handcrafted wooden sofa"
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
