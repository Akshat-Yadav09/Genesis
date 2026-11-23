"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import "./loading-screen.css";

interface LoadingScreenProps {
  onComplete?: () => void;
  minDisplayTimeMs?: number;
}

export default function LoadingScreen({
  onComplete,
  minDisplayTimeMs = 1800,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const hasTriggeredExit = useRef(false);

  const finishLoading = useCallback(() => {
    if (hasTriggeredExit.current) return;
    hasTriggeredExit.current = true;
    setProgress(100);

    // Short pause at 100% for gold coin pulse feedback, then trigger smooth transition
    setTimeout(() => {
      setIsExiting(true);
      // Wait for exit transition duration (700ms) before unmounting completely
      setTimeout(() => {
        setIsDone(true);
        onComplete?.();
      }, 700);
    }, 250);
  }, [onComplete]);

  // Smooth simulated progress animation
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      finishLoading();
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / minDisplayTimeMs);

      // Easing curve: swift start, brief asset preparation pause around 75%, quick sprint to 100%
      let currentProgress = 1;
      if (t < 0.4) {
        // 1 to 45% in first 40% time
        currentProgress = 1 + (t / 0.4) * 44;
      } else if (t < 0.75) {
        // 45% to 75% at steady pace
        const localT = (t - 0.4) / 0.35;
        currentProgress = 45 + localT * 30;
      } else {
        // 75% to 100% finish
        const localT = (t - 0.75) / 0.25;
        const easeOut = 1 - Math.pow(1 - localT, 2);
        currentProgress = 75 + easeOut * 25;
      }

      setProgress(Math.max(1, Math.min(100, Math.round(currentProgress))));

      if (t < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        finishLoading();
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    // Keyboard shortcut to skip (Escape)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        finishLoading();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [minDisplayTimeMs, finishLoading]);

  // Don't render once unmounted
  if (isDone) return null;

  // Dynamic status text: Loading Genesis 6...
  const statusText =
    progress >= 100 ? "WELCOME TO GENESIS 6!" : "LOADING GENESIS 6...";

  return (
    <div
      role="dialog"
      aria-label="Loading Genesis 6"
      aria-modal="true"
      onClick={finishLoading}
      className={`fixed inset-0 z-[99999] bg-[#030015] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? "opacity-0 scale-[1.04] filter blur-[2px] pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* ── 1. Full-Screen Background Splash Artwork ── */}
      <div className="absolute inset-0 w-full h-full -z-20 overflow-hidden pointer-events-none">
        <Image
          src="/landing-pages/home/loading/brawl-stars-splash.webp"
          alt="Brawl Stars Loading Artwork"
          fill
          priority
          quality={95}
          className="object-cover object-center w-full h-full scale-[1.02]"
        />
      </div>

      {/* ── 2. Subtle Dark Gradient Overlay for Readability ── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(3, 0, 21, 0.45) 0%, rgba(3, 0, 21, 0.7) 60%, rgba(3, 0, 21, 0.92) 100%), linear-gradient(to bottom, rgba(3, 0, 21, 0.75) 0%, rgba(3, 0, 21, 0.25) 35%, rgba(3, 0, 21, 0.35) 65%, rgba(3, 0, 21, 0.88) 100%)",
        }}
      />

      {/* ── 3. Center: Single Brawl Stars Gold Coin + Percentage + Loading Genesis 6 ── */}
      <div className="relative flex flex-col items-center justify-center gap-3.5 z-10">
        {/* Brawl Stars Skull Star Coin Wrapper */}
        <div
          className={`relative w-28 h-32 sm:w-36 sm:h-40 transition-transform duration-300 ${
            progress >= 100 ? "brawl-coin-pulse" : ""
          }`}
          style={{
            filter:
              progress >= 100
                ? "drop-shadow(0 0 35px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 60px rgba(250, 204, 21, 0.6))"
                : "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.75))",
          }}
        >
          {/* Base Unfilled Dark / Grey Skull Star Coin */}
          <Image
            src="/landing-pages/home/loading/brawl-star-coin-dark.webp"
            alt="Loading Brawl Star"
            fill
            sizes="(max-width: 768px) 112px, 144px"
            priority
            className="object-contain"
          />

          {/* Filled Gold Skull Star Coin Layer: Clips from bottom to top as progress increases */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-[clip-path] duration-75 ease-linear"
            style={{
              clipPath: `inset(${100 - progress}% 0 0 0)`,
            }}
          >
            <Image
              src="/landing-pages/home/loading/brawl-star-coin-clean.webp"
              alt="Brawl Star Coin"
              fill
              sizes="(max-width: 768px) 112px, 144px"
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Bold White Percentage Counter (1 to 100) */}
        <div className="font-lilita text-3xl sm:text-4xl font-bold text-white tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] flex items-center justify-center">
          <span>{progress}</span>
          <span className="text-amber-400 text-xl sm:text-2xl ml-1">%</span>
        </div>

        {/* Status Line: Loading Genesis 6... / Welcome to Genesis 6! */}
        <div className="font-lilita uppercase tracking-wider text-amber-300 text-sm sm:text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex items-center gap-2 mt-0.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{statusText}</span>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
      </div>

      {/* ── 4. Bottom Skip Prompt ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="font-sans text-[11px] sm:text-xs text-neutral-400/75 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          Tap anywhere or press ESC to skip
        </span>
      </div>
    </div>
  );
}
