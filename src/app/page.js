// src/app/page.js
import HeroSection from "@/components/home/sections/Hero";
import WomenSection from "@/components/home/sections/Women";
import MenSection from "@/components/home/sections/Men";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";

export default function HomePage() {
  return (
    <ClientWrapper 
      mountRadius={1}
      sectionNames={["women", "women", "men", "second-video", "footer"]}
    >
      {/* <HeroSection /> */}
      <WomenSection link="/collections/women" />
      <WomenSection link="/collections/women" />
      <MenSection link="/collections/fall-2025" />
      <Footer fullPage />
    </ClientWrapper>
  );
}