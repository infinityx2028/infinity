import React from 'react';

const AnnouncementBar = () => {
  return (
    <div className="bg-[#071A2F] text-white/90 text-[10px] sm:text-[11px] h-[28px] px-4 border-b border-[#0B2748]/60 tracking-wider font-bold text-center select-none flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="w-1 h-1 rounded-full bg-[#C5A46D] inline-block"></span>
        <span className="uppercase tracking-widest text-[9.5px] sm:text-[10.5px]">
          Personalized Gifts • Made With Care
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;

