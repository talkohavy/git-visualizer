import { useCallback } from 'react';

type UseScrollToEdgeProps = {
  to: 'top' | 'bottom';
  refElement: React.RefObject<HTMLElement | null>;
  scrollBehavior?: 'smooth' | 'instant' | 'auto';
};

export function useScrollToEdge(props: UseScrollToEdgeProps) {
  const { refElement, scrollBehavior = 'smooth', to } = props;

  const scrollToEdge = useCallback(() => {
    const element = refElement.current;

    if (!element) return;

    element.scrollTo({
      top: to === 'top' ? 0 : element.scrollHeight,
      behavior: scrollBehavior,
    });
    // refElement should not be a dependency here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, scrollBehavior]);

  return { scrollToEdge };
}
