// src/app/page.js
"use client";
import HeroSection from "@/components/home/sections/Hero";
import ClientWrapper from "@/components/ClientWrapper";
import { useState, useEffect, lazy, Suspense, useMemo } from "react";

// Lazy load non-critical components
const WomenSection = lazy(() => import("@/components/home/sections/Women"));
const MenSection = lazy(() => import("@/components/home/sections/Men"));
const Footer = lazy(() => import("@/components/Footer"));

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Memoize section names to prevent unnecessary re-renders
  const sectionNames = useMemo(() => 
    isMobile ? ["hero", "women", "men", "footer"] : ["hero", "footer"],
    [isMobile]
  );

  return (
    <ClientWrapper 
      mountRadius={1}
      sectionNames={sectionNames}
    >
      <HeroSection />
      {isMobile && (
        <Suspense fallback={<div className="w-full h-full bg-gray-900 animate-pulse" />}>
          <WomenSection link="/collections/fall-2025" />
        </Suspense>
      )}
      {isMobile && (
        <Suspense fallback={<div className="w-full h-full bg-gray-900 animate-pulse" />}>
          <MenSection link="/lookbook" />
        </Suspense>
      )}
      <Suspense fallback={<div className="w-full h-full bg-gray-900 animate-pulse" />}>
        <Footer fullPage />
      </Suspense>
    </ClientWrapper>
  );
}