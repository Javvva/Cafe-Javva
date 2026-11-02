---
title: "Team habits"
description: "How to split challenges, record evidence, and spend attempts."
---
### Keep one shared record per challenge

Record the exact title, question text, point values, remaining attempts, supplied files, endpoint, current machine, and user identity. Save original files separately from generated wordlists and scripts. Keep each experiment with the hypothesis, command or payload, output, conclusion, and coverage limit. Do not paste a Birdwatchers handoff into Intercept without clearly separating it.

### Assign ownership and verification

Use one owner for each active challenge and a second person for a short review of a breakthrough or expensive run. For password work, candidate design and coverage checking are useful separate responsibilities. For web work, one person can trace browser behavior while another reads source and request schemas. For binary or crypto work, preserve a minimal reproducible test before attempting the final chain.

Before a submission, the reviewer should be able to identify its evidence: an exact flag in output, a verified plaintext/hash pair, or an accepted prior answer. A hypothesis such as “probably localhost-only” is useful for selecting a test, but unsuitable as a confirmed answer.

### Use time and attempts deliberately

Start with cheap, informative tests. An empty hash file, missing routing header, wrong working host, or literal placeholder can be diagnosed in seconds. Large cracking jobs should have a reasoned candidate space, a positive control, a checkpoint, and a useful stopping point. A long-running job can continue when it has a defined purpose, but elapsed time is not evidence that the underlying hypothesis is sound.

When a test fails, state what it actually rules out. A 403 rules out that request as a successful bypass. An exhausted candidate file rules out its contents. A synthetic solver success validates a model on synthetic data. None independently proves the entire challenge impossible or solved.

### Recommended rehearsal sequence

These are suggested drills based on the recovered work, not tasks already completed in this report.

| Session | Exercise | Completion standard |
|---|---|---|
| 1, about 45 minutes | Bad Weather and encoding recognition | Reproduce the three case changes and explain each decoding hypothesis |
| 2, about 45 minutes | Encrypted-file pipeline and a small hash search | Identify files, extract nonempty data, recover and verify a practice password |
| 3, about 60 minutes | Scanner and Hercules permission chains | Explain the socket/token/interpreter chain and the exact wrapper argument |
| 4, about 60 minutes | API and Cookie Security Protocol walkthroughs | Reconstruct each request transition and state what every trace proves |
| 5, about 75 minutes | Signal Drift review | Explain the encoder, bounds flaw, byte leak, ASLR problem, and final chain |
| 6, about 60 minutes | Intercept, Birdwatchers, and DMZ postmortem | Identify assumptions, coverage gaps, and one discriminating next test per case |
| 7, about 60 minutes | Team mock handoff | Another teammate reproduces your finding using only your saved notes |

Prioritize understanding the completed chains first. Then use the unresolved cases to practice rejecting weak assumptions and designing better experiments.
