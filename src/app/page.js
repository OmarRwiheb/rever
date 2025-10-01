// src/app/page.js
import { headers } from 'next/headers';
import HeroSection from "@/components/home/sections/Hero";
import WomenSection from "@/components/home/sections/Women";
import MenSection from "@/components/home/sections/Men";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";

export default function HomePage() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

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