import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const SHOWCASE_TABS = [
  {
    id: 'frames',
    label: 'Photo Frames',
    title: 'Solid Wood & Tabletop Custom Frames',
    subtitle: 'Preserve cherished moments with archival luster printing and solid wood borders.',
    image: '/images/4 x 6 black frame 199.jpg',
    points: [
      'Available in Black, White & Antique Wooden finishes',
      'Solid shatter-resistant acrylic glass protection',
      'Ready to wall hang or stand on tabletop',
      'Starts from only ₹199 with customized photo verification'
    ],
    priceNote: 'Starting at ₹199',
    link: '/shop/frames'
  },
  {
    id: 'magazines',
    label: 'Personalized Magazines',
    title: 'Your Story Written Like a High-Fashion Magazine',
    subtitle: 'Turn anniversaries, birthdays and love journeys into glossy, magazine-quality editions.',
    image: '/images/MAG design2.jpg',
    points: [
      '12-page customized layouts with your memories & stories',
      'Premium glossy magazine art paper (300 GSM cover)',
      'Digital WhatsApp draft proof before final press print',
      'Personalized barcodes, article headlines & custom photos'
    ],
    priceNote: 'Starting at ₹499',
    link: '/shop/magazines'
  },
  {
    id: 'memories',
    label: 'Polaroids & Albums',
    title: 'Vintage Aesthetic Polaroid Keepsakes',
    subtitle: 'Classic border Polaroid prints designed to keep pocket-sized memories close to heart.',
    image: '/images/POLAROIDS MEDIUM 8 PER EACH.jpg',
    points: [
      'Available in Small (₹5), Medium (₹8) & Large (₹15) sizes',
      'Fuji-grade archival paper resistant to fading',
      'Optional mini albums & wooden peg clips sets',
      'Bulk packages available for celebrations'
    ],
    priceNote: 'From ₹5 / photo',
    link: '/shop/memories'
  },
  {
    id: 'hampers',
    label: 'Luxury Hampers',
    title: 'Curated Celebration Gift Boxes',
    subtitle: 'Complete gifting ensembles pairing custom frames, chocolates, bouquets and cards.',
    image: '/images/HAMPER(1).jpg',
    points: [
      'Handcrafted premium rigid gift box packaging',
      'Includes custom photo prints, floral accents & treats',
      'Handwritten personalized wax-sealed message cards',
      'Ideal for milestone birthdays, proposals and weddings'
    ],
    priceNote: 'Curated combos',
    link: '/shop/hampers'
  },
  {
    id: 'flowers',
    label: 'Flowers & Bouquets',
    title: 'Everlasting Roses & Floral Arrangements',
    subtitle: 'Artisanal bouquets assembled with care and paired with personalized notes.',
    image: '/images/artboqwith,pol,flow,cktpr,choc 999.jpg',
    points: [
      'Carefully wrapped in luxury satin & waterproof designer paper',
      'Everlasting blooms paired with custom messages',
      'Optional Polaroid photo inserts nestled into flowers',
      'Safe, damage-proof delivery across all major cities'
    ],
    priceNote: 'Starting at ₹199',
    link: '/shop/flowers'
  }
];

const ShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState(SHOWCASE_TABS[0]);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] mb-2.5 block">
            THE GIFTING EXPERIENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#071A2F] tracking-tight">
            PERSONALIZED WITH INTENTION.
          </h2>
          <p className="text-sm sm:text-base text-[#687386] mt-3 font-normal leading-relaxed">
            Every product is custom-rendered and crafted by hand to mirror the depth of your personal relationships.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
          {SHOWCASE_TABS.map((tab) => {
            const isSelected = activeTab.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[#071A2F] text-white shadow-xs' 
                    : 'bg-[#FAF8F4] text-[#071A2F]/70 hover:text-[#071A2F] hover:bg-[#F2EFE9] border border-[#071A2F]/6'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Showcase Card Display (Split Screen) */}
        <div className="bg-[#FAF8F4] rounded-[32px] border border-[#071A2F]/8 p-6 sm:p-10 lg:p-12 shadow-[0_4px_20px_rgba(7,26,47,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Product Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                <img
                  loading="lazy"
                  decoding="async"
                  src={activeTab.image}
                  alt={activeTab.title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs text-[11px] font-bold text-[#071A2F]">
                  {activeTab.priceNote}
                </div>
              </div>
            </div>

            {/* Right: Detailed Story & Feature Checklist */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A46D] mb-2 block">
                Featured Collection
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#071A2F] tracking-tight mb-3">
                {activeTab.title}
              </h3>
              <p className="text-sm text-[#687386] leading-relaxed mb-6 font-light">
                {activeTab.subtitle}
              </p>

              {/* Checklist Points */}
              <div className="space-y-3 mb-8">
                {activeTab.points.map((pt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#C5A46D] flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#071A2F]/90 font-medium leading-snug">{pt}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <div>
                <Link
                  to={activeTab.link}
                  className="inline-flex items-center gap-2.5 bg-[#071A2F] hover:bg-[#0B2748] text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span>Explore {activeTab.label}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ShowcaseSection;
