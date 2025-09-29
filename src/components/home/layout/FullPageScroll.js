"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavbar } from "@/components/Navbar";

export default function VanillaFullPageScroll({
  children,
  mountRadius = 1,
  sectionNames = ["hero", "women", "men", "second-video", "footer"],
}) {
  const containerRef = useRef(null);
  const panelsRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const lastScrollRef = useRef(0);
  const touchStartRef = useRef(0);

  const SCROLL_COOLDOWN = 1100;
  const ANIMATION_DURATION = 400;

  const { setCurrentSection } = useNavbar?.() || { setCurrentSection: () => {} };
  
  const kids = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);

  const animateToSection = useCallback((nextIndex) => {
    if (
      isAnimatingRef.current ||
      nextIndex < 0 ||
      nextIndex >= panelsRef.current.length
    ) {
      return;
    }

    isAnimatingRef.current = true;
    const currentPanel = panelsRef.current[activeIndex];
    const nextPanel = panelsRef.current[nextIndex];

    if (!currentPanel || !nextPanel) return;

    const direction = nextIndex > activeIndex ? 1 : -1;

    // Show next panel
    nextPanel.style.visibility = "visible";
    nextPanel.style.transform = `translateY(${direction * 100}%)`;

    // Force reflow
    void nextPanel.offsetHeight;

    // Start animation
    if (direction > 0) {
      // Scrolling down: move next panel up
      nextPanel.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      nextPanel.style.transform = "translateY(0)";
    } else {
      // Scrolling up: move current panel down
      currentPanel.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      currentPanel.style.transform = "translateY(100%)";
    }

    setTimeout(() => {
      // Hide old panel
      currentPanel.style.visibility = "hidden";
      currentPanel.style.transition = "none";
      currentPanel.style.transform = `translateY(${direction > 0 ? "-100%" : "100%"})`;

      // Reset next panel transition
      nextPanel.style.transition = "none";

      isAnimatingRef.current = false;
      setActiveIndex(nextIndex);
      setCurrentSection(sectionNames[nextIndex] || "hero");

      // Manage videos
      panelsRef.current.forEach((panel, i) => {
        const video = panel?.querySelector?.("video");
        if (!video) return;

        if (i === nextIndex) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, ANIMATION_DURATION);
  }, [activeIndex, sectionNames, setCurrentSection]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastScrollRef.current < SCROLL_COOLDOWN) return;

    const delta = e.deltaY;
    if (Math.abs(delta) < 10) return; // Ignore tiny scrolls

    lastScrollRef.current = now;

    if (delta > 0) {
      // Scroll down
      animateToSection(activeIndex + 1);
    } else {
      // Scroll up
      animateToSection(activeIndex - 1);
    }
  }, [activeIndex, animateToSection]);

  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const now = Date.now();
    if (now - lastScrollRef.current < SCROLL_COOLDOWN) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) < 50) return; // Ignore small swipes

    lastScrollRef.current = now;

    if (diff > 0) {
      // Swipe up = scroll down
      animateToSection(activeIndex + 1);
    } else {
      // Swipe down = scroll up
      animateToSection(activeIndex - 1);
    }
  }, [activeIndex, animateToSection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial setup
    panelsRef.current.forEach((panel, i) => {
      if (!panel) return;
      panel.style.visibility = i === 0 ? "visible" : "hidden";
      panel.style.transform = i === 0 ? "translateY(0)" : "translateY(100%)";
    });

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
        touchAction: "none",
      }}
    >
      {kids.map((Child, i) => {
        const shouldMount = Math.abs(i - activeIndex) <= mountRadius;

        return (
          <div
            key={i}
            ref={(el) => {
              if (el) panelsRef.current[i] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 10 + i,
              willChange: Math.abs(i - activeIndex) <= 1 ? "transform" : "auto",
              pointerEvents: i === activeIndex ? "auto" : "none",
            }}
          >
            {shouldMount && (
              <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                <div className="pt-20 w-full h-full">{Child}</div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        video, img, picture {
          max-width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </div>
  );
}