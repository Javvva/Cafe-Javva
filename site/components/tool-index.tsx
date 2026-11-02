import Link from 'next/link';
import { getToolIndex } from '@/lib/challenges';

export function ToolIndex() {
  const tools = getToolIndex();

  if (tools.length === 0) {
    return <p>No tools listed yet. Add a <code>tools</code> list to a writeup&apos;s frontmatter.</p>;
  }

  return (
    <div>
      {tools.map(({ tool, challenges }) => (
        <section key={tool} id={`tool-${tool.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>
          <h2>{tool}</h2>
          <ul>
            {challenges.map((challenge) => (
              <li key={challenge.url}>
                <Link href={challenge.url}>{challenge.title}</Link>
                {challenge.categoryTitle ? ` · ${challenge.categoryTitle}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
