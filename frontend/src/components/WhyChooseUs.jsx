import React from 'react';

const PILLARS = [
  {
    num: '01',
    title: 'PERSONALIZED',
    desc: 'Uniquely crafted around your photos, names, dates, and memories.'
  },
  {
    num: '02',
    title: 'MADE WITH CARE',
    desc: 'Archival printing, solid wooden frames, and hand-finished studio quality.'
  },
  {
    num: '03',
    title: 'MADE TO MEAN MORE',
    desc: 'An enduring keepsake designed to turn your moments into lasting memories.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-7 sm:py-20 md:py-28 bg-[#071A2F] text-white relative overflow-hidden">
      {/* Subtle Midnight Gradient Background */}
      <div className="absolute top-0 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#0B2748]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-4 sm:mb-16">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#C5A46D] mb-1 sm:mb-3 block">
            THE INFINITY DIFFERENCE
          </span>
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            NOT JUST A GIFT. <br className="sm:hidden" />
            <span className="text-[#C5A46D]">A MEMORY MADE TANGIBLE.</span>
          </h2>
        </div>

        {/* MOBILE VIEW: Compact Rows (Target height ~360-420px total) */}
        <div className="sm:hidden divide-y divide-white/10 pt-2 border-t border-white/10">
          {PILLARS.map((col, idx) => (
            <div key={idx} className="py-2.5 flex items-start gap-3">
              <span className="text-xs font-mono font-bold text-[#C5A46D] tracking-widest pt-0.5 w-6 flex-shrink-0">
                {col.num}
              </span>
              <div>
                <h3 className="font-extrabold text-xs text-white tracking-tight">
                  {col.title}
                </h3>
                <p className="text-[11px] text-gray-300 font-light leading-tight mt-0.5">
                  {col.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: 3 Typography-Led Columns (sm+) */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-10 border-t border-white/10">
          {PILLARS.map((col, idx) => (
            <div key={idx} className="flex flex-col justify-start">
              <span className="text-xs font-mono font-bold text-[#C5A46D] tracking-widest block mb-4">
                {col.num}
              </span>
              <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight mb-2">
                {col.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
                {col.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
