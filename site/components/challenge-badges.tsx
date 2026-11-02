import Link from 'next/link';
import { categoryBySlug, statusLabel, type Difficulty, type Status } from '@/lib/taxonomy';

export function ChallengeBadges({
  category,
  difficulty,
  status,
  tools,
  season,
  points,
}: {
  category?: string;
  difficulty?: Difficulty;
  status?: Status;
  tools?: string[];
  season?: string;
  points?: string;
}) {
  if (!category && !difficulty && !status && !season && !points && !tools?.length) {
    return null;
  }

  const categoryTitle = category ? categoryBySlug[category]?.title : undefined;

  return (
    <p className="mt-3 mb-0 flex flex-wrap gap-2 text-sm text-fd-muted-foreground">
      {categoryTitle ? (
        <Link href={`/docs/categories/${category}`} className="underline">
          {categoryTitle}
        </Link>
      ) : null}
      {difficulty ? <span>Difficulty: {difficulty}</span> : null}
      {status ? <span>Status: {statusLabel[status]}</span> : null}
      {season ? <span>{season}</span> : null}
      {points ? <span>{points}</span> : null}
      {tools?.map((tool) => (
        <Link key={tool} href={`/docs/tools#tool-${slugify(tool)}`} className="underline">
          {tool}
        </Link>
      ))}
    </p>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
