// src/app/page.js
"use client";
import HeroSection from "@/components/home/sections/Hero";
import WomenSection from "@/components/home/sections/Women";
import MenSection from "@/components/home/sections/Men";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <ClientWrapper 
      mountRadius={1}
      sectionNames={isMobile ? ["hero", "women", "men", "footer"] : ["hero", "footer"]}
    >
      <HeroSection />
      {isMobile && <WomenSection link="/collections/fall-2025" />}
      {isMobile && <MenSection link="/lookbook" />}
      <Footer fullPage />
    </ClientWrapper>
  );
}