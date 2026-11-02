---
title: "Add a writeup"
description: "Where a new challenge page goes, and the frontmatter the finder reads."
---
Save the file as `site/content/docs/categories/<category>/<short-name>.md`.

Use one of these category folder names:

- `osint`
- `cryptography`
- `password-cracking`
- `network-traffic-analysis`
- `log-analysis`
- `forensics`
- `scanning-reconnaissance`
- `web-application-exploitation`
- `enumeration-exploitation`

Start the file with this frontmatter. `category` is what puts the page in the finder. Leave `difficulty` off when the challenge did not state one.

```yaml
title: Challenge name
description: One sentence on what you had to do.
category: password-cracking
difficulty: hard
status: partial
season: 2026 NCL Individual
points: 60 points
tools: [hashcat, python]
```

Then write, in this order: what the challenge asked, the commands that worked, what you ruled out, and the answer. Add the new filename (without `.md`) to that folder's `meta.json` so it shows in the sidebar.
