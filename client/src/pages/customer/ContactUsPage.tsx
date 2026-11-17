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
  ArrowRight,
  ShieldCheck,
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
    <div className="w-full min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Top Hero Section */}
        <section className="relative bg-gradient-to-b from-[#F2ECE1] to-[#FAF8F5] border-b border-[#EAE2D5] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs uppercase font-serif tracking-widest text-[#B69764] font-semibold block mb-2">
                Connect With Our Workshop
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#241B16] leading-tight">
                Let&apos;s Design Your Dream Furniture
              </h1>
              <div className="w-16 h-1 bg-[#B69764] my-4 rounded-full"></div>
              <p className="text-sm sm:text-base text-[#695446] leading-relaxed">
                Whether you have a specific room layout, custom dimensions, or want to schedule a private walkthrough of our master showroom, we are delighted to assist.
              </p>
            </div>

            <div className="w-full md:w-1/2 aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-[#DDD1C0]">
              <img
                src="/assets/about-hero-armchair.jpg"
                alt="Handcrafted Armchair"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* 3 Value Pillars */}
        <section className="bg-white border-b border-[#EAE2D5] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-3">
                  <MessageSquare size={22} />
                </div>
                <h3 className="font-serif text-base font-bold text-[#241B16]">Instant WhatsApp Assistance</h3>
                <p className="text-xs text-[#7A675B] mt-1">
                  Connect directly with our master carpenter for availability and pricing.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-3">
                  <Wrench size={22} />
                </div>
                <h3 className="font-serif text-base font-bold text-[#241B16]">Bespoke Custom Orders</h3>
                <p className="text-xs text-[#7A675B] mt-1">
                  We modify dimensions, finishes, and timber types to match your blueprints.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE2D5]">
                <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#B69764] flex items-center justify-center mb-3">
                  <Calendar size={22} />
                </div>
                <h3 className="font-serif text-base font-bold text-[#241B16]">Personal Showroom Tours</h3>
                <p className="text-xs text-[#7A675B] mt-1">
                  Open 7 days a week for in-person wood grain and comfort trials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main 2-Column Section: Form & Showroom Info */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#EAE2D5] rounded-3xl p-6 sm:p-10 shadow-sm">
              <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                Direct Communication
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B16] leading-tight mt-1">
                Send an Enquiry to Our Artisans
              </h2>
              <p className="text-xs sm:text-sm text-[#695446] mt-2 mb-6">
                Fill in your preferences below and submit directly to our official WhatsApp line for instant photos, pricing, and timber advice.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#241B16] mb-1">
                      Your Full Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7569]">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#241B16] mb-1">
                      Phone / WhatsApp Number <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7569]">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241B16] mb-1">
                    Furniture Category of Interest
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7569]">
                      <Armchair size={16} />
                    </div>
                    <select
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
                    >
                      <option value="Sofas">Sofas & Living Room Sets</option>
                      <option value="Beds">Beds & Bedroom Suites</option>
                      <option value="Dining">Dining Tables & Chairs</option>
                      <option value="Wardrobes">Wardrobes & Storage Cabinets</option>
                      <option value="TV Units">TV Units & Living Room Storage</option>
                      <option value="Dressing Tables">Dressing Tables</option>
                      <option value="Custom">Custom Bespoke Timber Work</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241B16] mb-1">
                    Describe Your Requirements <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 text-[#8A7569]">
                      <MessageCircle size={16} />
                    </div>
                    <textarea
                      rows={4}
                      required
                      maxLength={1000}
                      placeholder="Please share dimensions, wood preference (Teak/Rosewood), delivery town, and any special features..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#241B16] placeholder-[#9E8B7F] focus:outline-none focus:border-[#493326] leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#241B16] hover:bg-[#3D2C22] text-[#F7F3EC] py-3.5 rounded-full font-serif text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
                >
                  <Send size={16} />
                  <span>Send Enquiry via WhatsApp</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>

            {/* Showroom & Contact Info Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Showroom Details Card */}
              <div className="bg-white border border-[#EAE2D5] rounded-3xl p-6 sm:p-8 shadow-sm">
                <span className="text-xs font-serif text-[#B69764] tracking-widest uppercase font-semibold">
                  Visit Our Experience Center
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241B16] mt-1 mb-4">
                  Annamalai Furniture Showroom
                </h3>

                {/* Map Preview Crop */}
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#DDD1C0] shadow-xs mb-5">
                  <img
                    src="/assets/contact-map.jpg"
                    alt="Annamalai Furniture Location Map"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <a
                      href={SHOP_MAP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#241B16] hover:bg-[#3D2C22] text-[#F7F3EC] px-4 py-2 rounded-full text-xs font-serif font-semibold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                      <MapPin size={14} />
                      <span>Open in Google Maps</span>
                      <ArrowRight size={12} />
                    </a>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[#B69764] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#241B16] block">Operating Hours</span>
                      <p className="text-[#695446] mt-0.5">
                        Monday – Saturday : 10:00 AM – 8:00 PM<br />
                        Sunday : 10:00 AM – 6:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#B69764] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#241B16] block">Showroom Address</span>
                      <p className="text-[#695446] mt-0.5 leading-relaxed">
                        Annamalai Furniture Workshop & Showroom, Main Road, Tamil Nadu, India.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-[#B69764] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#241B16] block">Direct Consultation</span>
                      <p className="text-[#695446] mt-0.5">
                        Call / WhatsApp: +91 94432 00000
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#F2ECE1]">
                  <a
                    href={SHOP_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DDD1C0] text-[#241B16] py-3 rounded-full text-xs font-serif font-bold transition-colors"
                  >
                    <span>Get Driving Directions</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Dining Showcase Banner */}
        <section className="w-full aspect-[21/6] overflow-hidden bg-[#241B16]">
          <img
            src="/assets/dining-showcase.jpg"
            alt="Handcrafted Dining Space"
            className="w-full h-full object-cover opacity-90"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};
