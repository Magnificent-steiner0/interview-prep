#!/usr/bin/env node
/**
 * Migrates the existing, standalone interview-prep .md files into
 * content/docs/<category>/<slug>.mdx with proper Fumadocs frontmatter
 * and per-folder meta.json files that control sidebar order/titles.
 *
 * Source location defaults to /mnt/user-data/outputs (where the files
 * currently live). Override with SOURCE_DIR=/path/to/files if you're
 * running this after downloading the files elsewhere.
 *
 * Usage:  node scripts/migrate-content.mjs
 *         SOURCE_DIR=./my-files node scripts/migrate-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = process.env.SOURCE_DIR || "/mnt/user-data/outputs";
const DOCS_DIR = join(__dirname, "..", "content", "docs");

// slug: URL-friendly identifier, also the .mdx filename
// order: sidebar position within its category
// title: shown in the sidebar + <DocsTitle>
const MANIFEST = [
  // ---- fundamentals ----
  { src: "01_OOP_Interview_Prep.md", category: "fundamentals", order: 1, slug: "oop", title: "Object-Oriented Programming" },
  { src: "02_Design_Patterns_Interview_Prep.md", category: "fundamentals", order: 2, slug: "design-patterns", title: "Design Patterns" },
  { src: "03_APIs_HTTP_Interview_Prep.md", category: "fundamentals", order: 3, slug: "apis-http", title: "APIs & HTTP" },
  { src: "05_Databases_Interview_Prep.md", category: "fundamentals", order: 4, slug: "databases", title: "Databases" },
  { src: "07_Networking_Interview_Prep.md", category: "fundamentals", order: 5, slug: "networking", title: "Networking" },
  { src: "08_DSA_Complexity_Interview_Prep.md", category: "fundamentals", order: 6, slug: "dsa-complexity", title: "DSA & Complexity" },
  { src: "09_Operating_Systems_Interview_Prep.md", category: "fundamentals", order: 7, slug: "operating-systems", title: "Operating Systems" },
  { src: "10_Security_Interview_Prep.md", category: "fundamentals", order: 8, slug: "security", title: "Security" },

  // ---- languages ----
  { src: "00_C_CPP_Interview_Prep.md", category: "languages", order: 1, slug: "c-cpp", title: "C / C++" },
  { src: "06_Dart_Interview_Prep.md", category: "languages", order: 2, slug: "dart", title: "Dart" },
  { src: "11_Java_Interview_Prep.md", category: "languages", order: 3, slug: "java", title: "Java" },
  { src: "12_Python_Interview_Prep.md", category: "languages", order: 4, slug: "python", title: "Python" },
  { src: "13_JavaScript_Interview_Prep.md", category: "languages", order: 5, slug: "javascript", title: "JavaScript" },

  // ---- web-frameworks ----
  { src: "Web Frameworks/00_FastAPI_Interview_Prep.md", category: "web-frameworks", order: 1, slug: "fastapi", title: "FastAPI" },
  { src: "Web Frameworks/01_NextJS_Interview_Prep.md", category: "web-frameworks", order: 2, slug: "nextjs", title: "Next.js" },
  { src: "Web Frameworks/02_TypeScript_Interview_Prep.md", category: "web-frameworks", order: 3, slug: "typescript", title: "TypeScript" },
  { src: "Web Frameworks/03_React_Interview_Prep.md", category: "web-frameworks", order: 4, slug: "react", title: "React" },
  { src: "04_Flutter_Interview_Prep.md", category: "web-frameworks", order: 5, slug: "flutter", title: "Flutter" },

  // ---- ai-engineering ----
  { src: "AI Engineering Prep/00_Embeddings_and_Vector_Databases_Interview_Prep.md", category: "ai-engineering", order: 1, slug: "embeddings-vector-databases", title: "Embeddings & Vector Databases" },
  { src: "AI Engineering Prep/01_RAG_Interview_Prep.md", category: "ai-engineering", order: 2, slug: "rag", title: "RAG" },
  { src: "AI Engineering Prep/02_Prompt_Engineering_Interview_Prep.md", category: "ai-engineering", order: 3, slug: "prompt-engineering", title: "Prompt Engineering" },
  { src: "AI Engineering Prep/03_AI_Agents_Interview_Prep.md", category: "ai-engineering", order: 4, slug: "ai-agents", title: "AI Agents" },
  { src: "AI Engineering Prep/04_Fine_Tuning_Interview_Prep.md", category: "ai-engineering", order: 5, slug: "fine-tuning", title: "Fine-Tuning" },
  { src: "AI Engineering Prep/05_Inference_Optimization_Interview_Prep.md", category: "ai-engineering", order: 6, slug: "inference-optimization", title: "Inference Optimization" },
  { src: "AI Engineering Prep/06_Evaluation_Interview_Prep.md", category: "ai-engineering", order: 7, slug: "evaluation", title: "Evaluation" },
];

const CATEGORY_TITLES = {
  fundamentals: "CS Fundamentals",
  languages: "Programming Languages",
  "web-frameworks": "Web & App Frameworks",
  "ai-engineering": "AI Engineering",
};

/** Pulls the first "# Heading" line out as the doc title/description source,
 *  and strips it from the body so it isn't rendered twice (once by
 *  <DocsTitle>, once inside the MDX body). */
function extractTitleAndBody(raw) {
  const lines = raw.split("\n");
  let title = null;
  let bodyStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("# ")) {
      title = lines[i].replace(/^#\s+/, "").trim();
      bodyStartIndex = i + 1;
      break;
    }
  }

  // Clean up "X — Interview Preparation Guide" -> "X"
  const cleanTitle = title
    ? title.replace(/\s*[—-]\s*Interview Preparation Guide.*$/i, "").trim()
    : null;

  const body = lines.slice(bodyStartIndex).join("\n").trim();
  return { title: cleanTitle, body };
}

/** Grabs the first non-empty paragraph after the title as a description,
 *  trimmed to a reasonable length for <meta name="description">. */
function extractDescription(body) {
  const paragraph = body
    .split("\n\n")
    .map((p) => p.trim())
    .find((p) => p.length > 0 && !p.startsWith("#") && !p.startsWith("---"));

  if (!paragraph) return "";
  const clean = paragraph.replace(/\*\*/g, "").replace(/`/g, "");
  return clean.length > 180 ? clean.slice(0, 177) + "..." : clean;
}

function toFrontmatter(fields) {
  const escape = (s) => s.replace(/"/g, '\\"');
  return [
    "---",
    ...Object.entries(fields).map(([k, v]) => `${k}: "${escape(v)}"`),
    "---",
    "",
  ].join("\n");
}

function migrate() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    console.error("Set SOURCE_DIR=/path/to/your/md/files and re-run.");
    process.exit(1);
  }

  const byCategory = {};

  for (const entry of MANIFEST) {
    const srcPath = join(SOURCE_DIR, entry.src);
    if (!existsSync(srcPath)) {
      console.warn(`  skip (not found): ${entry.src}`);
      continue;
    }

    const raw = readFileSync(srcPath, "utf-8");
    const { title, body } = extractTitleAndBody(raw);
    const finalTitle = entry.title || title || entry.slug;
    const description = extractDescription(body);

    const frontmatter = toFrontmatter({
      title: finalTitle,
      description,
    });

    const outDir = join(DOCS_DIR, entry.category);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, `${entry.slug}.mdx`), frontmatter + body + "\n");

    byCategory[entry.category] ??= [];
    byCategory[entry.category].push(entry);

    console.log(`  wrote content/docs/${entry.category}/${entry.slug}.mdx`);
  }

  // Per-category meta.json controls sidebar title + page order.
  // "index" is listed first so the category's own overview page (below)
  // is the first thing shown/highlighted when you land on /docs/<category>.
  for (const [category, entries] of Object.entries(byCategory)) {
    entries.sort((a, b) => a.order - b.order);
    const meta = {
      title: CATEGORY_TITLES[category] || category,
      pages: ["index", ...entries.map((e) => e.slug)],
    };
    writeFileSync(
      join(DOCS_DIR, category, "meta.json"),
      JSON.stringify(meta, null, 2) + "\n",
    );
    console.log(`  wrote content/docs/${category}/meta.json`);

    // Category index page: this is what fixes /docs/<category> 404s —
    // without an index.mdx, that URL has no registered page at all,
    // since every other file in the folder lives one level deeper
    // (e.g. /docs/fundamentals/oop, not /docs/fundamentals itself).
    const indexBody = [
      `# ${CATEGORY_TITLES[category] || category}`,
      "",
      "Pick a guide below.",
      "",
      ...entries.map(
        (e) => `- [${e.title}](/docs/${category}/${e.slug})`,
      ),
      "",
    ].join("\n");

    const indexFrontmatter = toFrontmatter({
      title: CATEGORY_TITLES[category] || category,
      description: `All ${entries.length} guides in ${CATEGORY_TITLES[category] || category}.`,
    });

    writeFileSync(
      join(DOCS_DIR, category, "index.mdx"),
      indexFrontmatter + indexBody,
    );
    console.log(`  wrote content/docs/${category}/index.mdx`);
  }

  // Root meta.json orders the top-level category folders in the sidebar.
  const rootMeta = {
    title: "Interview Prep Library",
    pages: Object.keys(CATEGORY_TITLES).filter((c) => byCategory[c]),
  };
  writeFileSync(
    join(DOCS_DIR, "meta.json"),
    JSON.stringify(rootMeta, null, 2) + "\n",
  );

  console.log("\nDone. Run `npm run dev` to preview the site.");
}

migrate();
