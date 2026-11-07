import React from 'react';
import { Link } from 'react-router-dom';
import { Trees, Hammer, Sparkles } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative px-5 pt-5 pb-4 bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC] overflow-hidden">
          <div className="max-w-[210px] relative z-10">
            <span className="text-[10px] uppercase font-serif tracking-widest text-[#7A675B] font-semibold block mb-1">
              About Us
            </span>
            <h1 className="font-serif text-[23px] text-[#241B16] font-bold leading-tight">
              Crafting Spaces,<br />Creating Memories
            </h1>
            <div className="w-10 h-[1.5px] bg-[#B69764] my-2"></div>
            <p className="text-[10px] text-[#695446] leading-relaxed">
              At Annamalai Furniture, we bring the timeless beauty of wood into your everyday life.
            </p>
          </div>

          {/* Right Armchair Photo Crop */}
          <div className="absolute right-0 top-0 bottom-0 w-[150px] overflow-hidden">
            <img
              src="/assets/about-hero-armchair.jpg"
              alt="Handcrafted Luxury Armchair"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </section>

        {/* 3 Value Pillars */}
        <section className="px-4 py-3 bg-[#FAF7F2] border-t border-b border-[#E8DFC8]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Trees size={16} />
              </div>
              <span className="text-[9px] font-bold text-[#241B16]">Quality Wood</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Hammer size={16} />
              </div>
              <span className="text-[9px] font-bold text-[#241B16]">Skilled Craftsmanship</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Sparkles size={16} />
              </div>
              <span className="text-[9px] font-bold text-[#241B16]">Timeless Design</span>
            </div>
          </div>
        </section>

        {/* Section 1: The Beauty of Craftsmanship */}
        <section className="px-4 py-4 flex items-center gap-3">
          <div className="w-[48%] aspect-[175/140] rounded-2xl overflow-hidden border border-[#D9CDBF] shadow-sm flex-shrink-0">
            <img
              src="/assets/craft-artisan.jpg"
              alt="The Beauty of Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-[17px] font-bold text-[#241B16] leading-tight">
              The Beauty of<br />Craftsmanship
            </h2>
            <div className="w-8 h-[1px] bg-[#B69764] my-2"></div>
            <p className="text-[9.5px] text-[#695446] leading-relaxed">
              Every piece is shaped by skilled hands, with precision, patience and a deep respect for the art of woodworking.
            </p>
          </div>
        </section>

        {/* Section 2: Our Design Philosophy */}
        <section className="px-4 py-3 bg-[#FAF7F2] border-t border-b border-[#E8DFC8] flex items-center gap-3">
          <div className="flex-1">
            <h2 className="font-serif text-[17px] font-bold text-[#241B16] leading-tight">
              Our Design<br />Philosophy
            </h2>
            <div className="w-8 h-[1px] bg-[#B69764] my-2"></div>
            <p className="text-[9.5px] text-[#695446] leading-relaxed">
              We believe furniture should be more than functional — it should add warmth, character and lasting value to your home.
            </p>
          </div>
          <div className="w-[48%] aspect-[166/110] rounded-2xl overflow-hidden border border-[#D9CDBF] shadow-sm flex-shrink-0">
            <img
              src="/assets/about-wood-blocks.jpg"
              alt="Natural Wood Timbers"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Section 3: Large Showroom Interior */}
        <section className="w-full aspect-[341/135] overflow-hidden bg-[#241B16]">
          <img
            src="/assets/about-showroom.jpg"
            alt="Annamalai Furniture Showroom"
            className="w-full h-full object-cover"
          />
        </section>

        {/* Section 4: Built on Natural Wood */}
        <section className="px-4 py-4 flex items-center gap-3">
          <div className="w-[45%] aspect-[166/110] rounded-2xl overflow-hidden border border-[#D9CDBF] shadow-sm flex-shrink-0">
            <img
              src="/assets/about-wood-rings.jpg"
              alt="Natural Wood Grain Cross Section"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-[17px] font-bold text-[#241B16] leading-tight">
              Built on<br />Natural Wood
            </h2>
            <div className="w-8 h-[1px] bg-[#B69764] my-2"></div>
            <p className="text-[9.5px] text-[#695446] leading-relaxed">
              We use carefully selected wood with natural strength and beauty, crafted to last for generations.
            </p>
          </div>
        </section>

        {/* Section 5: Explore Our Collection Banner */}
        <section className="mx-4 mb-4 rounded-2xl overflow-hidden relative aspect-[341/78] bg-[#38251C] text-[#F7F3EC] flex items-center justify-between px-4">
          <div className="relative z-10">
            <h3 className="font-serif text-[15px] font-bold leading-tight">
              Explore Our<br />Collection
            </h3>
            <Link
              to="/products"
              className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-serif border border-[#C8A77D]/60 text-[#C8A77D] px-2.5 py-0.5 rounded-full hover:bg-[#C8A77D] hover:text-[#241B16] transition-colors"
            >
              <span>View Collections</span>
              <span>→</span>
            </Link>
          </div>
          <div className="w-[45%] h-full overflow-hidden flex-shrink-0 -mr-4">
            <img
              src="/assets/p-detail-sofa-main.jpg"
              alt="Handcrafted wooden sofa"
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
