import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { DocNavItem } from "../types";

interface DocPrevNextProps {
  prevDoc: DocNavItem | null;
  nextDoc: DocNavItem | null;
}

export function DocPrevNext({ prevDoc, nextDoc }: DocPrevNextProps) {
  if (!prevDoc && !nextDoc) return null;

  return (
    <div className="mt-10 px-4 py-8 md:px-6">
      <div className="flex items-center justify-between gap-4">
        {prevDoc ? (
          <Link
            to={`/docs/${prevDoc.slug}`}
            className="group inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-(--color-text) no-underline hover:!text-(--color-primary) hover:no-underline"
            style={{ textDecoration: "none" }}
          >
            <ChevronRight
              size={16}
              className="shrink-0 rotate-180 text-(--text-muted) group-hover:text-(--color-primary)"
              aria-hidden
            />
            <span className="truncate group-hover:text-(--color-primary)">
              {prevDoc.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {nextDoc && (
          <Link
            to={`/docs/${nextDoc.slug}`}
            className="group inline-flex min-w-0 items-center justify-end gap-2 text-sm font-semibold text-(--color-text) no-underline hover:!text-(--color-primary) hover:no-underline"
            style={{ textDecoration: "none" }}
          >
            <span className="truncate group-hover:text-(--color-primary)">
              {nextDoc.title}
            </span>
            <ChevronRight
              size={16}
              className="shrink-0 text-(--text-muted) group-hover:text-(--color-primary)"
              aria-hidden
            />
          </Link>
        )}
      </div>
    </div>
  );
}
