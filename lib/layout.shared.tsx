import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Options shared between the marketing layout ( app/(home) ) and the docs
 * layout ( app/docs ) so the top nav bar stays visually consistent
 * across the whole site.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "Interview Prep Library",
  },
  links: [
    {
      text: "Browse Docs",
      url: "/docs",
    },
    {
      text: "GitHub",
      url: "https://github.com/magnificent-steiner0/interview-prep",
      external: true,
    },
  ],
};
