import { useEffect, useRef, useState } from "react";
import type { Location } from "react-router-dom";
import type { TocItem } from "../types";
import { getTopInContainer, getTocTargets } from "../utils";

export function useDocToc(
  content: string,
  toc: TocItem[],
  location: Location,
  activeSlug: string,
  articleRef: React.RefObject<HTMLDivElement | null>,
) {
  const [activeTocId, setActiveTocId] = useState<string | null>(null);
  const ignoredHashRef = useRef<string | null>(null);
  const isTocClickScrollingRef = useRef(false);
  const tocClickScrollUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    if (!location.hash) el.scrollTo(0, 0);
  }, [activeSlug, location.pathname, articleRef]);

  useEffect(() => {
    if (isTocClickScrollingRef.current) return;
    const rawHash = location.hash?.slice(1) ?? "";
    const hash = rawHash ? decodeURIComponent(rawHash.replace(/\+/g, " ")) : "";
    if (!hash) return;
    if (ignoredHashRef.current && ignoredHashRef.current !== hash) {
      ignoredHashRef.current = null;
    }
    if (ignoredHashRef.current === hash) return;

    const scrollToHash = (): boolean => {
      const container = articleRef.current;
      if (!container) return false;
      const byId = container.querySelector<HTMLElement>(`#${hash}`);
      const byHref = document.querySelector<HTMLAnchorElement>(
        `.docs-toc-nav a[href="#${hash}"]`,
      );
      const idx = byHref
        ? Array.from(document.querySelectorAll(".docs-toc-nav a")).indexOf(
            byHref,
          )
        : -1;
      const targets = getTocTargets(container);
      const target = byId ?? (idx >= 0 ? targets[idx] : null);
      if (!target) return false;
      container.scrollTo({
        top: getTopInContainer(container, target),
        behavior: "auto",
      });
      return true;
    };

    let cancelled = false;
    let raf2: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const raf1 = requestAnimationFrame(() => {
      if (cancelled) return;
      raf2 = requestAnimationFrame(() => {
        if (cancelled) return;
        if (scrollToHash()) return;
        timeoutId = setTimeout(() => {
          if (!cancelled) scrollToHash();
        }, 300);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      if (raf2 !== undefined) cancelAnimationFrame(raf2);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [content, location.hash, articleRef]);

  useEffect(() => {
    if (toc.length === 0) return;
    const container = articleRef.current;
    if (!container) return;
    const updateActive = () => {
      if (isTocClickScrollingRef.current) return;
      const containerTop = container.getBoundingClientRect().top;
      const trigger = containerTop + 120;
      let current: string | null = null;
      const targets = getTocTargets(container);
      for (let i = 0; i < toc.length; i += 1) {
        const el = targets[i];
        const { id } = toc[i];
        if (el && el.getBoundingClientRect().top <= trigger) current = id;
      }
      setActiveTocId(current ?? toc[0]?.id ?? null);
    };
    updateActive();
    container.addEventListener("scroll", updateActive, { passive: true });
    return () => container.removeEventListener("scroll", updateActive);
  }, [content, toc, articleRef]);

  useEffect(() => {
    if (!activeTocId) return;
    if (isTocClickScrollingRef.current) return;
    const tocEl = document.querySelector(".docs-toc");
    const link = document.querySelector<HTMLAnchorElement>(
      `.docs-toc-nav a[href="#${activeTocId}"]`,
    );
    if (!tocEl || !link) return;
    const linkTop = link.offsetTop;
    const linkH = link.offsetHeight;
    const tocH = tocEl.clientHeight;
    const maxScroll = tocEl.scrollHeight - tocH;
    const currentTop = tocEl.scrollTop;
    const currentBottom = currentTop + tocH;
    const linkBottom = linkTop + linkH;
    const isVisible = linkTop >= currentTop && linkBottom <= currentBottom;
    if (isVisible) return;
    const target = Math.max(
      0,
      Math.min(maxScroll, linkTop - tocH / 2 + linkH / 2),
    );
    tocEl.scrollTo({ top: target, behavior: "auto" });
  }, [activeTocId]);

  useEffect(() => {
    return () => {
      if (tocClickScrollUnlockTimerRef.current) {
        clearTimeout(tocClickScrollUnlockTimerRef.current);
      }
    };
  }, []);

  const handleTocClick = (e: React.MouseEvent, id: string, idx: number) => {
    e.preventDefault();
    const container = articleRef.current;
    if (!container) return;
    isTocClickScrollingRef.current = true;
    setActiveTocId(id);
    if (tocClickScrollUnlockTimerRef.current) {
      clearTimeout(tocClickScrollUnlockTimerRef.current);
    }
    const targets = getTocTargets(container);
    const top = targets[idx];
    if (top) {
      container.scrollTo({
        top: getTopInContainer(container, top),
        behavior: "auto",
      });
    } else {
      const el = container.querySelector<HTMLElement>(`#${id}`);
      if (!el) return;
      container.scrollTo({
        top: getTopInContainer(container, el),
        behavior: "auto",
      });
    }
    tocClickScrollUnlockTimerRef.current = setTimeout(() => {
      isTocClickScrollingRef.current = false;
    }, 120);
    ignoredHashRef.current = id;
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  };

  return { activeTocId, handleTocClick };
}
