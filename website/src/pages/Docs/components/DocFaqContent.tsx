import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { ChevronDown } from "lucide-react";
import { REMARK_PLUGINS, REHYPE_PLUGINS } from "../markdownConfig";
import { createMarkdownComponents } from "../markdown";
import type { FaqItem } from "../types";

interface DocFaqContentProps {
  intro: string;
  items: FaqItem[];
  titleBannerSrc: string;
  getHeadingId: (children: React.ReactNode) => string;
}

export function DocFaqContent({
  intro,
  items,
  titleBannerSrc,
  getHeadingId,
}: DocFaqContentProps) {
  const { t } = useTranslation();
  const [openFaqSet, setOpenFaqSet] = useState<Set<number>>(() => new Set([0]));

  const introComponents = createMarkdownComponents({
    getHeadingId,
    titleBannerSrc,
    t,
    variant: "faq-intro",
  });
  const answerComponents = createMarkdownComponents({
    getHeadingId,
    t,
    variant: "faq-answer",
  });

  return (
    <>
      {intro && (
        <ReactMarkdown
          remarkPlugins={REMARK_PLUGINS}
          rehypePlugins={REHYPE_PLUGINS}
          components={introComponents}
        >
          {intro}
        </ReactMarkdown>
      )}
      <div className="mt-4">
        {items.map((item, idx) => {
          const opened = openFaqSet.has(idx);
          return (
            <section
              key={item.id}
              id={item.id}
              className="mb-3 rounded-lg border border-border bg-(--surface)"
            >
              <button
                type="button"
                onClick={() => {
                  setOpenFaqSet((prev) => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx);
                    else next.add(idx);
                    return next;
                  });
                }}
                className="flex w-full items-center justify-between gap-3 bg-transparent px-4 py-4 text-left text-base font-semibold text-(--text)"
                aria-expanded={opened}
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={16}
                  className={[
                    "shrink-0 transition-transform duration-150 ease-in-out",
                    opened ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                />
              </button>
              {opened && (
                <div className="docs-faq-answer border-t border-border px-4 pb-2 pt-3 *:first:mt-0 *:last:mb-0">
                  <ReactMarkdown
                    remarkPlugins={REMARK_PLUGINS}
                    rehypePlugins={REHYPE_PLUGINS}
                    components={answerComponents}
                  >
                    {item.answer}
                  </ReactMarkdown>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
