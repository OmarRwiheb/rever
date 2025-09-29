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
  const ctxRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const rafRef = useRef(null);
  const isSafari = useRef(false);

  const SCROLL_COOLDOWN = 1100; // Extra buffer for Safari
  const DURATION = 0.45;

  const { setCurrentSection } = useNavbar?.() || { setCurrentSection: () => {} };
  
  const kids = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);
  const setPanelRef = useCallback((el, i) => { 
    if (el) panelsRef.current[i] = el; 
  }, []);

  // Detect Safari
  useEffect(() => {
    isSafari.current = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  // Safari-optimized GSAP config
  useEffect(() => {
    gsap.config({
      force3D: "auto", // Let GSAP decide for Safari
      nullTargetWarn: false,
      autoSleep: 60,
    });
    
    // Safari needs lag smoothing disabled
    gsap.ticker.lagSmoothing(0);
    
    // Force initial render in Safari
    if (isSafari.current) {
      gsap.ticker.fps(60);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || kids.length === 0) return;

    ctxRef.current = gsap.context(() => {
      // Safari needs explicit z-index and positioning
      panelsRef.current.forEach((panel, i) => {
        const initialY = i === 0 ? 0 : window.innerHeight;
        gsap.set(panel, { 
          y: initialY,
          zIndex: 10 + i,
          visibility: i === 0 ? "visible" : "hidden",
        });
        
        // Safari: Force repaint after set
        if (isSafari.current) {
          void panel.offsetHeight;
        }
      });

      setCurrentSection(sectionNames[0] || "hero");

      const goTo = (nextIndex) => {
        if (!panelsRef.current[nextIndex] || isAnimatingRef.current) return;
        
        const dir = nextIndex > idxRef.current ? 1 : -1;
        const currentPanel = panelsRef.current[idxRef.current];
        const nextPanel = panelsRef.current[nextIndex];

        isAnimatingRef.current = true;

        // Kill existing tweens
        if (tweenRef.current?.kill) {
          tweenRef.current.kill();
        }
        gsap.killTweensOf([currentPanel, nextPanel]);

        // Show next panel before animating (Safari fix)
        gsap.set(nextPanel, { visibility: "visible" });

        if (dir > 0) {
          // Scrolling down
          const startY = window.innerHeight;
          gsap.set(nextPanel, { y: startY });
          
          tweenRef.current = gsap.to(nextPanel, {
            y: 0,
            duration: DURATION,
            ease: isSafari.current ? "power2.out" : "expo.out",
            force3D: true,
            onUpdate: isSafari.current ? function() {
              // Safari: Force repaint during animation
              if (this.progress() % 0.1 < 0.02) {
                void nextPanel.offsetHeight;
              }
            } : undefined,
            onComplete: () => {
              gsap.set(currentPanel, { visibility: "hidden", y: window.innerHeight });
              isAnimatingRef.current = false;
              idxRef.current = nextIndex;
              setActiveIndex(nextIndex);
              setCurrentSection(sectionNames[nextIndex] || "hero");
              manageVideos(nextIndex);
              
              // Safari: Force final repaint
              if (isSafari.current) {
                void nextPanel.offsetHeight;
                void currentPanel.offsetHeight;
              }
            },
          });
        } else {
          // Scrolling up
          tweenRef.current = gsap.to(currentPanel, {
            y: window.innerHeight,
            duration: DURATION,
            ease: isSafari.current ? "power2.out" : "expo.out",
            force3D: true,
            onUpdate: isSafari.current ? function() {
              if (this.progress() % 0.1 < 0.02) {
                void currentPanel.offsetHeight;
              }
            } : undefined,
            onComplete: () => {
              gsap.set(currentPanel, { visibility: "hidden" });
              isAnimatingRef.current = false;
              idxRef.current = nextIndex;
              setActiveIndex(nextIndex);
              setCurrentSection(sectionNames[nextIndex] || "hero");
              manageVideos(nextIndex);
              
              if (isSafari.current) {
                void nextPanel.offsetHeight;
                void currentPanel.offsetHeight;
              }
            },
          });
        }
      };

      const manageVideos = (activeIdx) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          panelsRef.current.forEach((p, i) => {
            const video = p?.querySelector?.("video");
            if (!video) return;
            
            if (i === activeIdx) {
              // Safari needs this sequence
              video.currentTime = 0;
              const playPromise = video.play();
              if (playPromise?.catch) {
                playPromise.catch(() => {
                  // Retry once for Safari
                  setTimeout(() => video.play().catch(() => {}), 100);
                });
              }
            } else {
              video.pause();
              // Safari: ensure video is actually paused
              if (isSafari.current) {
                video.currentTime = 0;
              }
            }
          });
        });
      };

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const obs = Observer.create({
        target: window,
        type: isMobile ? "touch" : "wheel,touch",
        tolerance: isMobile ? 35 : 20,
        wheelSpeed: -1,
        preventDefault: true,
        dragMinimum: 25,
        // Safari specific: ignore if animation running
        ignore: () => isAnimatingRef.current,
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
      
      // Initial video with delay for Safari
      if (isSafari.current) {
        setTimeout(() => manageVideos(0), 100);
      } else {
        manageVideos(0);
      }
    }, containerRef);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tweenRef.current?.kill) tweenRef.current.kill();
      if (ctxRef.current?._obs?.kill) ctxRef.current._obs.kill();
      ctxRef.current?.revert();
      isAnimatingRef.current = false;
    };
  }, [kids.length, sectionNames, setCurrentSection, setPanelRef]);

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
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: "none",
        // Safari: prevent rubber banding
        WebkitOverflowScrolling: "touch",
      }}
    >
      {kids.map((Child, i) => {
        const shouldMount = Math.abs(i - activeIndex) <= mountRadius;
        
        return (
          <div
            key={i}
            ref={(el) => setPanelRef(el, i)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 10 + i,
              pointerEvents: i === activeIndex ? "auto" : "none",
              // Safari: explicit transform for GPU
              WebkitTransform: "translate3d(0,0,0)",
              transform: "translate3d(0,0,0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
          >
            {shouldMount && (
              <div style={{ 
                width: "100%", 
                height: "100%", 
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{ 
                  paddingTop: "5rem",
                  width: "100%", 
                  height: "100%",
                }}>
                  {Child}
                </div>
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
          -webkit-transform: translate3d(0,0,0);
          transform: translate3d(0,0,0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        
        video {
          /* Safari video optimization */
          -webkit-user-select: none;
          user-select: none;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}