import { useEffect, useState } from "react";

export function useBackToTop(
  content: string,
  articleRef: React.RefObject<HTMLDivElement | null>,
) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const container = articleRef.current;
    if (!container) return;
    const onScroll = () => setShowBackToTop(container.scrollTop > 400);
    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, [content, articleRef]);

  return showBackToTop;
}
