import type { Metadata } from "next";
import HeroCarousel from "@/components/HeroCarousel";
import FeatureBadges from "@/components/FeatureBadges";
import RecommendedCollections from "@/components/RecommendedCollections";
import CreateCustomBanner from "@/components/CreateCustomBanner";
import OEMProcess from "@/components/OEMProcess";
import FeaturedCollections from "@/components/FeaturedCollections";
import TrustedBrands from "@/components/TrustedBrands";
import WhyChoose from "@/components/WhyChoose";
import StatsSection from "@/components/StatsSection";
import ServiceSection from "@/components/ServiceSection";

export const metadata: Metadata = {
  title: "Custom Resin Toys & Figurines Manufacturer | Kelikuli",
  description:
    "Kelikuli manufactures custom resin toys, figurines, blind box collectibles, Zakka ornaments, and seasonal resin crafts with OEM/ODM service since 2005.",
};

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <FeatureBadges />
      <RecommendedCollections />
      <CreateCustomBanner />
      <OEMProcess />
      <TrustedBrands />
      <WhyChoose />
      <StatsSection />
      <ServiceSection />
      <FeaturedCollections />
    </>
  );
}
