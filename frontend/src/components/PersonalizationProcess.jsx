import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Choose a product',
    desc: 'Pick your handcrafted frame, t-shirt, polaroids, or magazine.'
  },
  {
    num: '02',
    title: 'Place your order',
    desc: 'Select options, add custom text, and complete your order.'
  },
  {
    num: '03',
    title: 'Send photos on WhatsApp',
    desc: 'Send photos on WhatsApp to approve your preview before crafting.'
  }
];

const PersonalizationProcess = () => {
  return (
    <section className="py-7 sm:py-16 md:py-24 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-14">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#687386] mb-1 block">
            HOW IT WORKS
          </span>
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-[#071A2F] tracking-tight">
            PERSONALIZE IN 3 STEPS
          </h2>
          <p className="text-xs sm:text-base text-[#687386] mt-1 sm:mt-2 font-normal leading-relaxed">
            Turn your favorite memories into something tangible. No app or photo upload needed.
          </p>
        </div>

        {/* MOBILE VIEW: Ultra-compact 3 Steps in 1 sleek container (< sm) */}
        <div className="sm:hidden bg-[#FAF8F4] rounded-2xl p-3.5 border border-[#071A2F]/8 divide-y divide-[#071A2F]/8">
          {STEPS.map((step, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${idx === 0 ? 'pb-2.5' : idx === STEPS.length - 1 ? 'pt-2.5' : 'py-2.5'}`}>
              <span className="text-xs font-mono font-black text-[#C5A46D] tracking-wider pt-0.5 w-6 flex-shrink-0">
                {step.num}
              </span>
              <div>
                <h3 className="font-bold text-xs text-[#071A2F] tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className="text-[11px] text-[#687386] font-light leading-tight mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: 3 Process Columns (sm+) */}
        <div className="hidden sm:grid grid-cols-3 gap-8">
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-mono font-bold text-[#C5A46D] tracking-widest">
                    {step.num}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#071A2F]/10"></div>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-[#071A2F] mb-2 tracking-tight">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#687386] font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PersonalizationProcess;
