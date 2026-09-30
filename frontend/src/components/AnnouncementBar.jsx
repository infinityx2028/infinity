import React from 'react';

const AnnouncementBar = () => {
  return (
    <div className="bg-[#071A2F] text-white/90 text-[11px] sm:text-xs py-2 px-4 border-b border-[#0B2748]/60 tracking-widest font-semibold text-center select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D] inline-block opacity-90"></span>
        <span className="uppercase text-[10px] sm:text-[11px] tracking-widest">
          PERSONALIZED GIFTS • MADE WITH CARE
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;

