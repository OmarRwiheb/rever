import FullPageScroll from "@/components/home/layout/FullPageScroll";
import HeroSection from "@/components/home/sections/Hero";
import WomenSection from "@/components/home/sections/Women";
import MenSection from "@/components/home/sections/Men";
import Footer from "@/components/Footer";
import SecondVideo from "@/components/home/sections/SecondVideo";

export default function HomePage() {
  return (
    <>
      <FullPageScroll
        children={[
          <HeroSection key="hero" />,
          <WomenSection key="women" />,
          <MenSection key="men" />,
          <SecondVideo key="second-video" />,
          <Footer key="footer" fullPage />
        ]}
      />
    </>
  );
}
