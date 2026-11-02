import { getChallenges } from '@/lib/challenges';
import { categories } from '@/lib/taxonomy';
import { ChallengeFinderClient } from './challenge-finder-client';

export function ChallengeFinder() {
  const challenges = getChallenges();
  const tools = [...new Set(challenges.flatMap((challenge) => challenge.tools.map((tool) => tool.toLowerCase())))].sort();

  return (
    <ChallengeFinderClient
      challenges={challenges}
      categories={categories.map((category) => ({ slug: category.slug, title: category.title }))}
      tools={tools}
    />
  );
}
