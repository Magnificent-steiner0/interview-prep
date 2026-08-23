#!/usr/bin/env node
/**
 * MDX treats `<Word>` outside of fenced code blocks / inline code spans as
 * an attempted JSX tag, which breaks the build whenever prose contains
 * generic-type syntax like "Provider.of<T>(context)" written without
 * backticks. This scans every .mdx file, skips fenced code blocks and
 * existing inline-code spans, and wraps any remaining risky
 * `word<Word...>` token in backticks so it renders as literal text.
 *
 * Run with --check to only report issues (used in CI), or without a flag
 * to auto-fix and rewrite files in place.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, "..", "content", "docs");
const CHECK_ONLY = process.argv.includes("--check");

// Matches something like `List<String>`, `Provider.of<T>`, `Box<T>` etc,
// i.e. a word immediately followed by `<...>` where the angle brackets
// contain no spaces (a strong signal it's a generic type, not real JSX).
const GENERIC_PATTERN = /\b([A-Za-z_][\w.]*<[^<>\s]+>)/g;

function findMdxFiles(dir) {
  return globSync("**/*.mdx", { cwd: dir }).map((f) => join(dir, f));
}

function processFile(path) {
  const original = readFileSync(path, "utf-8");
  const lines = original.split("\n");
  let inFence = false;
  let changed = false;
  const issues = [];

  const fixedLines = lines.map((line, idx) => {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;

    // Walk the line char-by-char, skipping over inline `code spans` so we
    // don't double-wrap something already protected by backticks.
    let result = "";
    let i = 0;
    let inInlineCode = false;

    while (i < line.length) {
      if (line[i] === "`") {
        inInlineCode = !inInlineCode;
        result += line[i];
        i++;
        continue;
      }
      if (inInlineCode) {
        result += line[i];
        i++;
        continue;
      }

      const rest = line.slice(i);
      const match = rest.match(GENERIC_PATTERN);
      if (match && rest.indexOf(match[0]) === 0) {
        result += "`" + match[0] + "`";
        i += match[0].length;
        changed = true;
        issues.push({ line: idx + 1, token: match[0] });
        continue;
      }

      result += line[i];
      i++;
    }

    return result;
  });

  if (changed) {
    if (!CHECK_ONLY) {
      writeFileSync(path, fixedLines.join("\n"));
    }
    console.log(`${CHECK_ONLY ? "[would fix]" : "[fixed]"} ${path}`);
    for (const issue of issues) {
      console.log(`    line ${issue.line}: ${issue.token}`);
    }
  }

  return issues.length;
}

const files = findMdxFiles(DOCS_DIR);
let totalIssues = 0;
for (const file of files) {
  totalIssues += processFile(file);
}

console.log(
  `\n${totalIssues} risky token(s) found across ${files.length} files.`,
);
if (CHECK_ONLY && totalIssues > 0) {
  process.exit(1);
}
