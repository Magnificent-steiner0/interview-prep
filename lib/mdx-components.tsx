import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

/**
 * Central place to customize how markdown renders across every doc page —
 * e.g. swap in a custom <table>, add shortcodes like <Callout>, or wire up
 * a "copy code" button. Starts with Fumadocs' sensible defaults.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
  };
}
