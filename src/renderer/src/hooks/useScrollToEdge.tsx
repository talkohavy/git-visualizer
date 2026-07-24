import { useCallback, useEffect, useRef } from 'react';

type UseScrollToEdgeProps = {
  to: 'top' | 'bottom';
  refElement: React.RefObject<HTMLElement | null>;
  scrollBehavior?: 'smooth' | 'instant' | 'auto';
  /** Duration of the smooth scroll animation, in ms. */
  durationMs?: number;
};

const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Scrolls the referenced element to its top or bottom edge.
 *
 * The smooth animation is driven manually via requestAnimationFrame instead of the
 * native `scrollTo({ behavior: 'smooth' })`. The native animation is aborted by
 * Chromium whenever the scroll container's content mutates mid-flight, which happens
 * on every frame once graph virtualization swaps its rendered window in and out.
 * Owning the loop keeps the scroll immune to those mutations, and each scrollTop write
 * still fires the native scroll event that keeps the virtualization window in sync.
 */
export function useScrollToEdge(props: UseScrollToEdgeProps) {
  const { refElement, scrollBehavior = 'smooth', to, durationMs = 400 } = props;
  const rafRef = useRef<number | null>(null);

  const cancelAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => cancelAnimation, [cancelAnimation]);

  const scrollToEdge = useCallback(() => {
    const element = refElement.current;

    if (!element) return;

    cancelAnimation();

    const getTarget = () => (to === 'top' ? 0 : element.scrollHeight - element.clientHeight);

    if (scrollBehavior !== 'smooth') {
      element.scrollTop = getTarget();
      return;
    }

    const start = element.scrollTop;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = easeInOutQuad(progress);

      // Recompute the target every frame: scrollHeight can shift while the graph
      // renders newly revealed rows during the scroll.
      const target = getTarget();
      element.scrollTop = start + (target - start) * eased;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    // refElement should not be a dependency here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, scrollBehavior, durationMs, cancelAnimation]);

  return { scrollToEdge };
}
