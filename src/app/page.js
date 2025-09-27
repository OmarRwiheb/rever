// src/app/page.js
import HeroSection from "@/components/home/sections/Hero";
import WomenSection from "@/components/home/sections/Women";
import MenSection from "@/components/home/sections/Men";
import Footer from "@/components/Footer";
import SecondVideo from "@/components/home/sections/SecondVideo";
import ClientWrapper from "@/components/ClientWrapper";

export default function HomePage() {
  return (
    <ClientWrapper 
      mountRadius={1}
      sectionNames={["hero", "women", "men", "second-video", "footer"]}
    >
      <HeroSection />
      <WomenSection />
      <MenSection />
      <SecondVideo />
      <Footer fullPage />
    </ClientWrapper>
  );
}