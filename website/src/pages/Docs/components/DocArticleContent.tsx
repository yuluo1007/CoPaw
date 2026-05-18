import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { FeatureDemoGallery } from "@/components/FeatureDemoGallery";
import { REMARK_PLUGINS, REHYPE_PLUGINS } from "../markdownConfig";
import { createMarkdownComponents } from "../markdown";
import { createHeadingIdAllocator } from "../utils";
import { DocFaqContent } from "./DocFaqContent";
import { DocPrevNext } from "./DocPrevNext";
import type { DocNavItem, FaqItem } from "../types";

interface DocArticleContentProps {
  activeSlug: string;
  content: string;
  titleBannerSrc: string;
  faqIntro: string;
  faqItems: FaqItem[];
  prevDoc: DocNavItem | null;
  nextDoc: DocNavItem | null;
}

export function DocArticleContent({
  activeSlug,
  content,
  titleBannerSrc,
  faqIntro,
  faqItems,
  prevDoc,
  nextDoc,
}: DocArticleContentProps) {
  const { t } = useTranslation();
  const getHeadingId = createHeadingIdAllocator();
  const isStandardDoc =
    activeSlug !== "faq" && activeSlug !== "functiondemo";
  const markdownComponents = isStandardDoc
    ? createMarkdownComponents({
        getHeadingId,
        titleBannerSrc,
        t,
        variant: "full",
      })
    : null;

  return (
    <article className="docs-content">
      {activeSlug === "functiondemo" && (
        <>
          <h1>{t("docs.demoTitle")}</h1>
          <FeatureDemoGallery />
        </>
      )}
      {activeSlug === "faq" && (
        <DocFaqContent
          intro={faqIntro}
          items={faqItems}
          titleBannerSrc={titleBannerSrc}
          getHeadingId={getHeadingId}
        />
      )}
      {isStandardDoc && markdownComponents && (
        <ReactMarkdown
          remarkPlugins={REMARK_PLUGINS}
          rehypePlugins={REHYPE_PLUGINS}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      )}
      <DocPrevNext prevDoc={prevDoc} nextDoc={nextDoc} />
    </article>
  );
}
