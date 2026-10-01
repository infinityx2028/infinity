import React, { useEffect } from 'react';
import Hero3D from '../components/Hero3D';
import CategoryGrid from '../components/CategoryGrid';
import InfinityAISection from '../components/InfinityAI/InfinityAISection';
import BestSellersSection from '../components/BestSellersSection';
import MomentsStorySection from '../components/MomentsStorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import PersonalizationProcess from '../components/PersonalizationProcess';
import WhyChooseUs from '../components/WhyChooseUs';
import PremiumCTA from '../components/PremiumCTA';
import { CatalogProvider } from '../contexts/CatalogContext';
import '../studio.css';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <CatalogProvider><main className="studio-home w-full bg-[#FAF8F4]">
      {/* 03. COMPACT CINEMATIC 3D HERO */}
      <Hero3D />

      {/* 04. INFINITY AI — PERSONAL GIFT CONCIERGE */}
      <InfinityAISection />

      {/* 05. SHOP BY CATEGORY */}
      <CategoryGrid />

      {/* 06. SIGNATURE KEEPSAKES (BEST SELLERS) */}
      <BestSellersSection />

      {/* BRAND STORY: FROM CAMERA ROLL TO SOMETHING REAL */}
      <MomentsStorySection />

      {/* FEATURED GIFTS */}
      <FeaturedProducts />

      {/* THE INFINITY DIFFERENCE */}
      <WhyChooseUs />

      <PersonalizationProcess />

      {/* 09. FINAL EMOTIONAL CTA / BRAND KEEPSAKE BANNER */}
      <PremiumCTA />
    </main></CatalogProvider>
  );
};

export default HomePage;

