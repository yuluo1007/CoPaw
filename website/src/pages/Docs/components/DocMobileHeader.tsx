import { useTranslation } from "react-i18next";
import { Menu, ChevronRight } from "lucide-react";

interface DocMobileHeaderProps {
  sidebarOpen: boolean;
  breadcrumb: { parent?: string; current: string };
  onToggleSidebar: () => void;
}

export function DocMobileHeader({
  sidebarOpen,
  breadcrumb,
  onToggleSidebar,
}: DocMobileHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky -top-px z-20 border-b border-border/60 bg-(--surface) pb-3 md:hidden">
      <div className="flex items-center gap-2" onClick={onToggleSidebar}>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg)"
          aria-label={
            sidebarOpen ? t("docs.closeSidebar") : t("docs.toggleSidebar")
          }
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0 text-base">
          {breadcrumb.parent && (
            <>
              <span className="align-middle text-(--text-muted)">
                {breadcrumb.parent}
              </span>
              <ChevronRight
                size={16}
                className="mx-1 inline align-middle text-(--text-muted)"
              />
            </>
          )}
          <span className="align-middle font-semibold text-(--text)">
            {breadcrumb.current}
          </span>
        </div>
      </div>
    </div>
  );
}
