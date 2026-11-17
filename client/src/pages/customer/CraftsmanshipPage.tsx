import React from 'react';
import { Link } from 'react-router-dom';
import {
  TreePine,
  Layers,
  Hammer,
  Droplet,
  Armchair,
  Diamond,
  Leaf,
  ShieldCheck,
  Heart,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';

export const CraftsmanshipPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative bg-[#2B1E17] text-[#FAF7F2] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl">
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase font-semibold block mb-2">
                Generations of Woodworking Excellence
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight mb-3">
                The Heritage of Pure Wood Craftsmanship
              </h1>
              <div className="w-16 h-1 bg-[#B69764] mb-5 rounded-full"></div>
              <p className="text-sm sm:text-base text-[#D4C5B9] leading-relaxed">
                From handpicked tree logs to hand-carved heritage furniture, discover how our master artisans shape enduring beauty using classical joinery techniques.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-[#B69764] hover:bg-[#A38350] text-[#241B16] font-semibold px-6 py-3 rounded-full text-xs sm:text-sm font-serif transition-colors shadow-md"
                >
                  View Crafted Pieces
                </Link>
                <Link
                  to="/contact"
                  className="border border-[#C8A77D] text-[#FAF7F2] hover:bg-white/10 px-6 py-3 rounded-full text-xs sm:text-sm font-serif transition-colors"
                >
                  Visit Workshop
                </Link>
              </div>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/assets/craft-dovetail-joint.jpg"
                alt="Detailed handcrafted wood joinery"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* The 5-Step Journey of a Wooden Masterpiece */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
              Step-by-Step Discipline
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#3B281C]">
              The Journey of a Wooden Masterpiece
            </h2>
            <div className="w-12 h-0.5 bg-[#B69764] mx-auto my-3"></div>
            <p className="text-xs sm:text-sm text-[#7A675B]">
              Every Annamalai piece undergoes rigorous selection, seasoned curing, hand joinery, and organic finishing.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-white border border-[#EAE2D5] shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-3 shadow-xs">
                <TreePine size={24} />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#B69764] mb-1">Step 01</span>
              <h3 className="text-sm font-serif font-bold text-[#3B281C]">Select Quality Wood</h3>
              <p className="text-xs text-[#7A675B] mt-1.5 leading-relaxed">
                Mature Teak and Rosewood logs selected for deep grain density.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-white border border-[#EAE2D5] shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-3 shadow-xs">
                <Layers size={24} />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#B69764] mb-1">Step 02</span>
              <h3 className="text-sm font-serif font-bold text-[#3B281C]">Season &amp; Treat</h3>
              <p className="text-xs text-[#7A675B] mt-1.5 leading-relaxed">
                Kiln-drying to ideal 8-12% moisture prevents expansion and warping.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-white border border-[#EAE2D5] shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-3 shadow-xs">
                <Hammer size={24} />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#B69764] mb-1">Step 03</span>
              <h3 className="text-sm font-serif font-bold text-[#3B281C]">Handcraft &amp; Joinery</h3>
              <p className="text-xs text-[#7A675B] mt-1.5 leading-relaxed">
                Classical mortise-and-tenon and dovetail interlocking joints.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-white border border-[#EAE2D5] shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-3 shadow-xs">
                <Droplet size={24} />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#B69764] mb-1">Step 04</span>
              <h3 className="text-sm font-serif font-bold text-[#3B281C]">Hand Polish &amp; Buff</h3>
              <p className="text-xs text-[#7A675B] mt-1.5 leading-relaxed">
                Multi-layer hand-rubbed organic oil polish brings out natural luster.
              </p>
            </div>

            {/* Step 5 */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center p-5 rounded-3xl bg-white border border-[#EAE2D5] shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-3 shadow-xs">
                <Armchair size={24} />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#B69764] mb-1">Step 05</span>
              <h3 className="text-sm font-serif font-bold text-[#3B281C]">Heirloom Delivery</h3>
              <p className="text-xs text-[#7A675B] mt-1.5 leading-relaxed">
                White-glove delivery, placed and assembled with care in your home.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: In the Hands of Skilled Artisans */}
        <section className="bg-white border-t border-b border-[#EAE2D5] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-14">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-lg flex-shrink-0">
                <img
                  src="/assets/craft-artisan-senior.jpg"
                  alt="Experienced Artisan Handcarving"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 max-w-xl">
                <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                  Human Touch
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#241B16] leading-tight mt-1">
                  In the Hands of Master Artisans
                </h2>
                <div className="w-12 h-[2px] bg-[#B69764] my-4"></div>
                <p className="text-xs sm:text-sm text-[#695446] leading-relaxed mb-4">
                  Our woodcarvers have practiced their trade for over thirty years. They understand the behavior of different woods — how grain responds to changes in humidity, where reinforcement is vital, and how to preserve the tactile warmth of natural wood.
                </p>
                <p className="text-xs sm:text-sm text-[#695446] leading-relaxed">
                  Every fluted leg, bevelled tabletop edge, and hand-chiseled crest carries the unique fingerprint of authentic craftsmanship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Built with True Detail */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 sm:gap-14">
            <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border border-[#D9CDBF] shadow-lg flex-shrink-0">
              <img
                src="/assets/craft-dovetail-joint.jpg"
                alt="Dovetail Woodworking Joint"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 max-w-xl">
              <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                Structural Integrity
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#241B16] leading-tight mt-1">
                Precision Joints, Zero Shortcuts
              </h2>
              <div className="w-12 h-[2px] bg-[#B69764] my-4"></div>
              <p className="text-xs sm:text-sm text-[#695446] leading-relaxed mb-4">
                We never rely on cheap staples, plastic brackets, or fragile glue nails. Every joint in our furniture is carved directly from the solid frame itself — interlocking dovetails in drawers, mortise-and-tenon frameworks for sofas and dining tables.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-[#EAE2D5] text-xs text-[#241B16] leading-relaxed">
                <strong>Why Mortise &amp; Tenon Matters:</strong> Wood expands and breathes with seasonal climate changes. Tenon joinery distributes stress across large wood surfaces, ensuring frames stay rock solid and quiet for decades.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Our Quality Promise */}
        <section className="bg-white border-t border-b border-[#EAE2D5] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold block mb-1">
                Our Guarantee
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B281C]">
                The Annamalai Quality Covenant
              </h3>
              <div className="w-12 h-0.5 bg-[#B69764] mx-auto my-3"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Diamond size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">100% Solid Wood</h4>
                <p className="text-xs text-[#7A675B] mt-1">Never any veneers or fake wood stickers.</p>
              </div>

              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Leaf size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">Sustainably Sourced</h4>
                <p className="text-xs text-[#7A675B] mt-1">Ethical timber harvest with zero illegal logging.</p>
              </div>

              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <ShieldCheck size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">10-Year Warranty</h4>
                <p className="text-xs text-[#7A675B] mt-1">Guaranteed against structural defects & pests.</p>
              </div>

              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-2">
                  <Heart size={22} />
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3B281C]">Made with Care</h4>
                <p className="text-xs text-[#7A675B] mt-1">Every contour buffed by human hands.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Wood that Lives Longer CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="relative rounded-3xl overflow-hidden bg-[#2D1F18] text-[#FAF7F2] p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl z-10">
              <span className="text-xs font-serif text-[#C8A77D] tracking-widest uppercase">
                Long-Lasting Investment
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#FAF7F2] leading-tight mt-1 mb-3">
                Wood That Grows More Beautiful With Age
              </h3>
              <p className="text-xs sm:text-sm text-[#D8C9BC] leading-relaxed mb-6">
                Unlike engineered fiberboards that degrade and swell, solid hardwood develops a rich, lustrous patina over decades. An investment in Annamalai is an investment for generations.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B69764] hover:bg-[#A38350] text-[#241B16] text-xs sm:text-sm font-serif font-bold shadow-md transition-all"
              >
                <span>Explore the Furniture Catalog</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden border border-[#523B2F] shadow-xl">
              <img
                src="/assets/craft-wood-lives-longer.jpg"
                alt="Wood that Lives Longer"
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
