export interface Category {
  slug: string; // matches the folder name under content/docs
  title: string;
  description: string;
}

// This list drives the card grid on the homepage. Keep it in sync with the
// top-level folders under content/docs/ (the migration script creates those
// folders and their meta.json files from this same list — see
// scripts/migrate-content.mjs).
export const categories: Category[] = [
  {
    slug: "fundamentals",
    title: "CS Fundamentals",
    description:
      "OOP, design patterns, APIs & HTTP, databases, networking, DSA, operating systems, and security.",
  },
  {
    slug: "languages",
    title: "Programming Languages",
    description: "C/C++, Dart, Java, Python, and JavaScript.",
  },
  {
    slug: "web-frameworks",
    title: "Web & App Frameworks",
    description: "FastAPI, Next.js, TypeScript, React, and Flutter.",
  },
  {
    slug: "ai-engineering",
    title: "AI Engineering",
    description:
      "Embeddings & vector databases, RAG, prompt engineering, AI agents, fine-tuning, inference optimization, and evaluation.",
  },
];
