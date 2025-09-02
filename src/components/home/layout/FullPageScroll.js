"use client";
import { useLayoutEffect, useRef, useCallback, useState, useMemo, React } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useNavbar } from "@/components/Navbar";

gsap.registerPlugin(Observer);

export default function FullPageScroll({
  children,
  mountRadius = 1,
  sectionNames = ["hero", "women", "men", "second-video", "footer"],
}) {
  const containerRef = useRef(null);
  const panelsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const tween = useRef(null);
  const lastScrollTime = useRef(0);
  const lastSectionUpdate = useRef(0);

  const SCROLL_COOLDOWN = 1000;
  const SECTION_UPDATE_COOLDOWN = 100;
  const now = () => Date.now();
  const { setCurrentSection } = useNavbar();

  const kids = useMemo(() => {
    // robust way to normalize children
    return React.Children.toArray(children).filter(Boolean);
  }, [children]);

  const setPanelRef = (el, index) => {
    if (el) panelsRef.current[index] = el;
  };

  const updateNavbarSection = useCallback(
    (index) => {
      const t = now();
      if (t - lastSectionUpdate.current < SECTION_UPDATE_COOLDOWN) return;
      setCurrentSection(sectionNames[index] || "hero");
      lastSectionUpdate.current = t;
    },
    [setCurrentSection, sectionNames]
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Position shells immediately
    panelsRef.current.forEach((panel, i) => {
      gsap.set(panel, {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        yPercent: i === 0 ? 0 : 100,
        zIndex: 10 + i,
        willChange: "transform",
      });
    });

    updateNavbarSection(0);

    const obs = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      preventDefault: true,
      wheelSpeed: -1,
      tolerance: 10,
      allowClicks: true,
      lockAxis: true,
      onUp: () => {
        if (
          (tween.current && tween.current.isActive && tween.current.isActive()) ||
          currentIndexRef.current >= panelsRef.current.length - 1 ||
          now() - lastScrollTime.current < SCROLL_COOLDOWN
        )
          return;

        const next = panelsRef.current[currentIndexRef.current + 1];
        tween.current = gsap.to(next, {
          yPercent: 0,
          duration: 0.6,
          ease: "power3.out",
          onComplete: () => setActiveIndex((i) => i + 1),
        });
        currentIndexRef.current++;
        updateNavbarSection(currentIndexRef.current);
        lastScrollTime.current = now();
      },
      onDown: () => {
        if (
          (tween.current && tween.current.isActive && tween.current.isActive()) ||
          currentIndexRef.current <= 0 ||
          now() - lastScrollTime.current < SCROLL_COOLDOWN
        )
          return;

        const current = panelsRef.current[currentIndexRef.current];
        tween.current = gsap.to(current, {
          yPercent: 100,
          duration: 0.6,
          ease: "power3.out",
          onComplete: () => setActiveIndex((i) => i - 1),
        });
        currentIndexRef.current--;
        updateNavbarSection(currentIndexRef.current);
        lastScrollTime.current = now();
      },
    });

    return () => {
      if (obs && obs.kill) obs.kill();
      if (tween.current && tween.current.kill) tween.current.kill();
    };
  }, [updateNavbarSection, kids.length]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden pt-20"
      ref={containerRef}
      style={{ contain: "layout paint size" }}
    >
      {kids.map((Child, i) => {
        const shouldMount =
          Math.abs(i - activeIndex) <= mountRadius || i === 0;

        return (
          <div
            key={`panel-${i}`}
            ref={(el) => setPanelRef(el, i)}
            className="panel absolute inset-0"
            style={{
              zIndex: 10 + i,
              width: "100vw",
              height: "calc(100vh - 5rem)", // matches pt-20 header space
              overflow: "hidden",
              contentVisibility: i === activeIndex ? "visible" : "auto",
              contain: "content",
              background: "black",
            }}
          >
            {!shouldMount ? <SkeletonShell /> : <PanelContent>{Child}</PanelContent>}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonShell() {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 animate-pulse bg-neutral-900/50" />
    </div>
  );
}

function PanelContent({ children }) {
  return (
    <div
      className="w-full h-full"
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .panel img, .panel video, .panel picture {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
          `,
        }}
      />
      {children}
    </div>
  );
}
