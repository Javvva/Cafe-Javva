import Link from 'next/link';
import { getChallengesByCategory } from '@/lib/challenges';
import { statusLabel } from '@/lib/taxonomy';

export function CategoryChallenges({ slug }: { slug: string }) {
  const challenges = getChallengesByCategory(slug);

  if (challenges.length === 0) {
    return (
      <p>
        No writeups in this category yet. Add a Markdown file under{' '}
        <code>site/content/docs/categories/{slug}/</code>. See{' '}
        <Link href="/docs/getting-started/add-a-writeup">Add a writeup</Link>.
      </p>
    );
  }

  return (
    <ul>
      {challenges.map((challenge) => (
        <li key={challenge.url}>
          <Link href={challenge.url}>{challenge.title}</Link>
          {challenge.difficulty ? ` · ${challenge.difficulty}` : ''}
          {challenge.status ? ` · ${statusLabel[challenge.status]}` : ''}
          {challenge.description ? <p>{challenge.description}</p> : null}
        </li>
      ))}
    </ul>
  );
}
