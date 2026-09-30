import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'CHOOSE YOUR GIFT',
    desc: 'Pick the product that feels right — from handcrafted frames to custom magazines and polaroids.'
  },
  {
    num: '02',
    title: 'PERSONALIZE & ORDER',
    desc: 'Select your options, add any custom text, and complete your order smoothly on our store.'
  },
  {
    num: '03',
    title: 'WHATSAPP YOUR PHOTOS',
    desc: 'Send your photos and details via WhatsApp. We craft your digital preview for approval before printing.'
  },
  {
    num: '04',
    title: 'READY TO GIFT',
    desc: 'Receive something made specifically for your moment, packed safely and delivered to your doorstep.'
  }
];

const PersonalizationProcess = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#687386] mb-2.5 block">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#071A2F] tracking-tight">
            PERSONALIZING IS EASY.
          </h2>
          <p className="text-sm sm:text-base text-[#687386] mt-3 font-normal leading-relaxed">
            Turn your favorite memories into something tangible in four simple steps.
          </p>
        </div>

        {/* 4 Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
