import { defineDocs, defineConfig } from "fumadocs-mdx/config";

// Defines the `docs` collection: every .mdx file under content/docs
// becomes a page, every meta.json controls folder ordering/titles in the sidebar.
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    // Add remark/rehype plugins here later if needed (e.g. remark-gfm is on by default).
  },
});
