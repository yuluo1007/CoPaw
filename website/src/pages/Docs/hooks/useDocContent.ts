import { useEffect, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { ALL_SLUGS } from "../constants";

export function useDocContent(
  activeSlug: string,
  lang: "zh" | "en",
  isSearchPage: boolean,
  navigate: NavigateFunction,
) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (isSearchPage) return;
    if (!ALL_SLUGS.includes(activeSlug)) {
      navigate("/docs/intro", { replace: true });
      return;
    }
    setContent("");
    if (activeSlug === "functiondemo") {
      return;
    }
    let cancelled = false;
    const langSuffix = lang === "zh" ? "zh" : "en";
    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") || "";
    const url = `${base}/docs/${activeSlug}.${langSuffix}.md`;
    fetch(url)
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => {
        if (cancelled) return;
        if (text) {
          setContent(text);
          return;
        }
        return fetch(`${base}/docs/${activeSlug}.md`).then((r) =>
          r.ok ? r.text() : "",
        );
      })
      .then((fallback) => {
        if (!cancelled && typeof fallback === "string") setContent(fallback);
      })
      .catch(() => {
        if (!cancelled) setContent("");
      });
    return () => {
      cancelled = true;
    };
  }, [activeSlug, lang, navigate, isSearchPage]);

  return content;
}
