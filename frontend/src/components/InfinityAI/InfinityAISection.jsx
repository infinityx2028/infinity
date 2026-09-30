import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useInfinityAI } from '../../contexts/InfinityAIContext';

const QUICK_IDEAS = [
  'Birthday',
  'Anniversary',
  'Best Friend',
  'Under ₹500'
];

export default function InfinityAISection() {
  const { openInfinityAI } = useInfinityAI();
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    openInfinityAI(inputVal.trim());
  };

  const handleChip = (idea) => {
    if (idea === 'Under ₹500') {
      openInfinityAI('Personalized gift under ₹500');
    } else {
      openInfinityAI(`${idea} gift`);
    }
  };

  return (
    <section className="py-8 sm:py-14 bg-white border-b border-[#071A2F]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Compact Editorial Card */}
        <div className="relative rounded-3xl bg-[#FAF8F4] border border-[#071A2F]/8 p-6 sm:p-10 text-center overflow-hidden shadow-xs">
          {/* Subtle champagne corner aura */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A46D]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#C5A46D] border border-[#C5A46D]/20 shadow-2xs mb-3">
            <Sparkles size={13} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#071A2F]">
              MEET INFINITY AI
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#071A2F] tracking-tight mb-2">
            NOT SURE WHAT TO GIFT?
          </h2>

          {/* Copy */}
          <p className="text-xs sm:text-sm text-[#687386] font-normal max-w-lg mx-auto leading-relaxed mb-6">
            Tell us who you're shopping for, the occasion and your budget. We'll find the best matches from our collection.
          </p>

          {/* Input & Button */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-1.5 rounded-2xl border border-[#071A2F]/12 shadow-xs">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Describe who you're shopping for..."
                className="flex-1 h-12 px-4 rounded-xl text-xs sm:text-sm text-[#071A2F] placeholder:text-[#687386]/60 font-medium focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-[#071A2F] hover:bg-[#0B2748] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
              >
                <span>FIND MY GIFT</span>
                <ArrowRight size={14} className="text-[#C5A46D]" />
              </button>
            </div>
          </form>

          {/* Quick Ideas Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#687386]">
            <span className="text-[11px] font-semibold text-[#687386]">
              Quick ideas:
            </span>
            {QUICK_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChip(idea)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-[#071A2F] text-[#071A2F] hover:text-white border border-[#071A2F]/10 text-[11px] font-medium transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {idea}
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
