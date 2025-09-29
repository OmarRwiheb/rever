"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavbar } from "@/components/Navbar";

export default function CSSScrollSnap({
  children,
  mountRadius = 1,
  sectionNames = ["hero", "women", "men", "second-video", "footer"],
}) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const observerRef = useRef(null);
  const sectionRefs = useRef([]);

  const { setCurrentSection } = useNavbar?.() || { setCurrentSection: () => {} };
  
  const kids = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);

  // Fix 100vh issue on iOS
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Intersection Observer to track which section is active
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = sectionRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
              setCurrentSection(sectionNames[index] || "hero");
              
              // Manage videos with iOS autoplay optimization
              sectionRefs.current.forEach((section, i) => {
                const video = section?.querySelector?.("video");
                if (!video) return;
                
                if (i === index) {
                  video.currentTime = 0;
                  const playPromise = video.play();
                  
                  if (playPromise !== undefined) {
                    playPromise.catch(() => {
                      // iOS blocks autoplay without user interaction
                      // Try with muted video (muted videos can autoplay on iOS)
                      video.muted = true;
                      video.play().catch(() => {
                        // Still failed, video will need user interaction
                      });
                    });
                  }
                } else {
                  video.pause();
                }
              });
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.5,
      }
    );

    // Observe all sections
    sectionRefs.current.forEach((section) => {
      if (section) observerRef.current.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [kids.length, sectionNames, setCurrentSection]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100dvh", // Dynamic viewport height (modern browsers)
        height: "var(--vh, 100vh)", // Fallback for older browsers
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        
        // iOS optimizations
        WebkitOverflowScrolling: "touch",
        transform: "translateZ(0)", // Force hardware acceleration
        willChange: "scroll-position",
        backfaceVisibility: "hidden",
        
        // Hide scrollbar
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {kids.map((Child, i) => {
        const shouldMount = Math.abs(i - activeIndex) <= mountRadius;
        
        return (
          <section
            key={i}
            ref={(el) => {
              if (el) sectionRefs.current[i] = el;
            }}
            style={{
              height: "100dvh", // Dynamic viewport height
              height: "var(--vh, 100vh)", // Fallback
              scrollSnapAlign: "start",
              position: "relative",
              width: "100%",
            }}
          >
            {shouldMount && (
              <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                <div 
                  className="w-full h-full"
                  style={{
                    paddingTop: "max(5rem, env(safe-area-inset-top))",
                    paddingBottom: "env(safe-area-inset-bottom)",
                    paddingLeft: "env(safe-area-inset-left)",
                    paddingRight: "env(safe-area-inset-right)",
                  }}
                >
                  {Child}
                </div>
              </div>
            )}
          </section>
        );
      })}

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}