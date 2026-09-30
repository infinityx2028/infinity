import React from 'react';

const PILLARS = [
  {
    num: '01',
    title: 'PERSONALIZED',
    desc: 'Every gift is created directly around your photos, names, dates, and memories — uniquely designed for the person receiving it.'
  },
  {
    num: '02',
    title: 'MADE WITH CARE',
    desc: 'From solid wood framing and archival photo paper to precision layout design, our studio handcrafts each item with utmost attention.'
  },
  {
    num: '03',
    title: 'MADE TO MEAN MORE',
    desc: 'Far beyond a generic off-the-shelf purchase, a personalized gift turns your celebration into an enduring memory they will hold onto.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 md:py-28 bg-[#071A2F] text-white relative overflow-hidden">
      {/* Subtle Midnight Gradient Background */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#0B2748]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header with generous whitespace */}
        <div className="max-w-3xl mb-14 sm:mb-20">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A46D] mb-4 block">
            THE INFINITY DIFFERENCE
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            NOT JUST A GIFT. <br />
            <span className="text-[#C5A46D]/90">A MEMORY MADE TANGIBLE.</span>
          </h2>
        </div>

        {/* 3 Typography-Led Columns — Pure Whitespace, No Boxed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-10 border-t border-white/10">
          {PILLARS.map((col, idx) => (
            <div key={idx} className="flex flex-col justify-start">
              <span className="text-xs font-mono font-bold text-[#C5A46D] tracking-widest block mb-5">
                {col.num}
              </span>
              <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight mb-3">
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
