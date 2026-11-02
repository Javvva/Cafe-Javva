---
title: "In Case of Bad Weather"
description: "Turn the clue sheet into a Collatz case-toggle and check it against the Yescrypt hashes."
category: "cryptography"
status: "solved"
season: "2026 NCL Individual"
tools: ["john", "python"]
---
Source: C13, **Password Cracking Guide**, with the recovered password sheet and three .shadow files.

### Objective

Recover Jamie Pendergast's password for dev2, dev6, and web1, then identify the conjecture used to adjust them. The challenge said the written password did not work, Jamie liked mathematics, and the passwords excluded certain ambiguous characters. The supplied sheet contained:

```text
dev2:It3granckug;
dev6:tiHiWrin#in5
web1:ImNif.abEip3
also web2-web5

Reminder:
hail
6
case
```

### What we tried first

We treated the `$y$` hashes as a general Yescrypt cracking problem. John loaded two differently salted hashes, used 12 OpenMP threads, and tested a top-10,000-word list in about 52 seconds. The terminal showed roughly 191 candidate passwords per second and zero recovered passwords. GPU setup discussion consumed additional attention before the clue sheet changed the approach.

The useful distinction was between hardware visibility, a tool's available backend, and support for a particular hash algorithm. Seeing an RTX 5080 in WSL did not itself establish that the active Yescrypt job used it. The recovered run was a CPU job; this report makes no claim about every current tool's Yescrypt capabilities.

### Successful reasoning

“Hail” suggested the hailstone sequence, another name associated with the Collatz process. “6” supplied the starting value, and “case” specified the operation. Starting at 6 gives:

```text
6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1
```

Use these as **1-based character positions**. Toggle letter case at each in-range position. Leave digits and punctuation unchanged. Position 16 lies beyond these passwords and is skipped.

| Question | Original text | Recorded answer |
|---|---|---|
| Q1 dev2 | `It3granckug;` | `iT3GRAnCkUg;` |
| Q2 dev6 | `tiHiWrin#in5` | `TIhIwRiN#In5` |
| Q3 web1 | `ImNif.abEip3` | `iMnIF.aBEIp3` |
| Q4 conjecture | hailstone clue | Collatz conjecture |

The historical assistant reported independently checking all three answers against the supplied Yescrypt hashes. The accessible record preserves the answers and transformation, but not that execution trace or a final scoreboard confirmation. The transformation can be reproduced directly:

```python
positions = [6, 3, 10, 5, 16, 8, 4, 2, 1]
passwords = {
    'dev2': 'It3granckug;',
    'dev6': 'tiHiWrin#in5',
    'web1': 'ImNif.abEip3',
}
for account, original in passwords.items():
    chars = list(original)
    for position in positions:
        if 1 <= position <= len(chars):
            chars[position - 1] = chars[position - 1].swapcase()
    print(account, ''.join(chars))
```

**Why it worked:** The hash was a verifier. The clue sheet supplied the candidate-generation rule. We reduced the search from millions of guesses to three deterministic candidates.

**Team practice:** Explain the solution from the sheet alone, then reproduce the three outputs. Watch for 1-based versus 0-based positions, exact case, and preserved punctuation.
