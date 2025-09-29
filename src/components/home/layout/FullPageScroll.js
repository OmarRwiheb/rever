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

  const SCROLL_COOLDOWN = 1100;
  const DURATION = 0.4; // Faster = better on iOS

  const { setCurrentSection } = useNavbar?.() || { setCurrentSection: () => {} };
  
  const kids = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);
  const setPanelRef = useCallback((el, i) => { 
    if (el) panelsRef.current[i] = el; 
  }, []);

  // Detect Safari and iOS version
  useEffect(() => {
    isSafari.current = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    const isIOS26 = /OS 26_/i.test(navigator.userAgent);
    if (isIOS26 && containerRef.current) {
      containerRef.current.style.webkitPerspective = "1000px";
      containerRef.current.style.perspective = "1000px";
    }
  }, []);

  // Aggressive GSAP optimization
  useEffect(() => {
    gsap.config({
      force3D: "auto",
      nullTargetWarn: false,
      autoSleep: 60,
    });
    gsap.ticker.lagSmoothing(0);
    
    if (isSafari.current) {
      gsap.ticker.fps(60);
    }
  }, []);

  // Dynamic will-change management - CRITICAL for performance
  const setWillChange = useCallback((panel, enable) => {
    if (!panel) return;
    panel.style.willChange = enable ? "transform" : "auto";
  }, []);

  useEffect(() => {
    if (!containerRef.current || kids.length === 0) return;

    ctxRef.current = gsap.context(() => {
      // Initial setup - NO will-change yet
      panelsRef.current.forEach((panel, i) => {
        const initialY = i === 0 ? 0 : window.innerHeight;
        gsap.set(panel, { 
          y: initialY,
          zIndex: 10 + i,
          visibility: i === 0 ? "visible" : "hidden",
        });
        
        // Only set will-change on adjacent panels
        if (i <= 1) {
          setWillChange(panel, true);
        }
        
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

        // Enable will-change ONLY on animating panels
        setWillChange(currentPanel, true);
        setWillChange(nextPanel, true);

        gsap.set(nextPanel, { visibility: "visible" });

        if (dir > 0) {
          const startY = window.innerHeight;
          gsap.set(nextPanel, { y: startY });
          
          tweenRef.current = gsap.to(nextPanel, {
            y: 0,
            duration: DURATION,
            ease: isSafari.current ? "power2.out" : "expo.out",
            force3D: true,
            onUpdate: isSafari.current ? function() {
              if (this.progress() % 0.1 < 0.02) {
                void nextPanel.offsetHeight;
              }
            } : undefined,
            onComplete: () => {
              gsap.set(currentPanel, { visibility: "hidden", y: window.innerHeight });
              
              // REMOVE will-change after animation
              setWillChange(currentPanel, false);
              setWillChange(nextPanel, false);
              
              // Add will-change to NEW adjacent panels
              const prevPanel = panelsRef.current[nextIndex - 1];
              const nextNextPanel = panelsRef.current[nextIndex + 1];
              if (prevPanel) setWillChange(prevPanel, true);
              if (nextNextPanel) setWillChange(nextNextPanel, true);
              
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
        } else {
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
              
              setWillChange(currentPanel, false);
              setWillChange(nextPanel, false);
              
              const prevPanel = panelsRef.current[nextIndex - 1];
              const nextNextPanel = panelsRef.current[nextIndex + 1];
              if (prevPanel) setWillChange(prevPanel, true);
              if (nextNextPanel) setWillChange(nextNextPanel, true);
              
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
              video.currentTime = 0;
              const playPromise = video.play();
              if (playPromise?.catch) {
                playPromise.catch(() => {
                  setTimeout(() => video.play().catch(() => {}), 100);
                });
              }
            } else {
              video.pause();
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
  }, [kids.length, sectionNames, setCurrentSection, setPanelRef, setWillChange]);

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
        WebkitOverflowScrolling: "touch",
        // Container does NOT need will-change
        contain: "strict",
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
              // will-change managed dynamically in JS
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
          -webkit-user-select: none;
          user-select: none;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}