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
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative px-5 pt-6 pb-6 bg-[#2B1E17] text-[#FAF7F2] overflow-hidden">
          {/* Background carving photograph */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none">
            <img
              src="/assets/craft-dovetail-joint.jpg"
              alt="Detailed handcrafted wood joinery"
              className="w-full h-full object-cover object-left opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B1E17] via-[#2B1E17]/60 to-transparent"></div>
          </div>

          <div className="max-w-[210px] relative z-10">
            <h1 className="font-serif text-[24px] text-[#FAF7F2] font-bold leading-tight tracking-tight mb-2">
              Our<br />Craftsmanship
            </h1>
            <div className="w-9 h-[1.5px] bg-[#B69764] mb-3"></div>
            <p className="text-[10px] text-[#D4C5B9] leading-relaxed">
              From selected wood to timeless furniture, every piece tells a story of skill, care and tradition.
            </p>
          </div>
        </section>

        {/* Decorative Wave Divider */}
        <div className="relative w-full h-4 bg-[#2B1E17]">
          <div className="absolute inset-0 bg-[#F7F3EC] rounded-t-[20px]"></div>
        </div>

        {/* The Journey of a Wooden Masterpiece */}
        <section className="px-3 pt-3 pb-5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
            <h2 className="font-serif text-[13px] font-bold text-[#3B281C] tracking-wide text-center">
              The Journey of a Wooden Masterpiece
            </h2>
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
          </div>

          <div className="flex items-center justify-between px-1">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center w-[58px]">
              <div className="w-10 h-10 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center shadow-xs mb-1">
                <TreePine size={18} />
              </div>
              <span className="text-[8px] font-bold text-[#3B281C] leading-tight">
                Select<br />Quality Wood
              </span>
            </div>

            <ChevronRight size={12} className="text-[#C8A77D] -mt-3" />

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center w-[58px]">
              <div className="w-10 h-10 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center shadow-xs mb-1">
                <Layers size={18} />
              </div>
              <span className="text-[8px] font-bold text-[#3B281C] leading-tight">
                Season<br />&amp; Treat
              </span>
            </div>

            <ChevronRight size={12} className="text-[#C8A77D] -mt-3" />

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center w-[58px]">
              <div className="w-10 h-10 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center shadow-xs mb-1">
                <Hammer size={18} />
              </div>
              <span className="text-[8px] font-bold text-[#3B281C] leading-tight">
                Handcraft<br />&amp; Shape
              </span>
            </div>

            <ChevronRight size={12} className="text-[#C8A77D] -mt-3" />

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center w-[58px]">
              <div className="w-10 h-10 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center shadow-xs mb-1">
                <Droplet size={18} />
              </div>
              <span className="text-[8px] font-bold text-[#3B281C] leading-tight">
                Polish<br />&amp; Refine
              </span>
            </div>

            <ChevronRight size={12} className="text-[#C8A77D] -mt-3" />

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center w-[58px]">
              <div className="w-10 h-10 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center shadow-xs mb-1">
                <Armchair size={18} />
              </div>
              <span className="text-[8px] font-bold text-[#3B281C] leading-tight">
                Deliver a<br />Lasting Piece
              </span>
            </div>
          </div>
        </section>

        {/* Section: In the Hands of Skilled Artisans */}
        <section className="px-4 py-4 flex items-center gap-3 bg-[#FAF7F2] border-t border-b border-[#EAE1D2]">
          <div className="flex-1 pr-1">
            <h3 className="font-serif text-[16px] font-bold text-[#241B16] leading-tight mb-1">
              In the Hands<br />of Skilled Artisans
            </h3>
            <div className="w-8 h-[1.5px] bg-[#B69764] mb-2"></div>
            <p className="text-[9.5px] text-[#695446] leading-relaxed">
              Our experienced craftsmen bring generations of woodworking expertise to create furniture that is strong, beautiful and unique.
            </p>
          </div>
          <div className="w-[145px] h-[115px] rounded-2xl overflow-hidden border border-[#D9CDBF] shadow-sm flex-shrink-0">
            <img
              src="/assets/craft-artisan-senior.jpg"
              alt="Experienced Artisan Handcarving"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Section: Built with True Detail */}
        <section className="px-4 py-4 flex items-center gap-3 bg-[#F7F3EC]">
          <div className="w-[145px] h-[115px] rounded-2xl overflow-hidden border border-[#D9CDBF] shadow-sm flex-shrink-0">
            <img
              src="/assets/craft-dovetail-joint.jpg"
              alt="Dovetail Woodworking Joint"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 pl-1">
            <h3 className="font-serif text-[16px] font-bold text-[#241B16] leading-tight mb-1">
              Built with<br />True Detail
            </h3>
            <div className="w-8 h-[1.5px] bg-[#B69764] mb-2"></div>
            <p className="text-[9.5px] text-[#695446] leading-relaxed">
              Strong joints, precise fits and fine finishing ensure long-lasting comfort and elegance.
            </p>
          </div>
        </section>

        {/* Section: Our Promise */}
        <section className="px-3 py-4 bg-[#FAF7F2] border-t border-[#EAE1D2]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
            <h3 className="font-serif text-[13px] font-bold text-[#3B281C] tracking-wide text-center">
              Our Promise
            </h3>
            <div className="w-6 h-[1px] bg-[#C8A77D]"></div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Diamond size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Premium<br />Quality
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Leaf size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Sustainable<br />Wood
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Long<br />Durability
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#EFE8DC] border border-[#DFCBB5] text-[#8C6D3B] flex items-center justify-center mb-1">
                <Heart size={16} />
              </div>
              <span className="text-[8.5px] font-bold text-[#3B281C] leading-tight">
                Made<br />with Care
              </span>
            </div>
          </div>
        </section>

        {/* Section: Wood that Lives Longer */}
        <section className="px-4 py-4">
          <div className="relative rounded-2xl overflow-hidden bg-[#2D1F18] text-[#FAF7F2] p-5 shadow-md">
            {/* Background image of sofa/armchair */}
            <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none">
              <img
                src="/assets/craft-wood-lives-longer.jpg"
                alt="Wood that Lives Longer"
                className="w-full h-full object-cover object-left"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D1F18] via-[#2D1F18]/70 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-[190px]">
              <h3 className="font-serif text-[18px] font-bold text-[#FAF7F2] leading-tight mb-2">
                Wood that<br />Lives Longer
              </h3>
              <p className="text-[9.5px] text-[#D8C9BC] leading-relaxed mb-4">
                Timeless designs, natural strength and everyday comfort — crafted for your home.
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#8C6D3B] to-[#6E4F28] hover:from-[#A07D45] hover:to-[#7E5A2E] text-[#FFF] text-[10px] font-semibold tracking-wide shadow-sm transition-all"
              >
                <span>Explore Our Collection</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
