import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { siteUrl } from '@/lib/shared';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL('/', siteUrl).toString() },
    ...source.getPages().map((page) => ({ url: new URL(page.url, siteUrl).toString() })),
  ];
}
