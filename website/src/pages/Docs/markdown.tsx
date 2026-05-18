import { Link } from "react-router-dom";
import type { TFunction } from "i18next";
import type { Components } from "react-markdown";
import { MermaidBlock } from "@/components/MermaidBlock";
import { ImageZoom } from "@/components/ImageZoom";
import { CodeBlockWithCopy } from "./components/CodeBlockWithCopy";

export interface MarkdownComponentsOptions {
  getHeadingId: (children: React.ReactNode) => string;
  titleBannerSrc?: string;
  t: TFunction;
  variant?: "full" | "faq-intro" | "faq-answer";
}

export function createMarkdownComponents({
  getHeadingId,
  titleBannerSrc,
  t,
  variant = "full",
}: MarkdownComponentsOptions): Components {
  const img: Components["img"] = ({ src, alt, className }) => {
    if (variant === "full") {
      const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src ?? "");
      if (isVideo) {
        return (
          <video src={src ?? undefined} controls>
            {alt ?? t("docs.videoNotSupported")}
          </video>
        );
      }
    }
    return (
      <ImageZoom src={src ?? ""} alt={alt ?? ""} className={className} />
    );
  };

  const components: Components = { img };

  if (variant === "faq-intro" || variant === "full") {
    if (titleBannerSrc) {
      components.h1 = ({ children }) => (
        <>
          <h1>{children}</h1>
          <img
            src={titleBannerSrc}
            alt=""
            aria-hidden="true"
            className="docs-title-banner mt-3 mb-5 block h-[270px] w-full object-cover"
          />
        </>
      );
    }
    components.h2 = ({ children }) => {
      const id = getHeadingId(children);
      return <h2 id={id}>{children}</h2>;
    };
    components.h3 = ({ children }) => {
      const id = getHeadingId(children);
      return <h3 id={id}>{children}</h3>;
    };
  }

  if (variant === "full") {
    components.pre = ({ children, ...props }) => (
      <CodeBlockWithCopy>
        <pre {...props}>{children}</pre>
      </CodeBlockWithCopy>
    );
    components.a = ({ href, children }) => {
      const trimmed = href?.replace(/\.md$/, "") ?? "";
      const isRelative =
        trimmed.startsWith("./") || trimmed.startsWith("/docs/");
      if (isRelative) {
        const path = trimmed.startsWith("./")
          ? "/docs/" + trimmed.slice(2)
          : trimmed;
        const [pathname, hash] = path.split("#");
        const to = hash ? `${pathname}#${hash}` : pathname;
        return <Link to={to}>{children}</Link>;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    };
    components.table = ({ children }) => (
      <div className="docs-table-wrap">
        <table>{children}</table>
      </div>
    );
    components.code = ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const langCode = match?.[1];
      if (langCode === "mermaid") {
        const chart = String(children).replace(/\n$/, "");
        return <MermaidBlock chart={chart} />;
      }
      const isInline = !className;
      if (isInline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    };
  }

  return components;
}
