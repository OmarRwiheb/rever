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
      sectionNames={["hero", "women", "men", "footer"]}
    >
      <HeroSection />
      <WomenSection link="/collections/fall-2025" />
      <MenSection link="/lookbook" />
      <Footer fullPage />
    </ClientWrapper>
  );
}