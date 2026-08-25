import "./global.css";
import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: {
    default: "Interview Prep Library",
    template: "%s | Interview Prep Library",
  },
  description:
    "A structured, in-depth interview preparation library covering CS fundamentals, languages, web frameworks, and AI engineering.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* RootProvider wires up theming (light/dark), search dialog state,
            and other Fumadocs UI context used by every page below. */}
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
