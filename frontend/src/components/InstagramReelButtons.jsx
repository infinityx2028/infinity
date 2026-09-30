import React from 'react';
import { Instagram, Play, ExternalLink } from 'lucide-react';

const InstagramReelButtons = ({ instagramLinks }) => {
  if (!instagramLinks || instagramLinks.length === 0) {
    return null;
  }

  const handleWatchReel = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-xl border border-purple-200 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1.5 rounded-full">
          <Instagram className="text-white" size={16} />
        </div>
        <h3 className="text-base font-bold text-gray-800">Watch Sample Video Invitations</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {instagramLinks.slice(0, 4).map((link, index) => (
          <button
            key={index}
            onClick={() => handleWatchReel(link)}
            className="group relative overflow-hidden bg-white border border-purple-200 rounded-lg p-2 hover:border-purple-400 hover:shadow transition-all duration-200"
            title={`Watch Reel ${index + 1}`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Instagram size={14} className="text-white" />
              </div>
              <div className="text-[10px] font-semibold text-gray-700">Reel {index + 1}</div>
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                <Play size={10} className="text-purple-600" />
              </div>
            </div>
            
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ExternalLink size={10} className="text-purple-400" />
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-600 font-medium">
          <span className="inline-flex items-center gap-1">
            <Instagram size={12} className="text-purple-600" />
            Tap any reel to watch on Instagram
          </span>
        </p>
      </div>
    </div>
  );
};

export default InstagramReelButtons;
