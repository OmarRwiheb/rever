"use client";

import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
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
  const idxRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const tweenRef = useRef(null);
  const lastScrollRef = useRef(0);
  const lastSectionUpdate = useRef(0);
  const ctxRef = useRef(null);
  const isAnimatingRef = useRef(false);

  // iOS-optimized timings
  const SCROLL_COOLDOWN = 900;
  const SECTION_UPDATE_COOLDOWN = 150;
  const DURATION = 0.5; // slightly faster feels better on iOS

  const { setCurrentSection } = useNavbar?.() || { setCurrentSection: () => {} };
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const kids = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);
  const setPanelRef = (el, i) => { if (el) panelsRef.current[i] = el; };

  const updateNavbarSection = useCallback((i) => {
    const now = Date.now();
    if (now - lastSectionUpdate.current < SECTION_UPDATE_COOLDOWN) return;
    setCurrentSection(sectionNames[i] || "hero");
    lastSectionUpdate.current = now;
  }, [setCurrentSection, sectionNames]);

  // Enhanced GSAP config for iOS
  useEffect(() => {
    gsap.ticker.fps(60);
    gsap.ticker.useRAF(true);
    gsap.ticker.lagSmoothing(500, 16);
    
    // Force hardware acceleration setup
    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    ctxRef.current = gsap.context(() => {
      // Initial setup with hardware acceleration
      panelsRef.current.forEach((panel, i) => {
        gsap.set(panel, {
          position: "absolute",
          inset: 0,
          yPercent: i === 0 ? 0 : 100,
          zIndex: 10 + i,
          force3D: true,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          perspective: 1000,
        });
      });

      updateNavbarSection(0);

      if (prefersReducedMotion) return;

      // iOS-safe video management
      const syncVideos = (nextIndex) => {
        requestAnimationFrame(() => {
          panelsRef.current.forEach((p, i) => {
            const v = p?.querySelector?.("video");
            if (!v) return;
            
            if (i === nextIndex) {
              v.currentTime = 0; // reset for smooth playback
              const pr = v.play();
              if (pr?.catch) pr.catch(() => {});
            } else {
              v.pause();
            }
          });
        });
      };

      const goTo = (nextIndex) => {
        if (!panelsRef.current[nextIndex] || isAnimatingRef.current) return;
        
        const dir = nextIndex > idxRef.current ? 1 : -1;
        const currentPanel = panelsRef.current[idxRef.current];
        const nextPanel = panelsRef.current[nextIndex];

        isAnimatingRef.current = true;

        // Kill any running animation
        if (tweenRef.current?.kill) tweenRef.current.kill();

        // Create timeline for smoother iOS performance
        const tl = gsap.timeline({
          onComplete: () => {
            isAnimatingRef.current = false;
            idxRef.current = nextIndex;
            setActiveIndex(nextIndex);
            updateNavbarSection(nextIndex);
            syncVideos(nextIndex);
            
            // Clean up transform on inactive panels
            if (dir > 0) {
              gsap.set(currentPanel, { yPercent: 100 });
            }
          },
        });

        if (dir > 0) {
          // Scrolling down: move next panel up
          tl.to(nextPanel, {
            yPercent: 0,
            duration: DURATION,
            ease: "power2.out",
            force3D: true,
          });
        } else {
          // Scrolling up: move current panel down
          tl.to(currentPanel, {
            yPercent: 100,
            duration: DURATION,
            ease: "power2.out",
            force3D: true,
          });
        }

        tweenRef.current = tl;
      };

      // iOS-optimized Observer settings
      const obs = Observer.create({
        target: window,
        type: "wheel,touch",
        tolerance: 20, // higher tolerance for iOS
        wheelSpeed: -1,
        lockAxis: true,
        preventDefault: true, // prevent iOS bounce
        dragMinimum: 10,
        onUp: () => {
          const now = Date.now();
          if (isAnimatingRef.current || now - lastScrollRef.current < SCROLL_COOLDOWN) return;
          if (idxRef.current >= panelsRef.current.length - 1) return;
          lastScrollRef.current = now;
          goTo(idxRef.current + 1);
        },
        onDown: () => {
          const now = Date.now();
          if (isAnimatingRef.current || now - lastScrollRef.current < SCROLL_COOLDOWN) return;
          if (idxRef.current <= 0) return;
          lastScrollRef.current = now;
          goTo(idxRef.current - 1);
        },
      });

      ctxRef.current._obs = obs;
      syncVideos(0);
    }, containerRef);

    return () => {
      ctxRef.current?.revert();
      if (ctxRef.current?._obs?.kill) ctxRef.current._obs.kill();
      if (tweenRef.current?.kill) tweenRef.current.kill();
      isAnimatingRef.current = false;
    };
  }, [kids.length, updateNavbarSection, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen overflow-hidden"
      style={{
        height: "100dvh",
        WebkitOverflowScrolling: "touch",
        transform: "translate3d(0,0,0)", // force GPU layer
        willChange: "transform",
        isolation: "isolate",
        overscrollBehavior: "none",
        touchAction: "pan-y pinch-zoom", // allow zoom but control pan
        background: "black",
      }}
    >
      {kids.map((Child, i) => {
        const shouldMount = Math.abs(i - activeIndex) <= mountRadius || i === 0;
        return (
          <div
            key={`panel-${i}`}
            ref={(el) => setPanelRef(el, i)}
            className="panel absolute inset-0"
            style={{
              zIndex: 10 + i,
              width: "100vw",
              height: "100dvh",
              overflow: "hidden",
              visibility: Math.abs(i - activeIndex) <= 1 ? "visible" : "hidden",
              background: "black",
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden",
            }}
          >
            {shouldMount ? (
              <PanelContent isActive={i === activeIndex}>
                <div className="pt-20 w-full h-full">{Child}</div>
              </PanelContent>
            ) : (
              <SkeletonShell />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonShell() {
  return (
    <div className="w-full h-full relative bg-neutral-900/50">
      <div className="absolute inset-0 animate-pulse bg-neutral-800/30" />
    </div>
  );
}

function PanelContent({ children, isActive }) {
  return (
    <div 
      className="w-full h-full" 
      style={{ 
        overflow: "hidden",
        transform: "translate3d(0,0,0)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .panel img, .panel video, .panel picture {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              transform: translate3d(0,0,0);
              backface-visibility: hidden;
            }
            .panel video {
              -webkit-backface-visibility: hidden;
              -webkit-transform: translate3d(0,0,0);
            }
          `,
        }}
      />
      {children}
    </div>
  );
}