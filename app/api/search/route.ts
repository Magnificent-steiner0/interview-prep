import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// Builds a static search index from every page's title/description/content
// at build time, served from this route for the Cmd+K search dialog.
export const { GET } = createFromSource(source);
