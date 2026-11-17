import React, { useState } from 'react';
import {
  MessageSquare,
  Wrench,
  Calendar,
  User,
  Phone,
  Armchair,
  MessageCircle,
  Send,
  Clock,
  MapPin,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { buildWhatsAppEnquiryUrl, SHOP_MAP_URL } from '../../constants/links';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('Sofas');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enquiry = [
      'Hello Annamalai Furniture,',
      '',
      'I would like to enquire about furniture.',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Interested in: ${interest}`,
      '',
      'Requirement:',
      message,
    ].join('\n');

    window.open(buildWhatsAppEnquiryUrl(enquiry), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-w-[320px] max-w-[480px] mx-auto bg-[#F7F3EC] shadow-2xl min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative px-5 pt-5 pb-4 bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC] overflow-hidden">
          <div className="max-w-[210px] relative z-10">
            <span className="text-[10px] uppercase font-serif tracking-widest text-[#7A675B] font-semibold block mb-1">
              Contact Us
            </span>
            <h1 className="font-serif text-[23px] text-[#241B16] font-bold leading-tight">
              Let's Find Your<br />Perfect Furniture
            </h1>
            <div className="w-10 h-[1.5px] bg-[#B69764] my-2"></div>
            <p className="text-[10px] text-[#695446] leading-relaxed">
              Have a question, need a custom piece, or want to visit our showroom? We're here to help.
            </p>
          </div>

          {/* Right Armchair Photo Crop */}
          <div className="absolute right-0 top-0 bottom-0 w-[150px] overflow-hidden">
            <img
              src="/assets/about-hero-armchair.jpg"
              alt="Handcrafted Armchair"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </section>

        {/* 3 Value Pillars */}
        <section className="px-4 py-3 bg-[#FAF7F2] border-t border-b border-[#E8DFC8]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <MessageSquare size={16} />
              </div>
              <span className="text-[9px] font-bold text-[#241B16]">Quick Response</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Wrench size={16} />
              </div>
              <span className="text-[9px] font-bold text-[#241B16]">Custom Furniture Support</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-1">
                <Calendar size={16} />
              </div>
              <span className="text-[9px] font-bold text-[#241B16]">Showroom Visit Assistance</span>
            </div>
          </div>
        </section>

        {/* Large WhatsApp CTA Button */}
        <div className="px-4 py-3">
          <a
            href={buildWhatsAppEnquiryUrl('Hello Annamalai Furniture,\n\nI have a custom furniture requirement. Please let me know how we can discuss further.\n\nThank you.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2.5 px-4 rounded-full font-serif text-xs font-medium flex items-center justify-center gap-2.5 shadow-md transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.884 2.791.884 3.179 0 5.767-2.587 5.768-5.766.002-3.18-2.584-5.77-5.768-5.77zm3.365 8.163c-.14.394-.716.732-1.023.778-.291.043-.668.077-2.18-.553-1.849-.769-3.045-2.656-3.138-2.78-.093-.124-.754-1.003-.754-1.913 0-.911.478-1.358.648-1.542.17-.184.372-.23.496-.23.124 0 .248.002.356.008.115.006.269-.044.421.323.155.373.53 1.294.577 1.388.047.094.078.204.016.328-.063.125-.094.204-.187.313-.094.11-.198.245-.283.33-.094.094-.192.197-.082.386.11.189.49 1.808 1.401 2.228.468.216.862.308 1.157.34.295.031.544-.016.736-.233.193-.217.828-.962 1.05-1.29.222-.328.444-.275.748-.162.304.113 1.93.91 2.262 1.076.332.166.554.249.636.388.083.139.083.805-.057 1.199z"/>
              </svg>
            </div>
            <span>Chat with Us on WhatsApp</span>
            <span className="text-sm">→</span>
          </a>
        </div>

        {/* Send an Enquiry Form Card */}
        <section className="px-4 pb-4">
          <div className="bg-[#FAF7F2] border border-[#DDD1C0] rounded-3xl p-4 shadow-sm">
            <h2 className="font-serif text-[18px] font-bold text-[#241B16] leading-tight">
              Send an Enquiry
            </h2>
            <p className="text-[10px] text-[#695446] mt-0.5 mb-3.5">
              Review your details and send them to our team through WhatsApp.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7569]">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl py-2 pl-9 pr-3 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326]"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7569]">
                  <Phone size={15} />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl py-2 pl-9 pr-3 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326]"
                />
              </div>

              {/* Furniture Interest */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7569]">
                  <Armchair size={15} />
                </div>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl py-2 pl-9 pr-3 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
                >
                  <option value="Sofas">Sofas & Seating</option>
                  <option value="Beds">Beds & Bedroom Sets</option>
                  <option value="Dining">Dining Tables & Chairs</option>
                  <option value="Wardrobes">Wardrobes & Storage</option>
                  <option value="Custom">Custom Handcrafted Piece</option>
                </select>
              </div>

              {/* Message */}
              <div className="relative">
                <div className="absolute top-2.5 left-3 text-[#8A7569]">
                  <MessageCircle size={15} />
                </div>
                <textarea
                  rows={3}
                  required
                  maxLength={1000}
                  placeholder="Your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl py-2 pl-9 pr-3 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326] leading-relaxed"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2.5 rounded-full font-serif text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send size={14} />
                <span>Send via WhatsApp</span>
                <span className="text-sm">→</span>
              </button>
            </form>
          </div>
        </section>

        {/* Find Our Showroom Section */}
        <section className="px-4 pb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#B69764]"></span>
            <h2 className="font-serif text-[15px] font-bold text-[#241B16]">
              Find Our Showroom
            </h2>
            <span className="w-6 h-[1px] bg-[#B69764]"></span>
          </div>

          {/* Map Illustration with Pin */}
          <div className="relative bg-[#FDFBF7] rounded-2xl overflow-hidden border border-[#DDD1C0] shadow-sm mb-3 flex items-center justify-between p-2">
            <div className="h-16 w-[60%] overflow-hidden rounded-xl">
              <img src="/assets/contact-map.jpg" alt="Showroom Map" className="w-full h-full object-cover" />
            </div>
            <a
              href={SHOP_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] px-3 py-1.5 rounded-full text-[10px] font-serif flex items-center gap-1 shadow-sm mr-2"
            >
              <MapPin size={12} />
              <span>Map View</span>
              <span>→</span>
            </a>
          </div>

          {/* Showroom Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Showroom Hours */}
            <div className="bg-[#FAF7F2] border border-[#DDD1C0] rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#493326] font-bold font-serif mb-1">
                  <Clock size={14} className="text-[#B69764]" />
                  <span>Showroom Hours</span>
                </div>
                <p className="text-[9px] text-[#695446] leading-tight">
                  Mon – Sat : 10:00 AM – 8:00 PM<br />
                  Sunday : 10:00 AM – 6:00 PM
                </p>
              </div>
            </div>

            {/* Showroom Location */}
            <div className="bg-[#FAF7F2] border border-[#DDD1C0] rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#493326] font-bold font-serif mb-1">
                  <MapPin size={14} className="text-[#B69764]" />
                  <span>Showroom Location</span>
                </div>
                <p className="text-[9px] text-[#695446] leading-tight">
                  Visit our furniture showroom to experience the craftsmanship in person.
                </p>
                <div className="mt-2 flex flex-col items-start gap-1 text-[9px] font-semibold text-[#493326]">
                  <a href={SHOP_MAP_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Explore Our Shop
                  </a>
                  <a href={SHOP_MAP_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Dining Showcase Photo */}
        <section className="w-full aspect-[341/88] overflow-hidden bg-[#241B16]">
          <img
            src="/assets/dining-showcase.jpg"
            alt="Handcrafted Dining Space"
            className="w-full h-full object-cover"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};
