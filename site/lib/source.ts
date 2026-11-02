import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

// Extra frontmatter fields every challenge writeup can declare. These power the
// difficulty badges, the Challenge Finder filters, and the Tools index.
const challengeSchema = pageSchema.extend({
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tools: z.array(z.string()).optional(),
  season: z.string().optional(),
  points: z.string().optional(),
  status: z.enum(['solved', 'partial', 'unsolved']).optional(),
});

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: challengeSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
