import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Speeds up cold starts on Vercel for a content-heavy docs site.
  // experimental: {
  //   mdxRs: true,
  // },
};

export default withMDX(config);
