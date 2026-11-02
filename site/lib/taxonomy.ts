// Single source of truth for the NCL categories and difficulty levels used
// across the site. Category slugs match the folder names under
// `content/docs/categories/`.

export type CategorySlug =
  | 'osint'
  | 'cryptography'
  | 'password-cracking'
  | 'network-traffic-analysis'
  | 'log-analysis'
  | 'forensics'
  | 'scanning-reconnaissance'
  | 'web-application-exploitation'
  | 'enumeration-exploitation';

export interface Category {
  slug: CategorySlug;
  title: string;
  /** One-line summary shown on cards and category headers. */
  summary: string;
  /** Lucide icon name, rendered through the icon map in components. */
  icon: string;
}

export const categories: Category[] = [
  {
    slug: 'osint',
    title: 'Open Source Intelligence',
    summary: 'Find people, places, and infrastructure from public data and metadata.',
    icon: 'Search',
  },
  {
    slug: 'cryptography',
    title: 'Cryptography',
    summary: 'Recognize encodings, break classical ciphers, and attack weak crypto.',
    icon: 'KeyRound',
  },
  {
    slug: 'password-cracking',
    title: 'Password Cracking',
    summary: 'Identify hash types and recover plaintext with wordlists and rules.',
    icon: 'Lock',
  },
  {
    slug: 'network-traffic-analysis',
    title: 'Network Traffic Analysis',
    summary: 'Read packet captures, follow streams, and extract files and secrets.',
    icon: 'Network',
  },
  {
    slug: 'log-analysis',
    title: 'Log Analysis',
    summary: 'Parse and pivot through logs to reconstruct what happened.',
    icon: 'ScrollText',
  },
  {
    slug: 'forensics',
    title: 'Forensics',
    summary: 'Carve files, inspect memory, and recover hidden artifacts.',
    icon: 'Microscope',
  },
  {
    slug: 'scanning-reconnaissance',
    title: 'Scanning & Reconnaissance',
    summary: 'Map hosts, ports, and services and fingerprint what they run.',
    icon: 'Radar',
  },
  {
    slug: 'web-application-exploitation',
    title: 'Web Application Exploitation',
    summary: 'Probe web apps and APIs for auth, injection, and logic flaws.',
    icon: 'Globe',
  },
  {
    slug: 'enumeration-exploitation',
    title: 'Enumeration & Exploitation',
    summary: 'Enumerate a foothold, escalate privileges, and chain to a flag.',
    icon: 'Terminal',
  },
];

export const categoryBySlug: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
);

export type Difficulty = 'easy' | 'medium' | 'hard';

export const difficultyOrder: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export type Status = 'solved' | 'partial' | 'unsolved';

export const statusLabel: Record<Status, string> = {
  solved: 'Solved',
  partial: 'Partial',
  unsolved: 'Unsolved',
};
