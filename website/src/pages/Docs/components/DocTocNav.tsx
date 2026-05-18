import { useTranslation } from "react-i18next";
import type { TocItem } from "../types";

interface DocTocNavProps {
  toc: TocItem[];
  activeTocId: string | null;
  onTocClick: (e: React.MouseEvent, id: string, idx: number) => void;
}

export function DocTocNav({ toc, activeTocId, onTocClick }: DocTocNavProps) {
  const { t } = useTranslation();

  return (
    <aside className="docs-toc" aria-label={t("docs.onThisPage")}>
      <nav className="docs-toc-nav">
        {toc.map(({ level, text, id }, idx) => (
          <a
            key={id}
            href={`#${id}`}
            className={
              level === 3
                ? "docs-toc-item docs-toc-item-h3"
                : "docs-toc-item"
            }
            data-active={activeTocId === id ? "true" : undefined}
            onClick={(e) => onTocClick(e, id, idx)}
          >
            {text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
