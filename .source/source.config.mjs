// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content/docs"
});
var source_config_default = defineConfig({
  mdxOptions: {
    // Add remark/rehype plugins here later if needed (e.g. remark-gfm is on by default).
  }
});
export {
  source_config_default as default,
  docs
};
