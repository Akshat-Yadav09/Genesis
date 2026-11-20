type TimelineParticles = {
  onScroll(position: number, timestamp: number): void;
  destroy(): void;
};

type Spark = {
  x: number;
  y: number;
  drift: number;
  speed: number;
  born: number;
  life: number;
  trail: number;
  bend: number;
  size: number;
  brightness: number;
  white: boolean;
};

const FRAME_MS = 1000 / 60;
const SCROLL_PAUSE_MS = 120;
const MAX_CANVAS_SIDE = 4096;
const GOLD = ["#ff9d24", "#ffe066", "#fff3b0"];
const WHITE = ["#ffe8a1", "#fffefa", "#ffffff"];

export function createTimelineParticles(
  canvas: HTMLCanvasElement,
  track: HTMLElement,
  scroller: HTMLElement,
): TimelineParticles | null {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ctx = context;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(pointer: coarse), (max-width: 639px)");
  const lowCore = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
  const pool = Array.from({ length: lowCore ? 18 : 36 }, (): Spark => ({
    x: 0, y: 0, drift: 0, speed: 0, born: 0, life: 0,
    trail: 0, bend: 0, size: 1, brightness: 0, white: false,
  }));

  let active = 0;
  let frame = 0;
  let lastFrame = 0;
  let previousPosition = scroller.scrollTop;
  let lastMovement: number | null = null;
  let lastMeasurement = 0;
  let previousCanvasTop: number | null = null;
  let direction = 1;
  let carry = 0;
  let inView = false;
  let top = 0;
  let bottom = 0;
  let center = 0;
  let width = 0;
  let height = 0;
  let paintedTop = 0;
  let paintedBottom = 0;

  const constrained = () => lowCore || compact.matches;
  const enabled = () => !motion.matches && !document.hidden;

  const clearPaint = () => {
    if (paintedBottom > paintedTop) {
      ctx.clearRect(0, paintedTop, width, paintedBottom - paintedTop);
      paintedTop = paintedBottom = 0;
    }
  };

  const stop = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    active = 0;
    carry = 0;
    inView = false;
    previousCanvasTop = null;
    clearPaint();
  };

  const measureSlice = (scrolling = false) => {
    lastMeasurement = performance.now();
    const trackRect = track.getBoundingClientRect();
    const root = document.documentElement;
    let viewTop = 0;
    let viewLeft = 0;
    let viewBottom = root.clientHeight;
    let viewRight = root.clientWidth;

    if (scroller !== document.scrollingElement) {
      const rect = scroller.getBoundingClientRect();
      // The client box excludes borders and scrollbars. Scale its offsets to match the DOM rect.
      const scaleX = rect.width / Math.max(1, scroller.offsetWidth);
      const scaleY = rect.height / Math.max(1, scroller.offsetHeight);
      const left = rect.left + scroller.clientLeft * scaleX;
      const top = rect.top + scroller.clientTop * scaleY;
      viewLeft = Math.max(viewLeft, left);
      viewTop = Math.max(viewTop, top);
      viewRight = Math.min(viewRight, left + scroller.clientWidth * scaleX);
      viewBottom = Math.min(viewBottom, top + scroller.clientHeight * scaleY);
    }

    if (trackRect.right <= viewLeft || trackRect.left >= viewRight || viewRight <= viewLeft) {
      return false;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const visibleTop = Math.max(trackRect.top, canvasRect.top, viewTop);
    const visibleBottom = Math.min(trackRect.bottom, canvasRect.bottom, viewBottom);
    if (visibleBottom <= visibleTop || canvasRect.width <= 0) return false;

    top = visibleTop - canvasRect.top;
    bottom = visibleBottom - canvasRect.top;
    center = (trackRect.left + trackRect.right) / 2 - canvasRect.left;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      constrained() ? 1.5 : 2,
      MAX_CANVAS_SIDE / Math.max(canvasRect.width, canvasRect.height),
    );
    const pixelWidth = Math.max(1, Math.round(canvasRect.width * dpr));
    const pixelHeight = Math.max(1, Math.round(canvasRect.height * dpr));

    if (width !== canvasRect.width || height !== canvasRect.height ||
      canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      clearPaint();
      if (height > 0 && height !== canvasRect.height) {
        const scaleY = canvasRect.height / height;
        for (let i = 0; i < active; i += 1) pool[i].y *= scaleY;
      }
      width = canvasRect.width;
      height = canvasRect.height;
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
      ctx.lineCap = "round";
    }

    if (scrolling && previousCanvasTop !== null) {
      // Cancel the canvas movement so existing sparks keep their viewport position.
      const offsetY = previousCanvasTop - canvasRect.top;
      for (let i = 0; i < active; i += 1) pool[i].y += offsetY;
    }
    previousCanvasTop = canvasRect.top;
    return true;
  };

  const draw = (timestamp: number) => {
    frame = 0;
    clearPaint();
    if (!enabled()) {
      stop();
      return;
    }

    let dirtyTop = height;
    let dirtyBottom = 0;
    let index = 0;
    while (index < active) {
      const spark = pool[index];
      const age = timestamp - spark.born;
      const fade = Math.max(0, 1 - age / spark.life);
      const delta = Math.min(34, Math.max(0, timestamp - Math.max(lastFrame, spark.born))) / 1000;
      spark.x += spark.drift * delta;
      spark.y += spark.speed * direction * delta;

      if (fade === 0 || spark.y < -spark.trail || spark.y > height + spark.trail) {
        active -= 1;
        pool[index] = pool[active];
        pool[active] = spark;
        continue;
      }
      index += 1;

      const tailY = spark.y - spark.trail * direction * (0.5 + fade * 0.5);
      const minY = Math.min(tailY, spark.y) - 3;
      const maxY = Math.max(tailY, spark.y) + 3;
      if (maxY < top || minY > bottom) continue;
      dirtyTop = Math.min(dirtyTop, minY);
      dirtyBottom = Math.max(dirtyBottom, maxY);

      const colors = spark.white ? WHITE : GOLD;
      const alpha = spark.brightness * fade * fade;
      const x = center + spark.x;
      const midX = x + spark.bend;
      const midY = spark.y + (tailY - spark.y) * 0.36;
      ctx.beginPath();
      ctx.moveTo(x - spark.drift * 0.03, tailY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(x, spark.y);
      ctx.globalAlpha = alpha * 0.23;
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 3.5 * spark.size;
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.82;
      ctx.strokeStyle = colors[1];
      ctx.lineWidth = 0.9 * spark.size;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(x, spark.y);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = colors[2];
      ctx.lineWidth = 1.1 * spark.size;
      ctx.stroke();
    }
    paintedTop = Math.max(0, Math.floor(dirtyTop));
    paintedBottom = Math.min(height, Math.ceil(dirtyBottom));
    lastFrame = timestamp;
    if (active > 0) frame = window.requestAnimationFrame(draw);
  };

  const spawn = (count: number, timestamp: number, intensity: number, limit: number) => {
    const pad = Math.min(4, (bottom - top) * 0.2);
    const spread = Math.min(width * 0.3, 18);
    for (let i = 0; i < count && active < limit; i += 1) {
      const spark = pool[active];
      active += 1;
      const jitter = (Math.random() + Math.random()) / 2;
      spark.x = (jitter - 0.5) * spread * 2;
      spark.y = top + pad + (bottom - top - 2 * pad) * Math.random();
      spark.drift = (Math.random() - 0.5) * 36;
      spark.speed = 85 + intensity * 265 + Math.random() * 95;
      spark.born = timestamp;
      spark.life = 255 + intensity * 115 + Math.random() * 150;
      spark.trail = 3 + intensity * 13 + Math.random() * 5;
      spark.bend = (Math.random() - 0.5) * (2 + intensity * 2);
      spark.size = 0.75 + Math.random() * 0.4;
      spark.brightness = 0.46 + intensity * 0.31 + Math.random() * 0.22;
      spark.white = Math.random() < 0.12;
    }
  };

  const onScroll = (position: number, timestamp: number) => {
    const distance = position - previousPosition;
    previousPosition = position;
    if (distance === 0 || !enabled()) return;

    const elapsed = lastMovement === null ? SCROLL_PAUSE_MS : timestamp - lastMovement;
    lastMovement = timestamp;
    const wasInView = inView;
    if (!measureSlice(true)) {
      stop();
      return;
    }
    inView = true;

    const starting = !wasInView || elapsed >= SCROLL_PAUSE_MS;
    const sampleMs = starting ? FRAME_MS : Math.max(1, elapsed);
    const velocity = distance * 1000 / sampleMs;
    const intensity = Math.min(1, Math.abs(velocity) / 1450);
    direction = Math.sign(velocity);

    const lowBudget = constrained();
    const cap = lowBudget ? 3 : 5;
    if (starting) carry = 0;
    carry += (lowBudget ? 8 + intensity * 53 : 11 + intensity * 93) * Math.min(34, sampleMs) / 1000;
    const due = Math.floor(carry);
    carry -= due;
    const burst = starting && Math.abs(distance) >= 3 ? 1 + Math.round(intensity * (lowBudget ? 1 : 2)) : 0;
    const count = Math.min(cap, Math.max(due, burst));
    spawn(count, timestamp, intensity, lowBudget ? 18 : pool.length);

    if (!frame && active > 0) {
      lastFrame = timestamp;
      frame = window.requestAnimationFrame(draw);
    }
  };

  const refreshActiveSlice = () => {
    if (active > 0 && !measureSlice()) stop();
  };
  const syncPreference = () => {
    stop();
    previousPosition = scroller.scrollTop;
    lastMovement = null;
  };

  // Observe ancestor and viewport clipping even when hiding the track does not scroll the scroller.
  const intersection = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && entry.time >= lastMeasurement) stop();
  });
  intersection.observe(track);
  const resize = new ResizeObserver(refreshActiveSlice);
  resize.observe(track);
  resize.observe(canvas);
  resize.observe(scroller);
  window.addEventListener("resize", refreshActiveSlice);
  motion.addEventListener("change", syncPreference);
  compact.addEventListener("change", syncPreference);
  document.addEventListener("visibilitychange", syncPreference);

  return {
    onScroll,
    destroy() {
      intersection.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", refreshActiveSlice);
      motion.removeEventListener("change", syncPreference);
      compact.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncPreference);
      stop();
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
