import type { RefObject } from "react";

export type Memory = {
  id: number;
  src: string;
  alt: string;
  caption: string;
  x: number;
  y: number;
  tilt: number;
};

export type CurveMemoriesGalleryProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  memories?: readonly Memory[];
  onReady: () => void;
  onUnavailable: () => void;
};

// Positions retain the approved eight-image composition and are available to
// both the DOM fallback and the motion-owned curve gallery.
export const MEMORIES = [
  {
    id: 1,
    src: "/landing-pages/memories/photos/memory-01.webp",
    alt: "Blue Genesis event-photo placeholder labelled Photo 01",
    caption: "Memory 01",
    x: 22,
    y: 19,
    tilt: -9,
  },
  {
    id: 2,
    src: "/landing-pages/memories/photos/memory-02.webp",
    alt: "Purple Genesis event-photo placeholder labelled Photo 02",
    caption: "Memory 02",
    x: 71,
    y: 24,
    tilt: 7,
  },
  {
    id: 3,
    src: "/landing-pages/memories/photos/memory-03.webp",
    alt: "Orange Genesis event-photo placeholder labelled Photo 03",
    caption: "Memory 03",
    x: 44,
    y: 50,
    tilt: -6,
  },
  {
    id: 4,
    src: "/landing-pages/memories/photos/memory-04.webp",
    alt: "Teal Genesis event-photo placeholder labelled Photo 04",
    caption: "Memory 04",
    x: 82,
    y: 72,
    tilt: 10,
  },
  {
    id: 5,
    src: "/landing-pages/memories/photos/memory-05.webp",
    alt: "Violet Genesis event-photo placeholder labelled Photo 05",
    caption: "Memory 05",
    x: 20,
    y: 77,
    tilt: -12,
  },
  {
    id: 6,
    src: "/landing-pages/memories/photos/memory-06.webp",
    alt: "Bronze Genesis event-photo placeholder labelled Photo 06",
    caption: "Memory 06",
    x: 52,
    y: 14,
    tilt: 6,
  },
  {
    id: 7,
    src: "/landing-pages/memories/photos/memory-07.webp",
    alt: "Green Genesis event-photo placeholder labelled Photo 07",
    caption: "Memory 07",
    x: 15,
    y: 49,
    tilt: 8,
  },
  {
    id: 8,
    src: "/landing-pages/memories/photos/memory-08.webp",
    alt: "Rose Genesis event-photo placeholder labelled Photo 08",
    caption: "Memory 08",
    x: 60,
    y: 87,
    tilt: -5,
  },
] as const satisfies readonly Memory[];
