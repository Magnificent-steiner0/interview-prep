import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";

// `loader()` turns the content/docs file tree + meta.json files into:
//  - a page tree for the sidebar (source.pageTree)
//  - per-page lookups (source.getPage(slug), source.generateParams())
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
