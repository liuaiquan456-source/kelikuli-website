import type { Metadata } from "next";
import HeroCarousel from "@/components/HeroCarousel";
import FeatureBadges from "@/components/FeatureBadges";
import RecommendedCollections from "@/components/RecommendedCollections";
import CreateCustomBanner from "@/components/CreateCustomBanner";
import OEMProcess from "@/components/OEMProcess";
import FeaturedCollections from "@/components/FeaturedCollections";
import LatestProducts from "@/components/LatestProducts";
import WhyChoose from "@/components/WhyChoose";
import StatsSection from "@/components/StatsSection";
import ServiceSection from "@/components/ServiceSection";

export const metadata: Metadata = {
  title: "Resin Figurine Manufacturer — China OEM Factory",
  description:
    "Custom resin figurine manufacturer in China. OEM/ODM blind box toys, wholesale figurines, Zakka crafts — low MOQ, hand-painted, factory-direct since 2005.",
  alternates: { canonical: "https://kelikuli.com" },
};

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <FeatureBadges />
      <RecommendedCollections />
      <CreateCustomBanner />
      <OEMProcess />
      <LatestProducts />
      <WhyChoose />
      <StatsSection />
      <ServiceSection />
      <FeaturedCollections />
    </>
  );
}
