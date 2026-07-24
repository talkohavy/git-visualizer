import { useCallback, useRef, useState } from 'react';

type UseDragToScrollProps = {
  refElement: React.RefObject<HTMLElement | null>;
};

/**
 * Click-and-drag panning for a scrollable container. Instead of reaching for the
 * scrollbar or wheel, the user grabs the graph and swipes it around; we translate
 * the pointer delta into `scrollLeft`/`scrollTop` so it composes with the native
 * scroll (edge buttons, `onScroll` listeners, etc. all keep working).
 *
 * Touch is intentionally left to the browser: an `overflow-auto` container already
 * gives finger-swipe scrolling with momentum, so we only hijack mouse/pen drags.
 */
export function useDragToScroll(props: UseDragToScrollProps) {
  const { refElement } = props;
  const [isDragging, setIsDragging] = useState(false);
  const origin = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return;
      // Only the primary (usually left) button starts a pan.
      if (event.button !== 0) return;

      const element = refElement.current;
      if (!element) return;

      origin.current = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      };
      setIsDragging(true);
      element.setPointerCapture(event.pointerId);
    },
    [refElement],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!isDragging) return;

      const element = refElement.current;
      if (!element) return;

      element.scrollLeft = origin.current.scrollLeft - (event.clientX - origin.current.x);
      element.scrollTop = origin.current.scrollTop - (event.clientY - origin.current.y);
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
    },
    [isDragging, refElement],
  );

  const dragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: stop,
    onPointerCancel: stop,
  };

  return { isDragging, dragHandlers };
}
