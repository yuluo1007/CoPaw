import { useMemo } from "react";
import type { TFunction } from "i18next";
import { DOC_GROUPS } from "../constants";
import type { DocNavItem } from "../types";

export function useDocNav(activeSlug: string, t: TFunction) {
  const mobileBreadcrumb = useMemo<{ parent?: string; current: string }>(() => {
    const currentEntry = DOC_GROUPS.flatMap((g) => g.children).find(
      (entry) => entry.slug === activeSlug,
    );
    if (!currentEntry) {
      return { parent: t("docs.groupWelcome"), current: t("docs.intro") };
    }
    const group = DOC_GROUPS.find((g) =>
      g.children.some((entry) => entry.slug === activeSlug),
    );
    return {
      parent: group ? t(group.titleKey) : undefined,
      current: t(currentEntry.titleKey),
    };
  }, [activeSlug, t]);

  const flatDocNav = useMemo(() => {
    const out: DocNavItem[] = [];
    for (const group of DOC_GROUPS) {
      for (const entry of group.children) {
        out.push({ slug: entry.slug, title: t(entry.titleKey) });
      }
    }
    return out;
  }, [t]);

  const docEntryMap = useMemo(
    () =>
      new Map(
        DOC_GROUPS.flatMap((group) =>
          group.children.map(
            (entry) => [entry.slug, { title: t(entry.titleKey) }] as const,
          ),
        ),
      ),
    [t],
  );

  const { prevDoc, nextDoc } = useMemo(() => {
    const idx = flatDocNav.findIndex((d) => d.slug === activeSlug);
    return {
      prevDoc: idx > 0 ? flatDocNav[idx - 1] : null,
      nextDoc:
        idx >= 0 && idx < flatDocNav.length - 1 ? flatDocNav[idx + 1] : null,
    };
  }, [activeSlug, flatDocNav]);

  return { mobileBreadcrumb, flatDocNav, docEntryMap, prevDoc, nextDoc };
}
