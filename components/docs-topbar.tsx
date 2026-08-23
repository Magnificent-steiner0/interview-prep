import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Fumadocs' DocsLayout only shows a home-linking navbar on mobile
 * (its desktop title link lives inside the sidebar header itself, so it
 * disappears along with the sidebar when collapsed). This bar is rendered
 * as a sibling above <DocsLayout>, independent of sidebar state, so
 * there's always a way back to the homepage no matter what.
 */
export function DocsTopBar() {
  return (
    <div className="sticky top-0 z-40 flex h-10 items-center gap-1.5 border-b border-fd-border bg-fd-background/95 px-4 text-sm backdrop-blur supports-[backdrop-filter]:bg-fd-background/60">
      <Link
        href="/"
        className="flex items-center gap-1.5 font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      >
        <Home className="size-3.5" />
        Home
      </Link>
      <ChevronRight className="size-3.5 text-fd-muted-foreground/50" />
      <Link
        href="/docs"
        className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      >
        Docs
      </Link>
    </div>
  );
}
