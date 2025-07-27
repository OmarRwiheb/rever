"use client";
import { useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useNavbar } from "@/components/Navbar";

gsap.registerPlugin(Observer);

export default function FullPageScroll({ children }) {
  const containerRef = useRef(null);
  const panelsRef = useRef([]);
  const currentIndex = useRef(0);
  const tween = useRef(null);
  const lastScrollTime = useRef(0);
  const lastSectionUpdate = useRef(0);
  const SCROLL_COOLDOWN = 1000;
  const SECTION_UPDATE_COOLDOWN = 100; // Prevent too frequent context updates
  const now = () => new Date().getTime();
  const { setCurrentSection } = useNavbar();

  // Define section names in order
  const sectionNames = ['hero', 'women', 'men', 'second-video', 'footer'];

  const setPanelRef = (el, index) => {
    if (el) panelsRef.current[index] = el;
  };

  const updateNavbarSection = useCallback((index) => {
    const currentTime = now();
    // Only update if enough time has passed since last update
    if (currentTime - lastSectionUpdate.current < SECTION_UPDATE_COOLDOWN) {
      return;
    }
    
    const sectionName = sectionNames[index] || 'hero';
    setCurrentSection(sectionName);
    lastSectionUpdate.current = currentTime;
  }, [setCurrentSection]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    panelsRef.current.forEach((panel, i) => {
      gsap.set(panel, { yPercent: i === 0 ? 0 : 100, zIndex: 10 + i });
    });

    // Set initial section
    updateNavbarSection(0);

    Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      preventDefault: true,
      wheelSpeed: -1,
      tolerance: 10,
      allowClicks: true,
      lockAxis: true,
      onUp: () => {
        if (
          tween.current?.isActive() ||
          currentIndex.current >= panelsRef.current.length - 1 ||
          now() - lastScrollTime.current < SCROLL_COOLDOWN
        )
          return;

        const next = panelsRef.current[currentIndex.current + 1];
        tween.current = gsap.to(next, { yPercent: 0, duration: 0.6, ease: "power3.out" });
        currentIndex.current++;
        updateNavbarSection(currentIndex.current);
        lastScrollTime.current = now();
      },
      onDown: () => {
        if (
          tween.current?.isActive() ||
          currentIndex.current <= 0 ||
          now() - lastScrollTime.current < SCROLL_COOLDOWN
        )
          return;

        const current = panelsRef.current[currentIndex.current];
        tween.current = gsap.to(current, { yPercent: 100, duration: 0.6, ease: "power3.out" });
        currentIndex.current--;
        updateNavbarSection(currentIndex.current);
        lastScrollTime.current = now();
      },
    });
  }, [updateNavbarSection]);

  return (
    <div className="relative w-screen h-screen overflow-hidden pt-20" ref={containerRef}>
      {children.map((Child, i) => (
        <div
          key={`panel-${i}`}
          ref={(el) => setPanelRef(el, i)}
          className="panel absolute inset-0"
          style={{ zIndex: 10 + i, willChange: "transform" }}
        >
          {Child}
        </div>
      ))}
    </div>
  );
}
