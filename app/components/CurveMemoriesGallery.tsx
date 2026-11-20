"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import * as THREE from "three";
import type { CurveMemoriesGalleryProps } from "./memoriesData";

gsap.registerPlugin(Observer);

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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!host || !scroller || !section || reducedMotion.matches) {
      onUnavailable();
      return;
    }

    let destroyed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let observer: Observer | null = null;
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
    let setCamT: gsap.QuickToFunc | null = null;
    let targetT = 0;
    let autoScroll = false;
    let currentPathIndex = 0;
    let curve: THREE.CatmullRomCurve3 | null = null;
    let focusTGate = 0;
    let lastTime = performance.now();

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

      visibilityObserver?.disconnect();
      visibilityObserver = null;

      resizeObserver?.disconnect();
      resizeObserver = null;

      observer?.kill();
      observer = null;

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

        // Load 8 unique textures
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

        // 19 materials
        materials = textures.map(
          (tex) =>
            new THREE.MeshBasicMaterial({
              map: tex,
              side: THREE.DoubleSide,
            }),
        );

        const width = host.clientWidth || window.innerWidth;
        const height = host.clientHeight || window.innerHeight;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.tabIndex = -1;
        renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
        host.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = new THREE.Color("#020817");
        scene.fog = new THREE.Fog("#061936", 10, 40);

        camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);

        currentPathIndex = 0;
        curve = buildCurve(allRaws[0]);
        focusTGate = (FOCUS_DIST * 1.5) / curve.getLength();

        function createScaleAnimator(mesh: THREE.Mesh) {
          const proxy = { value: 1 };
          proxies.push(proxy);
          return gsap.quickTo(proxy, "value", {
            duration: 0.4,
            ease: "power3.out",
            onUpdate: () => mesh.scale.setScalar(proxy.value),
          });
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
          mesh.userData.setScale = createScaleAnimator(mesh);

          planes.push(mesh);
          scene.add(mesh);
        }

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

        setCamT = gsap.quickTo(camProxy, "t", { duration: 1, ease: "power3.out" });

        let sensitivity = 0.8 / ((scroller.clientHeight || height) * 4);

        observer = Observer.create({
          target: scroller,
          type: "wheel,touch,pointer",
          preventDefault: false,
          onChange: (self) => {
            if (autoScroll) return;
            targetT += self.deltaY * sensitivity;
            setCamT?.(targetT);
          },
        });
        observer.disable();

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
          autoScroll = Boolean(customEvent.detail?.enabled);
          if (!autoScroll) {
            targetT = camProxy.t;
          }
        };
        changeAutoListener = changeAutoMode;

        section.addEventListener("genesis:memories-path", changePathListener);
        section.addEventListener("genesis:memories-auto", changeAutoListener);
        reducedMotion.addEventListener("change", handleMotionPreference);

        function animate() {
          if (destroyed) return;
          renderFrameId = window.requestAnimationFrame(animate);

          const now = performance.now();
          const delta = (now - lastTime) / 1000;
          lastTime = now;

          if (autoScroll) {
            targetT += AUTO_T_PER_SEC * delta;
            setCamT?.(targetT);
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

        const handleResize = () => {
          if (!renderer || !camera || !host || destroyed) return;
          const w = host.clientWidth || window.innerWidth;
          const h = host.clientHeight || window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          sensitivity = 0.8 / ((scroller.clientHeight || h) * 4);
        };
        handleResizeListener = handleResize;

        window.addEventListener("resize", handleResizeListener);
        resizeObserver = new ResizeObserver(handleResizeListener);
        resizeObserver.observe(host);

        visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            const isIntersecting = Boolean(entry?.isIntersecting);
            if (isIntersecting) {
              observer?.enable();
              lastTime = performance.now();
              if (!renderFrameId) {
                renderFrameId = window.requestAnimationFrame(animate);
              }
            } else {
              observer?.disable();
              if (renderFrameId) {
                window.cancelAnimationFrame(renderFrameId);
                renderFrameId = 0;
              }
            }
          },
          { root: scroller, threshold: 0 },
        );
        visibilityObserver.observe(section);

        // Check if section is already in view initially
        const bounds = section.getBoundingClientRect();
        const scrollerBounds = scroller.getBoundingClientRect();
        const initiallyVisible =
          bounds.bottom > scrollerBounds.top && bounds.top < scrollerBounds.bottom;
        if (initiallyVisible) {
          observer.enable();
          lastTime = performance.now();
          if (!renderFrameId) {
            renderFrameId = window.requestAnimationFrame(animate);
          }
        }

        renderer.render(scene, camera);
        onReady();
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
