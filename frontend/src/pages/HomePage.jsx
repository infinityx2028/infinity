import React, { useEffect } from 'react';
import Hero3D from '../components/Hero3D';
import CategoryGrid from '../components/CategoryGrid';
import InfinityAISection from '../components/InfinityAI/InfinityAISection';
import BestSellersSection from '../components/BestSellersSection';
import MomentsStorySection from '../components/MomentsStorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import PersonalizationProcess from '../components/PersonalizationProcess';
import CustomerReviews from '../components/CustomerReviews';
import WhyChooseUs from '../components/WhyChooseUs';
import CommunityGallery from '../components/CommunityGallery';
import PremiumCTA from '../components/PremiumCTA';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="w-full bg-[#FAF8F4] overflow-x-hidden">
      {/* 03. COMPACT CINEMATIC 3D HERO */}
      <Hero3D />

      {/* 04. INFINITY AI — PERSONAL GIFT CONCIERGE */}
      <InfinityAISection />

      {/* 05. SHOP BY CATEGORY */}
      <CategoryGrid />

      {/* 06. SIGNATURE KEEPSAKES (BEST SELLERS) */}
      <BestSellersSection />

      {/* 07. HOW IT WORKS (THE GIFTING EXPERIENCE) */}
      <PersonalizationProcess />

      {/* 08. CUSTOMER MOMENTS & REVIEWS */}
      <CustomerReviews />

      {/* BRAND STORY: FROM CAMERA ROLL TO SOMETHING REAL */}
      <MomentsStorySection />

      {/* FEATURED GIFTS */}
      <FeaturedProducts />

      {/* THE INFINITY DIFFERENCE */}
      <WhyChooseUs />

      {/* Real Social Proof & Community Studio Gallery (Desktop) */}
      <div className="hidden lg:block">
        <CommunityGallery />
      </div>

      {/* 09. FINAL EMOTIONAL CTA / BRAND KEEPSAKE BANNER */}
      <PremiumCTA />
    </main>
  );
};

export default HomePage;

