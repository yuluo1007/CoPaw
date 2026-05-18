export interface DocEntry {
  slug: string;
  titleKey: string;
}

export interface DocGroup {
  titleKey: string;
  children: DocEntry[];
}

export interface FaqItem {
  question: string;
  answer: string;
  id: string;
}

export interface TocItem {
  level: 2 | 3;
  text: string;
  id: string;
}

export interface DocNavItem {
  slug: string;
  title: string;
}
