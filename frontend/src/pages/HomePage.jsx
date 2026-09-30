import React, { useEffect } from 'react';
import Hero3D from '../components/Hero3D';
import CategoryGrid from '../components/CategoryGrid';
import BestSellersSection from '../components/BestSellersSection';
import MomentsStorySection from '../components/MomentsStorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import PersonalizationProcess from '../components/PersonalizationProcess';
import WhyChooseUs from '../components/WhyChooseUs';
import CommunityGallery from '../components/CommunityGallery';
import PremiumCTA from '../components/PremiumCTA';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="w-full bg-[#FAF8F4] overflow-x-hidden">
      {/* 1. CINEMATIC 3D HERO */}
      <Hero3D />

      {/* 2. PERSONALIZED CATEGORIES (What Are You Looking For?) */}
      <CategoryGrid />

      {/* 3. BEST SELLERS */}
      <BestSellersSection />

      {/* 4. SCROLL STORY (Make Their Moment Unforgettable) */}
      <MomentsStorySection />

      {/* 5. FEATURED GIFTS (Curated Selection of Handcrafted Gifts) */}
      <FeaturedProducts />

      {/* 6. HOW IT WORKS (Personalizing Is Easy - 4 Simple Steps) */}
      <PersonalizationProcess />

      {/* 7. THE INFINITY DIFFERENCE (Deep Navy #071A2F Brand Story) */}
      <WhyChooseUs />

      {/* 8. Real Social Proof & Community Studio Gallery (Desktop only to keep mobile strictly to 10 sections) */}
      <div className="hidden lg:block">
        <CommunityGallery />
      </div>

      {/* 9. FINAL CONVERSION CTA BANNER */}
      <PremiumCTA />
    </main>
  );
};

export default HomePage;

