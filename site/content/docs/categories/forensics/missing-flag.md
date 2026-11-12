---
title: "Missing Flag (Medium)"
description: "Get a shell as Bart, collect the four file pieces, and XOR them back together."
category: "forensics"
difficulty: "medium"
status: "solved"
season: "2026 NCL Team"
points: "100 points"
tools: ["linux"]
---

Cyber Command, team game. The scored answers were stored as images in the original notes. The steps below are the written method.

Bart left an access key on the system. The original 14-byte file was split into four pieces. One piece is in his home directory, and the merge tool is on the box.

| Question | Points | Ask |
| --- | ---: | --- |
| Q1 | 25 | What program gives you access to his account without knowing his password? |
| Q2 | 25 | What is the name of the script that recombines the four files? |
| Q3 | 20 | What mathematical operation combines the four files? |
| Q4 | 30 | What flag is hidden here? |

1. `/home` lists `bart`, `kali`, and `user`. You cannot enter `kali`.
2. `sudo` does not help. Look in `/bin`.
3. `bartbash` is the backdoor. Run it as `/usr/bin/bartbash -p`.
4. As Bart, open his directory. The `pennant` file is one fragment of the original file.
5. `mergebytes.py` is the combiner. Reading it shows the pieces are combined with XOR.
