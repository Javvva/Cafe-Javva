'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ChallengeEntry } from '@/lib/challenges';
import { statusLabel, type Difficulty, type Status } from '@/lib/taxonomy';

interface CategoryOption {
  slug: string;
  title: string;
}

export function ChallengeFinderClient({
  challenges,
  categories,
  tools,
}: {
  challenges: ChallengeEntry[];
  categories: CategoryOption[];
  tools: string[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');
  const [tool, setTool] = useState('all');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return challenges.filter((challenge) => {
      if (category !== 'all' && challenge.category !== category) return false;
      if (difficulty !== 'all' && challenge.difficulty !== difficulty) return false;
      if (status !== 'all' && challenge.status !== status) return false;
      if (tool !== 'all' && !challenge.tools.some((item) => item.toLowerCase() === tool)) return false;
      if (!needle) return true;
      const haystack = [challenge.title, challenge.description, challenge.categoryTitle, ...challenge.tools]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [challenges, query, category, difficulty, status, tool]);

  return (
    <div className="not-prose">
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, tool, or keyword"
            className="rounded-md border bg-fd-background px-3 py-2"
          />
        </label>
        <Select label="Category" value={category} onChange={setCategory}>
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title}
            </option>
          ))}
        </Select>
        <Select label="Difficulty" value={difficulty} onChange={setDifficulty}>
          <option value="all">Any difficulty</option>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select label="Status" value={status} onChange={setStatus}>
          <option value="all">Any status</option>
          {(Object.keys(statusLabel) as Status[]).map((item) => (
            <option key={item} value={item}>
              {statusLabel[item]}
            </option>
          ))}
        </Select>
        <Select label="Tool" value={tool} onChange={setTool}>
          <option value="all">Any tool</option>
          {tools.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <p className="mb-4 text-sm text-fd-muted-foreground">
        {results.length} {results.length === 1 ? 'writeup' : 'writeups'}
      </p>
      {results.length === 0 ? (
        <p>No writeups match. Clear a filter, or add a page under the matching category folder.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((challenge) => (
            <li key={challenge.url}>
              <Link href={challenge.url} className="font-medium underline">
                {challenge.title}
              </Link>
              <p className="text-sm text-fd-muted-foreground">
                {[
                  challenge.season,
                  challenge.categoryTitle,
                  challenge.difficulty,
                  challenge.status ? statusLabel[challenge.status] : undefined,
                  challenge.tools.join(', ') || undefined,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {challenge.description ? <p className="mt-1 text-sm">{challenge.description}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border bg-fd-background px-3 py-2"
      >
        {children}
      </select>
    </label>
  );
}
