import { getChallenges, getToolIndex } from '@/lib/challenges';
import { categories } from '@/lib/taxonomy';
import { ChallengeFinderClient } from './challenge-finder-client';

export function ChallengeFinder() {
  const challenges = getChallenges();
  const tools = getToolIndex().map(({ tool }) => tool);

  return (
    <ChallengeFinderClient
      challenges={challenges}
      categories={categories.map((category) => ({ slug: category.slug, title: category.title }))}
      tools={tools}
    />
  );
}
