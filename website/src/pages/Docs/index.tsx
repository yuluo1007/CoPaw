import { useState, useEffect, useMemo, useRef } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "lucide-react";
import { DocSearchResults } from "@/components/DocSearchResults";
import { DOC_BANNER_BY_SLUG, DOC_TITLE_BANNERS } from "./constants";
import { parseToc, parseFaqContent } from "./utils";
import { useDocContent } from "./hooks/useDocContent";
import { useDocNav } from "./hooks/useDocNav";
import { useDocToc } from "./hooks/useDocToc";
import { useBackToTop } from "./hooks/useBackToTop";
import { DocSidebar } from "./components/DocSidebar";
import { DocMobileHeader } from "./components/DocMobileHeader";
import { DocArticleContent } from "./components/DocArticleContent";
import { DocTocNav } from "./components/DocTocNav";

export default function Docs() {
  const { t, i18n } = useTranslation();
  const lang: "zh" | "en" = i18n.resolvedLanguage === "zh" ? "zh" : "en";
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeSlug = slug ?? "intro";
  const isSearchPage = activeSlug === "search";
  const searchQ = searchParams.get("q") ?? "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const articleRef = useRef<HTMLDivElement | null>(null);

  const content = useDocContent(activeSlug, lang, isSearchPage, navigate);
  const toc = useMemo(() => parseToc(content), [content]);
  const faqData = useMemo(() => parseFaqContent(content), [content]);
  const titleBannerSrc = useMemo(
    () => DOC_BANNER_BY_SLUG.get(activeSlug) ?? DOC_TITLE_BANNERS[0],
    [activeSlug],
  );

  const { mobileBreadcrumb, docEntryMap, prevDoc, nextDoc } = useDocNav(
    activeSlug,
    t,
  );
  const { activeTocId, handleTocClick } = useDocToc(
    content,
    toc,
    location,
    activeSlug,
    articleRef,
  );
  const showBackToTop = useBackToTop(content, articleRef);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSlug, isSearchPage, searchQ]);

  return (
    <>
      <div className="docs-layout relative">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            aria-label={t("docs.closeSidebar")}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <DocSidebar
          activeSlug={activeSlug}
          sidebarOpen={sidebarOpen}
          isSearchPage={isSearchPage}
          searchQ={searchQ}
          docEntryMap={docEntryMap}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
        <main className="docs-main relative min-w-0">
          <div className="docs-content-scroll" ref={articleRef}>
            <DocMobileHeader
              sidebarOpen={sidebarOpen}
              breadcrumb={mobileBreadcrumb}
              onToggleSidebar={() => setSidebarOpen((o) => !o)}
            />
            {isSearchPage ? (
              <DocSearchResults query={searchQ} />
            ) : (
              <DocArticleContent
                activeSlug={activeSlug}
                content={content}
                titleBannerSrc={titleBannerSrc}
                faqIntro={faqData.intro}
                faqItems={faqData.items}
                prevDoc={prevDoc}
                nextDoc={nextDoc}
              />
            )}
          </div>
          {!isSearchPage && toc.length > 0 && (
            <DocTocNav
              toc={toc}
              activeTocId={activeTocId}
              onTocClick={handleTocClick}
            />
          )}
        </main>
      </div>
      {showBackToTop && (
        <button
          type="button"
          className="docs-back-to-top"
          onClick={() =>
            articleRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          aria-label={t("docs.backToTop")}
        >
          <ArrowUp size={20} aria-hidden />
        </button>
      )}
    </>
  );
}
