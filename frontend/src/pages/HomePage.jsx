import React, { useEffect } from 'react';
import Hero3D from '../components/Hero3D';
import CategoryGrid from '../components/CategoryGrid';
import BestSellersSection from '../components/BestSellersSection';
import PersonalizationProcess from '../components/PersonalizationProcess';
import FeaturedProducts from '../components/FeaturedProducts';
import WhyChooseUs from '../components/WhyChooseUs';
import CommunityGallery from '../components/CommunityGallery';
import PremiumCTA from '../components/PremiumCTA';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="w-full bg-[#FAF8F4] overflow-x-hidden">
      {/* 1. 3D Hero Carousel (Instant Clarity, High Conversion, 1.5s Glide) */}
      <Hero3D />

      {/* 2. What Are You Looking For? (Categories + Quick Chips) */}
      <CategoryGrid />

      {/* 3. Best Sellers (1 Line on PC, 2 Lines on Mobile) */}
      <BestSellersSection />

      {/* 4. Personalizing Is Easy (How It Works: 4 Simple Steps) */}
      <PersonalizationProcess />

      {/* 5. Featured / Curated Selection of Real Gifts */}
      <FeaturedProducts />

      {/* 6. The Infinity Difference (Deep Navy #071A2F Brand Story) */}
      <WhyChooseUs />

      {/* 7. Real Social Proof & Community Studio Gallery */}
      <CommunityGallery />

      {/* 8. Final Conversion CTA Banner */}
      <PremiumCTA />
    </main>
  );
};

export default HomePage;

