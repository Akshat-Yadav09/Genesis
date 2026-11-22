import type { CSSProperties } from "react";
import styles from "./CloudDivider.module.css";

type CloudLayerName = "background" | "middle" | "foreground" | "foregroundAccent";

export type CloudDividerProps = {
  /** Per-layer cloud fill colors. Omitted layers retain the default palette. */
  colors?: Partial<Record<CloudLayerName, string>>;
  /** CSS length for the divider SVG height. Omit it to use the responsive default. */
  height?: string;
  /** Opacity multiplier from 0 to 1 for the full cloud scene. */
  opacity?: number;
  /** Whether the divider is anchored to the "top" or "bottom" of its parent container. Defaults to "top". */
  position?: "top" | "bottom";
  /** Whether to flip the clouds vertically. */
  flipY?: boolean;
  /**
   * Alignment mode for the SVG:
   * - "seam" (default): bridges across the section boundary (bottom: -20px on top anchor)
   * - "inset": anchors the clouds to the top edge (top: 0 or shiftY)
   */
  align?: "seam" | "inset";
  /** Optional vertical shift or offset (e.g. "clamp(-30px, -4.5vw, -60px)"). */
  shiftY?: string;
  /** Optional extra class name for the root wrapper. */
  className?: string;
  /** Optional style overrides on the root wrapper. */
  style?: CSSProperties;
  /** Optional style overrides directly on the SVG element. */
  svgStyle?: CSSProperties;
};

const layerShapes: Record<CloudLayerName, string> = {
  background:
    "M0 280V125C48 87 101 87 144 113C169 42 263 20 322 69C368 19 474 25 516 88C554 54 620 57 663 90C690 32 792 19 848 68C906 26 980 58 1000 101V280Z",
  middle:
    "M0 280V155C59 112 117 121 154 149C192 91 262 83 309 121C365 141 409 90 474 96C526 98 552 128 565 149C613 111 686 117 726 154C765 83 863 81 909 132C942 112 974 114 1000 130V280Z",
  foreground:
    "M0 280V174C40 146 86 153 115 181C148 139 222 143 255 175C290 132 372 130 412 173C462 145 526 154 556 192C590 151 648 142 686 166C736 121 816 139 842 183C888 154 954 152 1000 180V280Z",
  foregroundAccent:
    "M0 280V226C62 199 112 202 154 229C193 199 246 201 279 220C323 181 388 185 421 219C477 197 540 210 577 238C620 210 660 205 694 221C734 181 803 184 841 218C888 194 947 198 1000 221V280Z",
};

const DEFAULT_COLORS: Record<CloudLayerName, string> = {
  background: "#0b4f99",
  middle: "#1679cf",
  foreground: "#70c5ff",
  foregroundAccent: "#e1f6ff",
};

/**
 * Safe, decorative animated cloud divider.
 * Critical inline positioning, bounding, and explicit fills prevent layout shifts
 * and solid black block artifacts even when external stylesheets fail to load.
 */
export default function CloudDivider({
  colors = {},
  height,
  opacity = 1,
  position = "top",
  flipY = false,
  align = "seam",
  shiftY,
  className = "",
  style = {},
  svgStyle: customSvgStyle = {},
}: CloudDividerProps) {
  const bgFill = colors.background ?? DEFAULT_COLORS.background;
  const midFill = colors.middle ?? DEFAULT_COLORS.middle;
  const foreFill = colors.foreground ?? DEFAULT_COLORS.foreground;
  const accentFill = colors.foregroundAccent ?? DEFAULT_COLORS.foregroundAccent;

  const rootClasses = [
    styles?.root,
    "root",
    "genesis-cloud-divider",
    position === "bottom" ? "genesis-cloud-divider--bottom" : "genesis-cloud-divider--top",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const svgClasses = [
    styles?.svg,
    "svg",
    "genesis-cloud-divider__svg",
  ]
    .filter(Boolean)
    .join(" ");

  const rootStyle: CSSProperties = {
    position: "absolute",
    ...(position === "bottom" ? { bottom: 0 } : { top: 0 }),
    left: 0,
    right: 0,
    width: "100%",
    height: 0,
    overflow: "visible",
    pointerEvents: "none",
    zIndex: 1,
    opacity,
    ...style,
  };

  const defaultTop = align === "inset" ? (shiftY || 0) : undefined;
  const defaultBottom =
    position === "bottom"
      ? align === "seam"
        ? "-15px"
        : 0
      : align === "seam"
      ? "-20px"
      : undefined;

  const svgStyle: CSSProperties = {
    position: "absolute",
    ...(position === "bottom"
      ? { bottom: defaultBottom }
      : align === "inset"
      ? { top: defaultTop }
      : { bottom: defaultBottom }),
    left: "-12%",
    width: "124%",
    height: height || "clamp(64px, 8.5vw, 110px)",
    pointerEvents: "none",
    display: "block",
    overflow: "visible",
    ...(flipY ? { transform: "scaleY(-1)" } : {}),
    ...customSvgStyle,
  };

  return (
    <div aria-hidden="true" className={rootClasses} style={rootStyle}>
      <svg
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1000 280"
        className={svgClasses}
        style={svgStyle}
      >
        <g
          className={`${styles?.layer || ""} ${styles?.background || ""} layer background genesis-cloud-layer genesis-cloud-layer--bg`.trim()}
        >
          <path d={layerShapes.background} fill={bgFill} />
        </g>
        <g
          className={`${styles?.layer || ""} ${styles?.middle || ""} layer middle genesis-cloud-layer genesis-cloud-layer--mid`.trim()}
        >
          <path d={layerShapes.middle} fill={midFill} />
        </g>
        <g
          className={`${styles?.layer || ""} ${styles?.foreground || ""} layer foreground genesis-cloud-layer genesis-cloud-layer--fore`.trim()}
        >
          <path d={layerShapes.foreground} fill={foreFill} />
        </g>
        <g
          className={`${styles?.layer || ""} ${styles?.foregroundAccent || ""} layer foregroundAccent genesis-cloud-layer genesis-cloud-layer--accent`.trim()}
        >
          <path d={layerShapes.foregroundAccent} fill={accentFill} />
        </g>
      </svg>
    </div>
  );
}
