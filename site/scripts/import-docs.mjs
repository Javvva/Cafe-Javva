import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const docsDir = path.join(root, 'Docs');
const content = path.join(root, 'site/content/docs');

const study = fs.readFileSync(path.join(docsDir, 'NCL_Team_Competition_Study_Report'), 'utf8');
const quick = fs.readFileSync(path.join(docsDir, 'NCL_Quick_Reference.md'), 'utf8');
const hard = fs.readFileSync(path.join(docsDir, 'Birdwatchers_Hard_REPORT.md'), 'utf8');
const fall = fs.readFileSync(
  path.join(docsDir, 'NCL Fall 2026 — Birdwatchers & DMZ Challenge Reports.md'),
  'utf8',
);

function between(source, start, end) {
  const from = source.indexOf(start);
  if (from < 0) throw new Error(`Missing heading: ${start}`);
  const bodyStart = from + start.length;
  const to = end ? source.indexOf(end, bodyStart) : -1;
  return source.slice(bodyStart, to < 0 ? undefined : to).trim() + '\n';
}

function stripTitle(markdown) {
  return markdown.replace(/^#[^\n]*\n+/, '');
}

function yaml(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((item) => JSON.stringify(item)).join(', ')}]`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

function write(rel, fields, body) {
  const file = path.join(content, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, yaml(fields) + body.replace(/^\n+/, ''));
}

const season = '2026 NCL Individual';

const sections = [
  {
    file: 'categories/password-cracking/encrypted-files.md',
    start: '## 1 Encrypted files and password extraction',
    end: '## 2 ',
    fields: {
      title: 'Encrypted files and password extraction',
      description: 'Identify Ansible Vault, PuTTY, and 7-Zip files and confirm extraction before cracking.',
      category: 'password-cracking',
      status: 'unsolved',
      season,
      tools: ['john', '7z', 'file'],
    },
  },
  {
    file: 'categories/cryptography/bad-weather.md',
    start: '## 2 In Case of Bad Weather',
    end: '## 3 ',
    fields: {
      title: 'In Case of Bad Weather',
      description: 'Turn the clue sheet into a Collatz case-toggle and check it against the Yescrypt hashes.',
      category: 'cryptography',
      status: 'solved',
      season,
      tools: ['john', 'python'],
    },
  },
  {
    file: 'categories/cryptography/encoded-code-words.md',
    start: '## 3 Encoded code words',
    end: '## 4 ',
    fields: {
      title: 'Encoded code words',
      description: 'Recognize the encoding in the recovered screenshot. The original answer reply was not in the archive.',
      category: 'cryptography',
      status: 'partial',
      season,
    },
  },
  {
    file: 'categories/enumeration-exploitation/nasl-scanner.md',
    start: '## 4 NASL scanner and protected KB daemon',
    end: '## 5 ',
    fields: {
      title: 'NASL scanner and protected KB daemon',
      description: 'Read a protected socket path out of a debug log, then query it with the SUID NASL interpreter.',
      category: 'enumeration-exploitation',
      status: 'partial',
      season,
      tools: ['linux', 'nasl'],
    },
  },
  {
    file: 'categories/enumeration-exploitation/signal-drift.md',
    start: '## 5 Signal Drift',
    end: '## 6 ',
    fields: {
      title: 'Signal Drift',
      description: 'Follow the binary from a bounds bug to a confirmed flag, and note the mistakes worth repeating less.',
      category: 'enumeration-exploitation',
      status: 'solved',
      season,
      tools: ['gdb', 'python'],
    },
  },
  {
    file: 'categories/enumeration-exploitation/hercules.md',
    start: '## 6 Hercules compliance scanner',
    end: '## 7 ',
    fields: {
      title: 'Hercules compliance scanner',
      description: 'Read the sudo wrapper and call the branch it actually allows.',
      category: 'enumeration-exploitation',
      status: 'partial',
      season,
      tools: ['sudo', 'linux'],
    },
  },
  {
    file: 'categories/web-application-exploitation/you-have-been-pwned.md',
    start: '## 7 You Have Been Pwned',
    end: '## 8 ',
    fields: {
      title: 'You Have Been Pwned',
      description: 'Follow the frontend to the versioned API, then the disclosed token into the vault.',
      category: 'web-application-exploitation',
      status: 'solved',
      season,
      tools: ['curl'],
    },
  },
  {
    file: 'categories/web-application-exploitation/cookie-security-protocol.md',
    start: '## 8 Cookie Security Protocol',
    end: '## 9 ',
    fields: {
      title: 'Cookie Security Protocol',
      description: 'Chain an open redirect, a stored HTML injection, and a dangling iframe to capture the admin token.',
      category: 'web-application-exploitation',
      status: 'solved',
      season,
      tools: ['curl', 'browser'],
    },
  },
  {
    file: 'categories/cryptography/intercept.md',
    start: '## 9 Intercept and the LFSR cipher',
    end: '## 10 ',
    fields: {
      title: 'Intercept and the LFSR cipher',
      description: 'Separate the LFSR answer, the frame model, and the still-missing SECURE plaintext.',
      category: 'cryptography',
      status: 'partial',
      season,
      tools: ['python'],
    },
  },
  {
    file: 'getting-started/kali-wsl.md',
    start: '## 12 Kali WSL and Win-KeX setup',
    end: '## Individual chat reviews',
    fields: {
      title: 'Kali, WSL, and Win-KeX',
      description: 'Which machine each command ran on, and how the cracking box was set up.',
    },
  },
];

for (const section of sections) {
  write(section.file, section.fields, between(study, section.start, section.end));
}

write(
  'categories/password-cracking/birdwatchers.md',
  {
    title: 'Birdwatchers (Hard)',
    description: 'Decrypt the leaked auth capture, then crack SHA-512-crypt hashes with a scientific-name wordlist.',
    category: 'password-cracking',
    difficulty: 'hard',
    status: 'partial',
    season,
    points: '60 points, 3 of 5 recovered',
    tools: ['tshark', 'hashcat', 'john', 'openssl', 'python'],
  },
  stripTitle(hard),
);

write(
  'categories/scanning-reconnaissance/dmz.md',
  {
    title: 'DMZ (Hard)',
    description: 'Beat the source-port filter, fingerprint Caddy, then follow the header that leaks the SSH credential.',
    category: 'scanning-reconnaissance',
    difficulty: 'hard',
    status: 'solved',
    season,
    points: '100 points',
    tools: ['nmap', 'curl', 'ssh'],
  },
  between(fall, '## Challenge 2 — DMZ (Hard): Network Enumeration', null),
);

write(
  'cheatsheets/quick-reference.md',
  {
    title: 'NCL quick reference',
    description: 'Commands, first checks, and the reasoning chains to remember before a team game.',
  },
  stripTitle(quick),
);

write(
  'getting-started/how-to-use-these-notes.md',
  {
    title: 'How to use these notes',
    description: 'What the October 2026 study pack is, and the order to read it in.',
  },
  between(study, '## How to use this report', '## Challenge overview'),
);

write(
  'getting-started/challenge-overview.md',
  {
    title: 'Challenge overview',
    description: 'What the recovered October 2026 record actually establishes for each challenge.',
  },
  between(study, '## Challenge overview', '## 1 '),
);

write(
  'reference/chat-reviews.md',
  {
    title: 'Individual chat reviews',
    description: 'What each recovered chat contains, and where the gaps are.',
  },
  between(study, '## Individual chat reviews', '## Changes to make for the team competition'),
);

write(
  'getting-started/team-habits.md',
  {
    title: 'Team habits',
    description: 'How to split challenges, record evidence, and spend attempts.',
  },
  between(study, '## Changes to make for the team competition', '## Gaps to preserve'),
);

write(
  'getting-started/gaps.md',
  {
    title: 'Gaps to preserve',
    description: 'Facts the recovered archive does not contain, so later notes do not invent them.',
  },
  between(study, '## Gaps to preserve in future notes', null),
);

const categories = [
  ['osint', 'Open Source Intelligence', 'Search', 'Find people, places, and infrastructure from public data and metadata.'],
  ['cryptography', 'Cryptography', 'KeyRound', 'Recognize encodings, break classical ciphers, and attack weak crypto.'],
  ['password-cracking', 'Password Cracking', 'Lock', 'Identify hash types and recover plaintext with wordlists and rules.'],
  ['network-traffic-analysis', 'Network Traffic Analysis', 'Network', 'Read packet captures, follow streams, and extract files and secrets.'],
  ['log-analysis', 'Log Analysis', 'ScrollText', 'Parse and pivot through logs to reconstruct what happened.'],
  ['forensics', 'Forensics', 'Microscope', 'Carve files, inspect memory, and recover hidden artifacts.'],
  ['scanning-reconnaissance', 'Scanning & Reconnaissance', 'Radar', 'Map hosts, ports, and services and fingerprint what they run.'],
  ['web-application-exploitation', 'Web Application Exploitation', 'Globe', 'Probe web apps and APIs for auth, injection, and logic flaws.'],
  ['enumeration-exploitation', 'Enumeration & Exploitation', 'Terminal', 'Enumerate a foothold, escalate privileges, and chain to a flag.'],
];

for (const [slug, title, icon, summary] of categories) {
  const dir = path.join(content, 'categories', slug);
  const pages = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((name) => name.endsWith('.md')).map((name) => name.replace(/\.md$/, '')).sort()
    : [];
  write(
    `categories/${slug}/index.mdx`,
    { title, description: summary, icon },
    `${summary}\n\n<CategoryChallenges slug="${slug}" />\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'meta.json'),
    JSON.stringify({ title, icon, pages: ['index', ...pages] }, null, 2) + '\n',
  );
}

fs.writeFileSync(
  path.join(content, 'categories/meta.json'),
  JSON.stringify({
    title: 'Categories',
    pages: categories.map(([slug]) => slug),
  }, null, 2) + '\n',
);

write(
  'index.mdx',
  {
    title: 'Cafe Javva docs',
    description: 'NCL writeups and command notes for the Marymount Cyber Club.',
    icon: 'Coffee',
  },
  `The first writeups are from the 2026 NCL individual competition: the challenges that were a bit harder. Later competitions can be added the same way, so this stays a club notebook rather than one person's notes.

<Cards>
  <Card title="Find a challenge" href="/docs/finder" description="Filter by category, difficulty, status, or tool." />
  <Card title="Quick reference" href="/docs/cheatsheets/quick-reference" description="First checks and commands to keep open during a game." />
  <Card title="Add a writeup" href="/docs/getting-started/add-a-writeup" description="The file and frontmatter to copy for the next challenge." />
</Cards>
`,
);

write(
  'finder.mdx',
  {
    title: 'Challenge finder',
    description: 'Filter every writeup by category, difficulty, status, and tool.',
    icon: 'ListFilter',
    full: true,
  },
  '<ChallengeFinder />\n',
);

write(
  'tools.mdx',
  {
    title: 'Tools',
    description: 'Tools named on a writeup, and the challenges that used them.',
    icon: 'Wrench',
  },
  '<ToolIndex />\n',
);

write(
  'getting-started/add-a-writeup.md',
  {
    title: 'Add a writeup',
    description: 'Where a new challenge page goes, and the frontmatter the finder reads.',
  },
  `Save the file as \`site/content/docs/categories/<category>/<short-name>.md\`.

Use one of these category folder names:

- \`osint\`
- \`cryptography\`
- \`password-cracking\`
- \`network-traffic-analysis\`
- \`log-analysis\`
- \`forensics\`
- \`scanning-reconnaissance\`
- \`web-application-exploitation\`
- \`enumeration-exploitation\`

Start the file with this frontmatter. \`category\` is what puts the page in the finder. Leave \`difficulty\` off when the challenge did not state one.

\`\`\`yaml
title: Challenge name
description: One sentence on what you had to do.
category: password-cracking
difficulty: hard
status: partial
season: 2026 NCL Individual
points: 60 points
tools: [hashcat, python]
\`\`\`

Then write, in this order: what the challenge asked, the commands that worked, what you ruled out, and the answer. Add the new filename (without \`.md\`) to that folder's \`meta.json\` so it shows in the sidebar.
`,
);

write(
  'getting-started/index.mdx',
  {
    title: 'Getting started',
    description: 'How to read a writeup and what to set up before a game.',
    icon: 'BookOpen',
  },
  `Read a challenge page for the commands. Use the quick reference when you only need the check to run first.

<Cards>
  <Card title="How to use these notes" href="/docs/getting-started/how-to-use-these-notes" />
  <Card title="Challenge overview" href="/docs/getting-started/challenge-overview" />
  <Card title="Team habits" href="/docs/getting-started/team-habits" />
  <Card title="Kali, WSL, and Win-KeX" href="/docs/getting-started/kali-wsl" />
  <Card title="Add a writeup" href="/docs/getting-started/add-a-writeup" />
</Cards>
`,
);

write(
  'cheatsheets/index.mdx',
  {
    title: 'Cheatsheets',
    description: 'Short command notes to keep open during a game.',
    icon: 'ClipboardList',
  },
  `<Cards>
  <Card title="NCL quick reference" href="/docs/cheatsheets/quick-reference" description="First checks, commands, and reasoning chains from the October games." />
</Cards>
`,
);

write(
  'reference/index.mdx',
  {
    title: 'Source notes',
    description: 'The recovered chat reviews behind the challenge pages.',
    icon: 'Library',
  },
  `<Cards>
  <Card title="Individual chat reviews" href="/docs/reference/chat-reviews" />
  <Card title="Gaps to preserve" href="/docs/getting-started/gaps" />
</Cards>
`,
);

function meta(dir, data) {
  fs.mkdirSync(path.join(content, dir), { recursive: true });
  fs.writeFileSync(path.join(content, dir, 'meta.json'), JSON.stringify(data, null, 2) + '\n');
}

meta('getting-started', {
  title: 'Getting started',
  icon: 'BookOpen',
  pages: ['index', 'how-to-use-these-notes', 'challenge-overview', 'team-habits', 'gaps', 'kali-wsl', 'add-a-writeup'],
});
meta('cheatsheets', {
  title: 'Cheatsheets',
  icon: 'ClipboardList',
  pages: ['index', 'quick-reference'],
});
meta('reference', {
  title: 'Source notes',
  icon: 'Library',
  pages: ['index', 'chat-reviews'],
});
meta('.', {
  title: 'Cafe Javva',
  pages: [
    'index',
    'getting-started',
    'finder',
    'tools',
    '---Categories---',
    'categories',
    '---Reference---',
    'cheatsheets',
    'reference',
  ],
});

console.log('imported docs into site/content/docs');
