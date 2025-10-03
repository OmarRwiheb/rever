// components/ClientWrapper.js
"use client";
import React, { useRef, useCallback, useState, useMemo, useEffect } from "react";
import { useNavbar } from "@/components/Navbar";

import gsap from "gsap";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

export default function ClientWrapper({
  children,
  mountRadius = 1,
  sectionNames = ["hero", "women", "men", "footer"],
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
  const isActiveRef = useRef(true);

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

  // Memoize section names to prevent unnecessary recreations
  const sectionNamesRef = useRef(sectionNames);
  useEffect(() => {
    sectionNamesRef.current = sectionNames;
  }, [sectionNames]);

  const updateNavbarSection = useCallback(
    (index) => {
      const t = now();
      if (t - lastSectionUpdate.current < SECTION_UPDATE_COOLDOWN) return;
      lastSectionUpdate.current = t;
      setCurrentSection(sectionNamesRef.current[index] || "hero");
    },
    [setCurrentSection]
  );

  useEffect(() => {
    if (!mounted || !containerRef.current || panelsRef.current.length === 0) return;

    isActiveRef.current = true;

    // Simplified touch handling for better performance
    const handleTouchMove = (e) => {
      if (currentIndexRef.current === 0 && e.touches[0].clientY > 50) {
        e.preventDefault();
      }
    };

    // Add event listeners to container only
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    // Immediate initialization for faster loading
    const initTimeout = setTimeout(() => {
      // Position panels with optimized settings
      panelsRef.current.forEach((panel, i) => {
        if (panel) {
          gsap.set(panel, {
            yPercent: i === 0 ? 0 : 100,
            zIndex: 10 + i,
            force3D: true, // Force GPU acceleration
          });
        }
      });

      updateNavbarSection(0);

      // Create observer with optimized settings
      if (observerRef.current) {
        observerRef.current.kill();
      }

      observerRef.current = Observer.create({
        target: window,
        type: "wheel,touch",
        preventDefault: true,
        wheelSpeed: -1,
        tolerance: 15, // Increased tolerance for better mobile performance
        allowClicks: true,
        lockAxis: true,
        ignoreInertia: true,
        dragMinimum: 20, // Increased minimum drag for better mobile UX
        onUp: () => {
          if (
            (tween.current && tween.current.isActive()) ||
            currentIndexRef.current >= panelsRef.current.length - 1 ||
            now() - lastScrollTime.current < SCROLL_COOLDOWN
          ) {
            return;
          }

          const next = panelsRef.current[currentIndexRef.current + 1];
          if (next) {
            currentIndexRef.current++;
            tween.current = gsap.to(next, {
              yPercent: 0,
              duration: 0.5, // Faster animation
              ease: "power2.out", // Simpler easing for better performance
              force3D: true,
              onComplete: () => {
                if (isActiveRef.current) {
                  setActiveIndex(currentIndexRef.current);
                }
              },
            });
            updateNavbarSection(currentIndexRef.current);
            lastScrollTime.current = now();
          }
        },
        onDown: () => {
          if (
            (tween.current && tween.current.isActive()) ||
            currentIndexRef.current <= 0 ||
            now() - lastScrollTime.current < SCROLL_COOLDOWN
          ) {
            return;
          }

          const current = panelsRef.current[currentIndexRef.current];
          if (current) {
            currentIndexRef.current--;
            tween.current = gsap.to(current, {
              yPercent: 100,
              duration: 0.5, // Faster animation
              ease: "power2.out", // Simpler easing for better performance
              force3D: true,
              onComplete: () => {
                if (isActiveRef.current) {
                  setActiveIndex(currentIndexRef.current);
                }
              },
            });
            updateNavbarSection(currentIndexRef.current);
            lastScrollTime.current = now();
          }
        },
      });
    }, 50); // Reduced timeout for faster initialization

    return () => {
      isActiveRef.current = false;
      clearTimeout(initTimeout);
      
      if (observerRef.current) {
        observerRef.current.kill();
        observerRef.current = null;
      }
      
      if (tween.current) {
        tween.current.kill();
        tween.current = null;
      }
      
      // Remove event listeners
      if (container) {
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [mounted, updateNavbarSection]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
        <div 
          className="w-full animate-pulse bg-neutral-900/50" 
          style={{
            marginTop: "5rem",
            height: "calc(100vh - 5rem)"
          }}
        />
      </div>
    );
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
      }}
    >
      {kids.map((Child, i) => {
        const shouldMount = Math.abs(i - activeIndex) <= mountRadius || i === 0;
        const isNearActive = Math.abs(i - activeIndex) <= 1;

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
              willChange: isNearActive ? "transform" : "auto",
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