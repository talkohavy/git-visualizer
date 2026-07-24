import { useCallback, useEffect, useRef, useState } from 'react';

type UseDragToScrollProps = {
  refElement: React.RefObject<HTMLElement | null>;
};

/**
 * Per-frame velocity is multiplied by this each frame (~60fps). Lower = more
 * friction / shorter glide, higher = longer glide. Applied via `FRICTION ** (dt / FRAME_MS)`
 * so the decay stays frame-rate independent.
 */
const FRICTION = 0.95;
const FRAME_MS = 1000 / 30;

/** Below this speed (px per frame) the glide is considered stopped. */
const MIN_VELOCITY = 0.05;

/** How long (ms) of recent pointer history feeds the release velocity. */
const VELOCITY_WINDOW_MS = 100;

/**
 * Click-and-drag panning for a scrollable container. Instead of reaching for the
 * scrollbar or wheel, the user grabs the graph and swipes it around; we translate
 * the pointer delta into `scrollLeft`/`scrollTop` so it composes with the native
 * scroll (edge buttons, `onScroll` listeners, etc. all keep working).
 *
 * On release we keep gliding: the pointer's recent velocity is carried into a
 * requestAnimationFrame loop that decays with friction, so the graph slides to a
 * smooth, decelerating stop instead of halting abruptly.
 *
 * Touch is intentionally left to the browser: an `overflow-auto` container already
 * gives finger-swipe scrolling with momentum, so we only hijack mouse/pen drags.
 */
export function useDragToScroll(props: UseDragToScrollProps) {
  const { refElement } = props;
  const [isDragging, setIsDragging] = useState(false);
  const origin = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Recent pointer samples used to estimate the release velocity.
  const samples = useRef<{ x: number; y: number; t: number }[]>([]);
  // Velocity in px per frame, carried through the momentum animation.
  const velocity = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const lastFrameTime = useRef(0);

  const stopMomentum = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const step = useCallback(
    (now: number) => {
      const element = refElement.current;
      if (!element) {
        rafId.current = null;
        return;
      }

      const dt = now - lastFrameTime.current;
      lastFrameTime.current = now;

      const decay = FRICTION ** (dt / FRAME_MS);
      velocity.current.x *= decay;
      velocity.current.y *= decay;

      const frames = dt / FRAME_MS;
      const beforeLeft = element.scrollLeft;
      const beforeTop = element.scrollTop;

      element.scrollLeft = beforeLeft + velocity.current.x * frames;
      element.scrollTop = beforeTop + velocity.current.y * frames;

      // If we hit a scroll boundary the position can't change; kill that axis so
      // we don't spin forever against the edge.
      if (element.scrollLeft === beforeLeft) velocity.current.x = 0;
      if (element.scrollTop === beforeTop) velocity.current.y = 0;

      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      if (speed < MIN_VELOCITY) {
        rafId.current = null;
        return;
      }

      rafId.current = requestAnimationFrame(step);
    },
    [refElement],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return;
      // Only the primary (usually left) button starts a pan.
      if (event.button !== 0) return;

      const element = refElement.current;
      if (!element) return;

      // A fresh grab cancels any in-flight glide.
      stopMomentum();
      velocity.current = { x: 0, y: 0 };
      samples.current = [{ x: event.clientX, y: event.clientY, t: event.timeStamp }];

      origin.current = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      };
      setIsDragging(true);
      element.setPointerCapture(event.pointerId);
    },
    [refElement, stopMomentum],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!isDragging) return;

      const element = refElement.current;
      if (!element) return;

      element.scrollLeft = origin.current.scrollLeft - (event.clientX - origin.current.x);
      element.scrollTop = origin.current.scrollTop - (event.clientY - origin.current.y);

      const now = event.timeStamp;
      samples.current.push({ x: event.clientX, y: event.clientY, t: now });
      // Keep only the recent tail so the release velocity reflects the final flick.
      while (samples.current.length > 2 && now - samples.current[0]!.t > VELOCITY_WINDOW_MS) {
        samples.current.shift();
      }
    },
    [isDragging, refElement],
  );

  const stop = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!isDragging) return;

      setIsDragging(false);

      const element = refElement.current;
      if (element?.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }

      const first = samples.current[0];
      const last = samples.current[samples.current.length - 1];
      samples.current = [];

      if (first && last && last.t > first.t) {
        const dt = last.t - first.t;
        velocity.current = {
          x: (-(last.x - first.x) / dt) * FRAME_MS,
          y: (-(last.y - first.y) / dt) * FRAME_MS,
        };

        if (Math.hypot(velocity.current.x, velocity.current.y) >= MIN_VELOCITY) {
          lastFrameTime.current = performance.now();
          stopMomentum();
          rafId.current = requestAnimationFrame(step);
        }
      }
    },
    [isDragging, refElement, step, stopMomentum],
  );

  useEffect(() => stopMomentum, [stopMomentum]);

  const dragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: stop,
    onPointerCancel: stop,
  };

  return { isDragging, dragHandlers };
}
