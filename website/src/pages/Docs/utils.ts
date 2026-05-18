import type { FaqItem, TocItem } from "./types";

/** Build URL-safe id from heading text (en + zh). */
export function slugifyHeading(text: string): string {
  const s = text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, "");
  return s || "section";
}

export function allocateHeadingId(
  text: string,
  idCounter: Map<string, number>,
): string {
  const baseId = slugifyHeading(text);
  const count = (idCounter.get(baseId) ?? 0) + 1;
  idCounter.set(baseId, count);
  return count === 1 ? baseId : `${baseId}-${count}`;
}

/** Advance id counter for h2/h3 in markdown (matches parseToc order). */
export function consumeHeadingIdsFromMarkdown(
  md: string,
  idCounter: Map<string, number>,
): void {
  const re = /^#{2,3}\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const text = m[1].replace(/#+\s*$/, "").trim();
    allocateHeadingId(text, idCounter);
  }
}

/** Extract h2/h3 from markdown in order. */
export function parseToc(md: string): TocItem[] {
  const toc: TocItem[] = [];
  const idCounter = new Map<string, number>();
  const re = /^#{2,3}\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const level = m[0].startsWith("###") ? 3 : 2;
    const text = m[1].replace(/#+\s*$/, "").trim();
    const id = allocateHeadingId(text, idCounter);
    toc.push({ level, text, id });
  }
  return toc;
}

/** Flatten React children to string for slug. */
export function headingText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (children && typeof children === "object" && "props" in children)
    return headingText((children as React.ReactElement).props.children);
  return "";
}

export function createHeadingIdAllocator() {
  const idCounter = new Map<string, number>();
  return (children: React.ReactNode) =>
    allocateHeadingId(headingText(children), idCounter);
}

export function parseFaqContent(md: string): { intro: string; items: FaqItem[] } {
  const lines = md.split("\n");
  const introLines: string[] = [];
  const items: FaqItem[] = [];
  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];

  const flush = () => {
    if (!currentQuestion) return;
    items.push({
      question: currentQuestion,
      answer: currentAnswerLines.join("\n").trim(),
      id: "",
    });
    currentQuestion = null;
    currentAnswerLines = [];
  };

  for (const line of lines) {
    const m = line.match(/^###\s+(.+)$/);
    if (m) {
      flush();
      currentQuestion = m[1].trim();
      continue;
    }
    if (currentQuestion === null) introLines.push(line);
    else currentAnswerLines.push(line);
  }
  flush();

  const intro = introLines.join("\n").trim();
  // Reset and mirror parseToc: intro headings first, then FAQ questions.
  const tocIdCounter = new Map<string, number>();
  consumeHeadingIdsFromMarkdown(intro, tocIdCounter);
  const itemsWithIds = items.map((item) => ({
    ...item,
    id: allocateHeadingId(item.question, tocIdCounter),
  }));

  return {
    intro,
    items: itemsWithIds,
  };
}

export function getTocTargets(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      ".docs-content h2[id], .docs-content h3[id], .docs-content section[id]",
    ),
  );
}

export function getTopInContainer(container: HTMLElement, target: HTMLElement) {
  return Math.max(
    0,
    container.scrollTop +
      (target.getBoundingClientRect().top -
        container.getBoundingClientRect().top) -
      16,
  );
}
