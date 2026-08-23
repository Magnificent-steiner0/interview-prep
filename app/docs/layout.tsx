import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { DocsTopBar } from "@/components/docs-topbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Always visible — independent of sidebar collapse/mobile state,
          so there's never a dead end with no way back to the homepage. */}
      <DocsTopBar />
      <DocsLayout tree={source.pageTree} {...baseOptions}>
        {children}
      </DocsLayout>
    </>
  );
}