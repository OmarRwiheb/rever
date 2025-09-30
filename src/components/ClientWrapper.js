// components/ClientWrapper.js
"use client";
import React, { useRef, useCallback, useState, useMemo, useEffect } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useNavbar } from "@/components/Navbar";
import LoadingScreen from "./LoadingScreen";

gsap.registerPlugin(Observer);

export default function ClientWrapper({
  children,
  mountRadius = 1,
  sectionNames = ["hero", "women", "men", "second-video", "footer"],
}) {
  const containerRef = useRef(null);
  const panelsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const tween = useRef(null);
  const lastScrollTime = useRef(0);
  const lastSectionUpdate = useRef(0);
  const observerRef = useRef(null);

  const SCROLL_COOLDOWN = 1000;
  const SECTION_UPDATE_COOLDOWN = 100;
  const now = () => Date.now();
  const { setCurrentSection } = useNavbar();

  const kids = useMemo(() => {
    return React.Children.toArray(children).filter(Boolean);
  }, [children]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setPanelRef = useCallback((el, index) => {
    if (el) {
      panelsRef.current[index] = el;
    }
  }, []);

  const updateNavbarSection = useCallback(
    (index) => {
      const t = now();
      if (t - lastSectionUpdate.current < SECTION_UPDATE_COOLDOWN) return;
      setCurrentSection(sectionNames[index] || "hero");
      lastSectionUpdate.current = t;
    },
    [setCurrentSection, sectionNames]
  );

  useEffect(() => {
    if (!mounted || !containerRef.current || panelsRef.current.length === 0) return;

    // Prevent pull-to-refresh on mobile only when at first panel
    const preventPullRefresh = (e) => {
      if (currentIndexRef.current <= 0) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Add touch event listeners for mobile pull-to-refresh prevention
    const handleTouchStart = (e) => {
      if (currentIndexRef.current <= 0 && e.touches[0].clientY > 50) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (currentIndexRef.current <= 0) {
        e.preventDefault();
      }
    };

    // Add event listeners only to the container, not the entire document
    if (containerRef.current) {
      containerRef.current.addEventListener('touchstart', handleTouchStart, { passive: false });
      containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
      containerRef.current.addEventListener('gesturestart', preventPullRefresh, { passive: false });
    }

    // Small delay to ensure all panels are rendered
    const initTimeout = setTimeout(() => {
      // Position panels
      panelsRef.current.forEach((panel, i) => {
        if (panel) {
          gsap.set(panel, {
            yPercent: i === 0 ? 0 : 100,
            zIndex: 10 + i,
          });
        }
      });

      updateNavbarSection(0);

      // Create observer
      if (observerRef.current) {
        observerRef.current.kill();
      }

      observerRef.current = Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        preventDefault: true,
        wheelSpeed: -1,
        tolerance: 10,
        allowClicks: true,
        lockAxis: true,
        ignoreInertia: true,
        dragMinimum: 10,
        onUp: () => {
          console.log("Scroll up detected, current index:", currentIndexRef.current);
          
          if (
            (tween.current && tween.current.isActive()) ||
            currentIndexRef.current >= panelsRef.current.length - 1 ||
            now() - lastScrollTime.current < SCROLL_COOLDOWN
          ) {
            console.log("Scroll blocked");
            return;
          }

          const next = panelsRef.current[currentIndexRef.current + 1];
          if (next) {
            console.log("Animating to next panel");
            tween.current = gsap.to(next, {
              yPercent: 0,
              duration: 0.6,
              ease: "power3.out",
              onComplete: () => {
                setActiveIndex(currentIndexRef.current);
                console.log("Animation complete, new index:", currentIndexRef.current);
              },
            });
            currentIndexRef.current++;
            updateNavbarSection(currentIndexRef.current);
            lastScrollTime.current = now();
          }
        },
        onDown: () => {
          console.log("Scroll down detected, current index:", currentIndexRef.current);
          
          if (
            (tween.current && tween.current.isActive()) ||
            currentIndexRef.current <= 0 ||
            now() - lastScrollTime.current < SCROLL_COOLDOWN
          ) {
            console.log("Scroll blocked");
            return;
          }

          const current = panelsRef.current[currentIndexRef.current];
          if (current) {
            console.log("Animating to previous panel");
            tween.current = gsap.to(current, {
              yPercent: 100,
              duration: 0.6,
              ease: "power3.out",
              onComplete: () => {
                setActiveIndex(currentIndexRef.current);
                console.log("Animation complete, new index:", currentIndexRef.current);
              },
            });
            currentIndexRef.current--;
            updateNavbarSection(currentIndexRef.current);
            lastScrollTime.current = now();
          }
        },
      });

      console.log("GSAP Observer initialized with", panelsRef.current.length, "panels");
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (observerRef.current) {
        observerRef.current.kill();
      }
      if (tween.current) {
        tween.current.kill();
      }
      // Remove event listeners from container
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('gesturestart', preventPullRefresh);
      }
    };
  }, [mounted, updateNavbarSection, kids.length]);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      ref={containerRef}
      style={{ 
        contain: "layout paint size",
        background: "transparent",
        overscrollBehavior: "none",
        touchAction: "pan-y",
        WebkitOverflowScrolling: "touch",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {kids.map((Child, i) => {
        const shouldMount = Math.abs(i - activeIndex) <= mountRadius || i === 0;

        return (
          <div
            key={`panel-${i}`}
            ref={(el) => setPanelRef(el, i)}
            className="panel"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
              willChange: "transform",
              background: "transparent",
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
      className="w-full h-full bg-transparent"
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
            .panel > div {
              width: 100%;
              height: 100%;
            }
          `,
        }}
      />
      {children}
    </div>
  );
}