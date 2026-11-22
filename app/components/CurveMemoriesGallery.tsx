"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import type { CurveMemoriesGalleryProps } from "./memoriesData";

interface MemoriesGalleryDebug {
  getMaxPlaneScale: () => number;
  getPlanesInFocusCount: () => number;
  getCamT: () => number;
  getTargetT: () => number;
  getIsActive: () => boolean;
  getIsIntersecting: () => boolean;
}

declare global {
  interface Window {
    __memoriesGallery?: MemoriesGalleryDebug;
  }
}

const SCALE = 16;
const TOTAL = 500;
const CAM_Z = 10;
const FOCUS_DIST = 5.5;
const MAX_SCALE = 14;
const Z_GATE = 11;

const LATERAL_OFFSET_RANGE: [number, number] = [-1, 1];
const DEPTH_OFFSET_RANGE: [number, number] = [-0.75, 0.75];
const SIZE_RANGE: [number, number] = [0.18, 0.4];

const AUTO_SCROLL_DURATION = 10;
const AUTO_T_PER_SEC = 1 / AUTO_SCROLL_DURATION;

const PATH_FILES = [
  "/landing-pages/memories/curve-gallery/paths/path1.json",
  "/landing-pages/memories/curve-gallery/paths/path2.json",
  "/landing-pages/memories/curve-gallery/paths/path3.json",
  "/landing-pages/memories/curve-gallery/paths/path4.json",
  "/landing-pages/memories/curve-gallery/paths/path5.json",
];

const TEXTURE_SOURCES = [
  "/memories/photos/photo-01.webp",
  "/memories/photos/photo-02.webp",
  "/memories/photos/photo-03.webp",
  "/memories/photos/photo-04.webp",
  "/memories/photos/photo-05.webp",
  "/memories/photos/photo-06.webp",
  "/memories/photos/photo-07.webp",
  "/memories/photos/photo-08.webp",
  "/memories/photos/photo-09.webp",
  "/memories/photos/photo-10.webp",
  "/memories/photos/photo-11.webp",
  "/memories/photos/photo-12.webp",
  "/memories/photos/photo-13.webp",
  "/memories/photos/photo-14.webp",
  "/memories/photos/photo-15.webp",
  "/memories/photos/photo-16.webp",
  "/memories/photos/photo-17.webp",
  "/memories/photos/photo-18.webp",
  "/memories/photos/photo-19.webp",
  "/memories/photos/photo-20.webp",
  "/memories/photos/photo-21.webp",
  "/memories/photos/photo-22.webp",
  "/memories/photos/photo-23.webp",
  "/memories/photos/photo-24.webp",
  "/memories/photos/photo-25.webp",
  "/memories/photos/photo-26.webp",
  "/memories/photos/photo-27.webp",
  "/memories/photos/photo-28.webp",
  "/memories/photos/photo-29.webp",
] as const;

const TEX_VARIANTS = TEXTURE_SOURCES.length; // 29

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function toScaledVector3([x, y, z]: [number, number, number], scale: number): THREE.Vector3 {
  return new THREE.Vector3(x * scale, y * scale, z * scale);
}

function buildCurve(raw: Array<[number, number, number]>): THREE.CatmullRomCurve3 {
  const points = raw.map((p) => toScaledVector3(p, SCALE));
  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5);
}

function getCurveFrame(
  curve: THREE.CatmullRomCurve3,
  t: number,
): { pos: THREE.Vector3; nx: number; ny: number } {
  const pos = curve.getPoint(t);
  const tangent = curve.getTangent(t);
  return { pos, nx: -tangent.y, ny: tangent.x };
}

function computeFocusScale(distance: number, maxDistance: number, maxScale: number): number {
  const f = 1 - distance / maxDistance;
  return 1 + f ** 3 * (maxScale - 1);
}

export default function CurveMemoriesGallery({
  scrollContainerRef,
  onReady,
  onUnavailable,
}: CurveMemoriesGalleryProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const scroller = scrollContainerRef.current;
    const section = host?.closest<HTMLElement>(".genesis-memories");
    const viewport = section?.querySelector<HTMLElement>(".memories-viewport");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!host || !scroller || !section || reducedMotion.matches) {
      onUnavailable();
      return;
    }

    let destroyed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let renderFrameId = 0;

    let planes: THREE.Mesh[] = [];
    let geometries: THREE.PlaneGeometry[] = [];
    let materials: THREE.MeshBasicMaterial[] = [];
    let uniqueTextures: THREE.Texture[] = [];
    let proxies: Array<{ value: number }> = [];

    const camPos = { x: 0, y: 0, z: 0 };
    const camProxy = { t: 0 };
    const setCamT = (val: number) => {
      gsap.to(camProxy, {
        t: val,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    let targetT = 0;
    let autoScroll = false;
    let currentPathIndex = 0;
    let curve: THREE.CatmullRomCurve3 | null = null;
    let focusTGate = 0;
    let lastTime = performance.now();

    // Finite sticky scroll range tracking
    let sectionTop = 0;
    let stickyRange = 1;
    let isInActiveRange = false;
    let currentScrollProgress = 0;
    let isIntersecting = false;

    const measureBounds = () => {
      if (!section || !scroller) return;
      sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = viewport?.offsetHeight || host.clientHeight || window.innerHeight;
      stickyRange = Math.max(1, sectionHeight - viewportHeight);
    };

    const computeProgress = (scrollTop: number) => {
      if (scrollTop <= sectionTop) return 0;
      if (scrollTop >= sectionTop + stickyRange) return 1;
      return (scrollTop - sectionTop) / stickyRange;
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) {
        cleanup();
        onUnavailable();
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      cleanup();
      onUnavailable();
    };

    let changePathListener: EventListener | null = null;
    let changeAutoListener: EventListener | null = null;
    let handleResizeListener: (() => void) | null = null;
    let handleScrollListener: (() => void) | null = null;
    let requestRender: (() => void) | null = null;

    const handleScroll = () => {
      if (destroyed || !scroller) return;
      const scrollTop = scroller.scrollTop;
      currentScrollProgress = computeProgress(scrollTop);
      isInActiveRange = scrollTop >= sectionTop && scrollTop <= sectionTop + stickyRange;

      if (!autoScroll) {
        targetT = currentScrollProgress;
        setCamT(targetT);
      }

      const sectionHeight = section.offsetHeight;
      const isNearSection =
        scrollTop + scroller.clientHeight >= sectionTop && scrollTop <= sectionTop + sectionHeight;
      if (isIntersecting || isNearSection) {
        requestRender?.();
      }
    };
    handleScrollListener = handleScroll;

    const cleanup = () => {
      if (destroyed) return;
      destroyed = true;

      if (renderFrameId) {
        window.cancelAnimationFrame(renderFrameId);
        renderFrameId = 0;
      }

      reducedMotion.removeEventListener("change", handleMotionPreference);
      if (changePathListener) {
        section.removeEventListener("genesis:memories-path", changePathListener);
      }
      if (changeAutoListener) {
        section.removeEventListener("genesis:memories-auto", changeAutoListener);
      }
      if (handleResizeListener) {
        window.removeEventListener("resize", handleResizeListener);
      }
      if (handleScrollListener && scroller) {
        scroller.removeEventListener("scroll", handleScrollListener);
      }
      requestRender = null;

      visibilityObserver?.disconnect();
      visibilityObserver = null;

      resizeObserver?.disconnect();
      resizeObserver = null;

      gsap.killTweensOf(camPos);
      gsap.killTweensOf(camProxy);
      planes.forEach((mesh) => gsap.killTweensOf(mesh.position));
      proxies.forEach((proxy) => gsap.killTweensOf(proxy));
      proxies = [];

      planes.forEach((mesh) => scene?.remove(mesh));
      planes = [];

      geometries.forEach((g) => g.dispose());
      geometries = [];

      materials.forEach((m) => m.dispose());
      materials = [];

      uniqueTextures.forEach((t) => t.dispose());
      uniqueTextures = [];

      if (renderer) {
        renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
        renderer.renderLists?.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
        renderer = null;
      }

      if (typeof window !== "undefined") {
        delete window.__memoriesGallery;
      }
      scene?.clear();
      scene = null;
      camera = null;
      curve = null;
    };

    const init = async () => {
      try {
        const allRaws = await Promise.all(
          PATH_FILES.map((url) =>
            fetch(url).then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
              return r.json() as Promise<Array<[number, number, number]>>;
            }),
          ),
        );

        if (destroyed) return;

        // Load unique textures
        const textureLoader = new THREE.TextureLoader();
        const uniqueSources = Array.from(new Set(TEXTURE_SOURCES));
        const texMap = new Map<string, THREE.Texture>();

        await Promise.all(
          uniqueSources.map(
            (src) =>
              new Promise<void>((resolve, reject) => {
                textureLoader.load(
                  src,
                  (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.minFilter = THREE.LinearMipmapLinearFilter;
                    tex.magFilter = THREE.LinearFilter;
                    texMap.set(src, tex);
                    resolve();
                  },
                  undefined,
                  reject,
                );
              }),
          ),
        );

        if (destroyed) {
          texMap.forEach((t) => t.dispose());
          return;
        }

        uniqueTextures = Array.from(texMap.values());
        const textures = TEXTURE_SOURCES.map((src) => texMap.get(src)!);

        materials = textures.map(
          (tex) =>
            new THREE.MeshBasicMaterial({
              map: tex,
              side: THREE.DoubleSide,
            }),
        );

        const width = host.clientWidth || window.innerWidth;
        const height = host.clientHeight || window.innerHeight;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.tabIndex = -1;
        renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
        host.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = null;
        scene.fog = new THREE.FogExp2("#0c0424", 0.012);

        camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);

        currentPathIndex = 0;
        curve = buildCurve(allRaws[0]);
        focusTGate = (FOCUS_DIST * 1.5) / curve.getLength();

        function attachScaleAnimators() {
          proxies.forEach((proxy) => gsap.killTweensOf(proxy));
          proxies = [];
          for (const mesh of planes) {
            const currentScale = mesh.scale.x || 1;
            const proxy = { value: currentScale };
            proxies.push(proxy);
            mesh.userData.setScale = gsap.quickTo(proxy, "value", {
              duration: 0.4,
              ease: "power3.out",
              onUpdate: () => mesh.scale.setScalar(proxy.value),
            });
          }
        }

        for (let i = 0; i < TOTAL; i++) {
          const t = i / TOTAL;
          const { pos, nx, ny } = getCurveFrame(curve, t);

          const lateralOffset = randomBetween(LATERAL_OFFSET_RANGE[0], LATERAL_OFFSET_RANGE[1]);
          const depthOffset = randomBetween(DEPTH_OFFSET_RANGE[0], DEPTH_OFFSET_RANGE[1]);
          const size = randomBetween(SIZE_RANGE[0], SIZE_RANGE[1]);

          const geom = new THREE.PlaneGeometry(size, size);
          geometries.push(geom);

          const mat = materials[Math.floor(Math.random() * TEX_VARIANTS)];
          const mesh = new THREE.Mesh(geom, mat);

          mesh.position.set(
            pos.x + nx * lateralOffset,
            pos.y + ny * lateralOffset,
            pos.z + depthOffset,
          );

          mesh.userData.t = t;
          mesh.userData.lateralOffset = lateralOffset;
          mesh.userData.depthOffset = depthOffset;

          planes.push(mesh);
          scene.add(mesh);
        }

        attachScaleAnimators();

        function redistributePlanes(newCurve: THREE.CatmullRomCurve3) {
          planes.forEach((mesh) => {
            const t = mesh.userData.t;
            const { pos, nx, ny } = getCurveFrame(newCurve, t);

            gsap.to(mesh.position, {
              x: pos.x + nx * mesh.userData.lateralOffset,
              y: pos.y + ny * mesh.userData.lateralOffset,
              z: pos.z + mesh.userData.depthOffset,
              duration: 1.4,
              ease: "power3.inOut",
            });
          });
        }



        const changePath = (event: Event) => {
          const customEvent = event as CustomEvent<{ index?: number }>;
          const idx = Number(customEvent.detail?.index);
          if (
            !Number.isInteger(idx) ||
            idx < 0 ||
            idx >= allRaws.length ||
            idx === currentPathIndex
          ) {
            return;
          }

          currentPathIndex = idx;
          const newCurve = buildCurve(allRaws[idx]);
          redistributePlanes(newCurve);
          curve = newCurve;

          focusTGate = (FOCUS_DIST * 1.5) / newCurve.getLength();

          const t = ((1 - camProxy.t) % 1 + 1) % 1;
          const target = newCurve.getPoint(t);

          gsap.killTweensOf(camPos);
          gsap.to(camPos, {
            x: target.x,
            y: target.y,
            z: target.z + CAM_Z,
            duration: 1.4,
            ease: "power3.inOut",
          });
        };
        changePathListener = changePath;

        const changeAutoMode = (event: Event) => {
          const customEvent = event as CustomEvent<{ enabled?: boolean }>;
          const nextAuto = Boolean(customEvent.detail?.enabled);
          if (autoScroll && !nextAuto) {
            // Switching from Auto back to Scroll mode:
            // Normalize camProxy.t modulo 1 without altering 3D position
            autoScroll = false;
            camProxy.t = ((camProxy.t % 1) + 1) % 1;
            // Ease along shortest angular route to currentScrollProgress to avoid camera jump
            let diff = currentScrollProgress - camProxy.t;
            if (diff > 0.5) diff -= 1;
            else if (diff < -0.5) diff += 1;
            targetT = camProxy.t + diff;
            setCamT?.(targetT);
          } else {
            autoScroll = nextAuto;
            if (autoScroll) {
              targetT = camProxy.t;
            }
          }
        };
        changeAutoListener = changeAutoMode;

        section.addEventListener("genesis:memories-path", changePathListener);
        section.addEventListener("genesis:memories-auto", changeAutoListener);
        scroller.addEventListener("scroll", handleScrollListener, { passive: true });
        reducedMotion.addEventListener("change", handleMotionPreference);

        function animate() {
          if (destroyed) return;
          renderFrameId = window.requestAnimationFrame(animate);

          const now = performance.now();
          const delta = (now - lastTime) / 1000;
          lastTime = now;

          // Auto may advance ONLY inside the active sticky range
          if (autoScroll && isInActiveRange) {
            targetT += AUTO_T_PER_SEC * delta;
            setCamT(targetT);
          }

          if (!curve || !camera || !scene || !renderer) return;

          const t = ((1 - camProxy.t) % 1 + 1) % 1;

          const pathPos = curve.getPoint(t);
          if (!gsap.isTweening(camPos)) {
            camPos.x = pathPos.x;
            camPos.y = pathPos.y;
            camPos.z = pathPos.z + CAM_Z;
          }
          camera.position.set(camPos.x, camPos.y, camPos.z);

          for (const plane of planes) {
            const dx = camera.position.x - plane.position.x;
            const dy = camera.position.y - plane.position.y;
            const dz = Math.abs(camera.position.z - plane.position.z);
            const distXY = Math.sqrt(dx * dx + dy * dy);

            let dt = Math.abs(plane.userData.t - t);
            if (dt > 0.5) {
              dt = 1 - dt;
            }

            const isInFocusZone = dt < focusTGate && dz < Z_GATE && distXY < FOCUS_DIST;
            const targetScale = isInFocusZone ? computeFocusScale(distXY, FOCUS_DIST, MAX_SCALE) : 1;

            plane.userData.setScale(targetScale);
          }

          renderer.render(scene, camera);
        }

        requestRender = () => {
          if (!renderFrameId && !destroyed) {
            lastTime = performance.now();
            renderFrameId = window.requestAnimationFrame(animate);
          }
        };

        const handleResize = () => {
          if (!renderer || !camera || !host || destroyed || !scroller) return;
          const w = host.clientWidth || window.innerWidth;
          const h = host.clientHeight || window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

          measureBounds();
          const scrollTop = scroller.scrollTop;
          currentScrollProgress = computeProgress(scrollTop);
          isInActiveRange = scrollTop >= sectionTop && scrollTop <= sectionTop + stickyRange;
          if (!autoScroll) {
            targetT = currentScrollProgress;
            setCamT?.(targetT);
          }
        };
        handleResizeListener = handleResize;

        window.addEventListener("resize", handleResizeListener);
        resizeObserver = new ResizeObserver(handleResizeListener);
        resizeObserver.observe(host);
        resizeObserver.observe(section);

        visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            isIntersecting = Boolean(entry?.isIntersecting);
            if (isIntersecting) {
              // Ensure photo-scale animators exist on re-entry
              if (proxies.length === 0 && planes.length > 0) {
                attachScaleAnimators();
              }
              measureBounds();
              const scrollTop = scroller.scrollTop;
              currentScrollProgress = computeProgress(scrollTop);
              isInActiveRange = scrollTop >= sectionTop && scrollTop <= sectionTop + stickyRange;
              if (!autoScroll) {
                targetT = currentScrollProgress;
                setCamT(targetT);
              }
              requestRender?.();
            } else {
              // Scene left view completely: cancel pending camera easing and pause render loop
              gsap.killTweensOf(camProxy);
              gsap.killTweensOf(camPos);
              if (scroller) {
                const st = scroller.scrollTop;
                if (st >= sectionTop + stickyRange) {
                  camProxy.t = 1;
                } else if (st <= sectionTop) {
                  camProxy.t = 0;
                }
              }
              // Pause photo-scale and position tweens (preserves reusable quickTo functions on re-entry)
              proxies.forEach((proxy) => {
                gsap.getTweensOf(proxy).forEach((tween) => tween.pause());
              });
              planes.forEach((mesh) => {
                gsap.getTweensOf(mesh.position).forEach((tween) => tween.pause());
              });
              if (renderFrameId) {
                window.cancelAnimationFrame(renderFrameId);
                renderFrameId = 0;
              }
            }
          },
          { root: scroller, threshold: 0 },
        );
        visibilityObserver.observe(section);

        // Initial setup & single still frame render
        measureBounds();
        const initialScrollTop = scroller.scrollTop;
        currentScrollProgress = computeProgress(initialScrollTop);
        isInActiveRange = initialScrollTop >= sectionTop && initialScrollTop <= sectionTop + stickyRange;
        targetT = currentScrollProgress;
        camProxy.t = targetT; // Instant positioning on initial mount (no animation jump on refresh)

        const initialT = ((1 - camProxy.t) % 1 + 1) % 1;
        const initialPos = curve.getPoint(initialT);
        camPos.x = initialPos.x;
        camPos.y = initialPos.y;
        camPos.z = initialPos.z + CAM_Z;
        camera.position.set(camPos.x, camPos.y, camPos.z);

        const bounds = section.getBoundingClientRect();
        const scrollerBounds = scroller.getBoundingClientRect();
        isIntersecting = bounds.bottom > scrollerBounds.top && bounds.top < scrollerBounds.bottom;
        if (isIntersecting) {
          requestRender?.();
        }

        renderer.render(scene, camera);
        onReady();

        if (typeof window !== "undefined") {
          window.__memoriesGallery = {
            getMaxPlaneScale: () => (planes.length ? Math.max(...planes.map((p) => p.scale.x)) : 1),
            getPlanesInFocusCount: () => (planes.length ? planes.filter((p) => p.scale.x > 1.2).length : 0),
            getCamT: () => camProxy.t,
            getTargetT: () => targetT,
            getIsActive: () => isInActiveRange,
            getIsIntersecting: () => isIntersecting,
          };
        }
      } catch (err) {
        console.error("CurveMemoriesGallery init error:", err);
        if (!destroyed) {
          cleanup();
          onUnavailable();
        }
      }
    };

    void init();

    return () => {
      cleanup();
    };
  }, [onReady, onUnavailable, scrollContainerRef]);

  return <div ref={hostRef} className="w-full h-full" />;
}
