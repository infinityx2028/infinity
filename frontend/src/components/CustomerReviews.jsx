import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Priya S.',
    location: 'Bengaluru',
    bought: 'Custom Photo Frame (Black 6x8)',
    quote: 'The print clarity and frame finish exceeded all my expectations. My partner was moved to tears when he opened it.',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    location: 'Mumbai',
    bought: 'Polaroid Set of 16 Keepsakes',
    quote: 'Feels like holding real memories in hand. The thick archival paper and packaging made it the perfect anniversary surprise.',
    rating: 5,
  },
  {
    name: 'Ananya K.',
    location: 'Hyderabad',
    bought: 'Custom Anniversary Magazine',
    quote: 'Looked like an authentic high-fashion magazine featuring our love story. Everyone at the party kept asking where I got it!',
    rating: 5,
  },
  {
    name: 'Kavya & Arjun',
    location: 'Chennai',
    bought: 'Wax-Sealed Love Letter & Hamper',
    quote: 'Seamless ordering and WhatsApp preview approval gave complete peace of mind. Arrived on time and in flawless condition.',
    rating: 5,
  }
];

const CustomerReviews = () => {
  return (
    <section className="py-7 sm:py-16 bg-[#FAF8F4] border-b border-[#071A2F]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#C5A46D] mb-1 block">
              REAL CUSTOMER EXPERIENCES
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#071A2F] tracking-tight">
              MOMENTS CHERISHED ACROSS INDIA
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#071A2F] font-semibold mt-2 sm:mt-0">
            <span className="flex text-[#C5A46D]">★★★★★</span>
            <span>4.9 / 5 Average Studio Rating</span>
          </div>
        </div>

        {/* MOBILE VIEW: Swipeable Carousel */}
        <div className="sm:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 no-scrollbar">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="min-w-[275px] max-w-[285px] snap-center bg-white rounded-2xl p-4 border border-[#071A2F]/8 shadow-[0_2px_10px_rgba(7,26,47,0.04)] flex flex-col justify-between flex-shrink-0"
            >
              <div>
                {/* Rating & Verified Pill */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-0.5 text-[#C5A46D]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={12} fill="#C5A46D" className="text-[#C5A46D]" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={9} /> Verified Purchase
                  </span>
                </div>

                {/* Quote (Max 2 lines) */}
                <p className="text-xs text-[#071A2F] font-normal leading-relaxed line-clamp-2">
                  "{review.quote}"
                </p>
              </div>

              {/* Author & Product */}
              <div className="mt-3 pt-2.5 border-t border-[#071A2F]/6">
                <span className="text-[10px] text-[#C5A46D] font-bold block truncate">
                  {review.bought}
                </span>
                <p className="text-[11px] text-[#687386] font-medium mt-0.5">
                  <strong className="text-[#071A2F] font-bold">{review.name}</strong> • {review.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: 4-Column Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-[#071A2F]/8 shadow-[0_2px_12px_rgba(7,26,47,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-0.5 text-[#C5A46D]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={13} fill="#C5A46D" className="text-[#C5A46D]" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Verified
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#071A2F] font-light leading-relaxed mb-4">
                  "{review.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#071A2F]/6">
                <span className="text-[11px] text-[#C5A46D] font-bold block truncate">
                  {review.bought}
                </span>
                <p className="text-xs text-[#687386] font-medium mt-0.5">
                  <strong className="text-[#071A2F] font-bold">{review.name}</strong> • {review.location}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CustomerReviews;
