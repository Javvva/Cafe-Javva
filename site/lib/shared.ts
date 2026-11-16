import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Cafe Javva';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'Javvva',
  repo: 'Cafe-Javva',
  branch: 'main',
  /** Where `content/docs` lives relative to the repo root. */
  contentDir: 'site/content/docs',
};

// Absolute site URL, used for Open Graph images and the sitemap. Vercel sets
// VERCEL_PROJECT_PRODUCTION_URL; NEXT_PUBLIC_SITE_URL overrides it.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
);

/** Anchor id used for a tool on the Tools page. */
export function toolAnchor(tool: string) {
  return `tool-${tool.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
