# Interview Prep Library

A Next.js + [Fumadocs](https://fumadocs.dev) site for browsing the interview
prep guides: CS fundamentals, programming languages, web/app frameworks, and
AI engineering. Content lives as `.mdx` files under `content/docs/`, so
adding or editing a guide is just editing a markdown file — no database.

## Project structure

```
app/
  (home)/            marketing layout + landing page (/)
  docs/               docs layout (sidebar) + [[...slug]] catch-all page route
  api/search/         full-text search index endpoint (powers Cmd+K)
content/
  docs/
    fundamentals/      OOP, design patterns, APIs & HTTP, databases, ...
    languages/         C/C++, Dart, Java, Python, JavaScript
    web-frameworks/    FastAPI, Next.js, TypeScript, React, Flutter
    ai-engineering/    Embeddings, RAG, prompt engineering, agents, ...
    meta.json          top-level sidebar ordering (one per category folder too)
lib/
  source.ts            Fumadocs content loader (builds the page tree)
  categories.ts         category metadata used by the homepage cards
  layout.shared.tsx     shared top-nav config (home layout + docs layout)
  mdx-components.tsx    MDX component overrides
components/
  docs-topbar.tsx        persistent Home/Docs bar shown on every docs page
                          (Fumadocs' own home link lives inside the sidebar
                          header, so it disappears when the sidebar is
                          collapsed on desktop — this bar exists to avoid
                          that dead end; see note further down)
scripts/
  migrate-content.mjs          one-time importer: standalone .md -> content/docs/**/*.mdx
  fix-mdx-jsx-conflicts.mjs    finds/fixes prose like `Provider.of<T>` that MDX
                                 misreads as a JSX tag if left unescaped
.github/workflows/ci.yml       PR gate: content check, typecheck, lint, build
```

## Getting started

```bash
npm install        # also runs `fumadocs-mdx` via postinstall to generate .source/
npm run dev         # http://localhost:3000
```

### Re-running content migration

The migration script already ran once to produce everything under
`content/docs/`. You generally won't need to run it again — just edit the
`.mdx` files directly. If you're re-importing from a fresh export of the
original standalone `.md` files:

```bash
SOURCE_DIR=/path/to/your/md/files npm run migrate-content
node scripts/fix-mdx-jsx-conflicts.mjs   # auto-fix any unescaped <Generic<T>> prose
```

**Always run these two in that order.** `migrate-content` re-copies raw text
from the source `.md` files, which overwrites any previous backtick fixes —
`fix-mdx-jsx-conflicts` must run again immediately after, every time.
`npm run build` will fail loudly if you forget, so this isn't a silent
footgun, just an easy one to hit.

### Category index pages

Each category folder (`fundamentals/`, `languages/`, etc.) needs its own
`index.mdx` — without one, `/docs/<category>` (what the homepage cards link
to) has no page registered and 404s, since every other file in that folder
lives one level deeper (`/docs/fundamentals/oop`, not `/docs/fundamentals`
itself). `migrate-content.mjs` generates these automatically (a short
overview + a list of links to that category's guides) — if you add a new
category by hand, add its own `index.mdx` too.

### Adding a new guide

1. Drop a `.mdx` file into the right `content/docs/<category>/` folder with
   frontmatter:
   ```mdx
   ---
   title: "Rust"
   description: "One-line summary shown in search results and previews."
   ---
   Your content here.
   ```
2. Add its slug to that folder's `meta.json` `pages` array (controls sidebar
   order).
3. If it's a new top-level category, add it to `lib/categories.ts` (for the
   homepage cards) and to `content/docs/meta.json`.

### A note on MDX and generic types

MDX parses `<Word>` outside of code fences / inline code as an attempted
JSX tag. Prose like `Provider.of<T>(context)` written without backticks
will break the build. Always wrap inline generic-type syntax in backticks
(`` `Provider.of<T>(context)` ``) — `scripts/fix-mdx-jsx-conflicts.mjs`
catches and fixes this automatically, and CI runs it in `--check` mode so a
PR fails loudly instead of breaking the Vercel build silently.

### Why `components/docs-topbar.tsx` exists

Fumadocs' `DocsLayout` only renders a home-linking navbar on mobile — on
desktop, the site title/home link lives *inside the collapsible sidebar's
own header*. Collapse the sidebar and that link collapses with it, leaving
only a floating button that re-expands the sidebar (no way back to `/`
otherwise). `docs-topbar.tsx` is a small, always-visible bar rendered as a
sibling above `<DocsLayout>` in `app/docs/layout.tsx`, independent of
sidebar/mobile state, so there's always a way back to the homepage.

## Deploying to Vercel (CI/CD)

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo → framework preset
   `Next.js` is auto-detected → Deploy.
3. That's it for CD: every push to `main` deploys to production, every PR
   gets its own preview URL automatically.
4. The GitHub Actions workflow (`.github/workflows/ci.yml`) runs alongside
   Vercel's own build on every PR and push — it's the quality gate
   (content-safety check, `tsc --noEmit`, `next lint`, `next build`) that
   catches issues independent of Vercel's build, and you can require it to
   pass before merge in your branch protection settings.

No environment variables are required for the current (static content)
version of the site.

## Roadmap: personalization (notes, highlights, saved pages, drawer)

Deliberately not built yet, but the architecture is laid out for it:

- **Auth**: add Clerk or Auth.js. Wrap the docs layout (or a client
  component within it) with the session provider.
- **Database**: Postgres via Neon or Supabase (both integrate natively with
  Vercel). Suggested schema:
  ```
  User        (id, email, ...)
  Note        (id, userId, pageSlug, headingAnchor?, content, createdAt)
  Highlight   (id, userId, pageSlug, textSelector, color, createdAt)
  SavedPage   (id, userId, pageSlug, createdAt)
  ```
- **ORM**: Drizzle or Prisma against the same Postgres instance.
- **API routes**: `app/api/notes/route.ts`, `app/api/highlights/route.ts`,
  etc. — keep these as regular Next.js Route Handlers, fetched client-side
  from a drawer component so the underlying `/docs/**` pages stay
  statically generated (fast, cacheable) and only the personalization layer
  is dynamic.
- **Highlighting**: anchor highlights to text ranges with the browser's
  `CSS Custom Highlight API` (or the `rangy` library as a fallback for
  wider browser support) — this is the fiddliest part, worth scoping as
  its own milestone.
- **Drawer UI**: a client component (e.g. `components/notes-drawer.tsx`)
  mounted once in `app/docs/layout.tsx`, toggled from the top nav, reading
  `page.data.title`/slug from the current route via `usePathname()`.