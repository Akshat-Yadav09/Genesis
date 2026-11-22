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
    src: "/memories/photos/photo-01.webp",
    alt: "Genesis event ceremony and stage presentation",
    caption: "Opening Ceremony",
    x: 22,
    y: 19,
    tilt: -9,
  },
  {
    id: 2,
    src: "/memories/photos/photo-02.webp",
    alt: "Participants gathered at Genesis esports arena",
    caption: "Main Arena",
    x: 71,
    y: 24,
    tilt: 7,
  },
  {
    id: 3,
    src: "/memories/photos/photo-03.webp",
    alt: "Genesis gaming tournament match in progress",
    caption: "Tournament Stage",
    x: 44,
    y: 50,
    tilt: -6,
  },
  {
    id: 4,
    src: "/memories/photos/photo-04.webp",
    alt: "Attendees cheering and enjoying the competition",
    caption: "The Audience",
    x: 82,
    y: 72,
    tilt: 10,
  },
  {
    id: 5,
    src: "/memories/photos/photo-05.webp",
    alt: "Genesis teams collaborating and competing",
    caption: "Team Spirit",
    x: 20,
    y: 77,
    tilt: -12,
  },
  {
    id: 6,
    src: "/memories/photos/photo-06.webp",
    alt: "Event organizers and production team behind the scenes",
    caption: "Production Crew",
    x: 52,
    y: 14,
    tilt: 6,
  },
  {
    id: 7,
    src: "/memories/photos/photo-07.webp",
    alt: "Finalists competing on the main stage",
    caption: "Final Showdown",
    x: 15,
    y: 49,
    tilt: 8,
  },
  {
    id: 8,
    src: "/memories/photos/photo-08.webp",
    alt: "Celebration and award ceremony moments",
    caption: "Award Ceremony",
    x: 60,
    y: 87,
    tilt: -5,
  },
] as const satisfies readonly Memory[];
