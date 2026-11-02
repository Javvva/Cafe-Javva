import { source } from './source';
import {
  categoryBySlug,
  difficultyOrder,
  type Difficulty,
  type Status,
} from './taxonomy';

export interface ChallengeEntry {
  url: string;
  title: string;
  description?: string;
  category?: string;
  categoryTitle?: string;
  difficulty?: Difficulty;
  tools: string[];
  season?: string;
  points?: string;
  status?: Status;
}

// A page counts as a challenge writeup when it declares a `category` in its
// frontmatter. Category landing pages and guides leave it unset.
export function getChallenges(): ChallengeEntry[] {
  const entries: ChallengeEntry[] = [];

  for (const page of source.getPages()) {
    const data = page.data as {
      title: string;
      description?: string;
      category?: string;
      difficulty?: Difficulty;
      tools?: string[];
      season?: string;
      points?: string;
      status?: Status;
    };

    if (!data.category) continue;

    entries.push({
      url: page.url,
      title: data.title,
      description: data.description,
      category: data.category,
      categoryTitle: categoryBySlug[data.category]?.title,
      difficulty: data.difficulty,
      tools: data.tools ?? [],
      season: data.season,
      points: data.points,
      status: data.status,
    });
  }

  entries.sort((a, b) => {
    const da = a.difficulty ? difficultyOrder[a.difficulty] : -1;
    const db = b.difficulty ? difficultyOrder[b.difficulty] : -1;
    if (da !== db) return da - db;
    return a.title.localeCompare(b.title);
  });

  return entries;
}

export function getChallengesByCategory(slug: string): ChallengeEntry[] {
  return getChallenges().filter((c) => c.category === slug);
}

// Map of tool name -> challenges that used it, for the Tools index.
export function getToolIndex(): { tool: string; challenges: ChallengeEntry[] }[] {
  const map = new Map<string, ChallengeEntry[]>();

  for (const challenge of getChallenges()) {
    for (const tool of challenge.tools) {
      const key = tool.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(challenge);
    }
  }

  return [...map.entries()]
    .map(([tool, challenges]) => ({ tool, challenges }))
    .sort((a, b) => a.tool.localeCompare(b.tool));
}
