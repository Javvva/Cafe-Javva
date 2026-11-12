---
title: "S4uc3d 4nd Expos3d (Easy)"
description: "Turn chat clues and a leetspeak substitution file into four exact passwords."
category: "password-cracking"
difficulty: "easy"
status: "solved"
season: "2026 NCL Individual"
points: "60 points"
tools: ["python", "hashcat"]
---
> **Challenge:** S4uc3d 4nd Expos3d  
> **Event:** National Cyber League (NCL)  
> **Category:** Password cracking / cryptography  
> **Difficulty:** Easy  
> **Points:** 60 total (15 points per question)  
> **Status:** Solved — all four answers verified by MD5 recomputation  
> **Evidence basis:** Challenge screenshot, solver's post-run summary, and independent MD5 recomputation for this report  
> **Report date:** November 6, 2026

---

## 1. Challenge overview

The challenge presents a fictional underground food-critic group, **The Palate**. The players receive four hexadecimal password hashes alongside hints from a purported private chat log. They are also given `substitutions.json`, a file describing the leetspeak (`l33t`) character substitutions the group uses when selecting passwords.

The objective is to recover the **exact, case-sensitive plaintext password** for each of four members. Each answer is worth **15 points**, for **60 points** total.

**Outcome:** All four passwords were recovered by the solver, reported as verified independently by `verify.py` and `md5sum`, and *also* verified anew with Python's `hashlib.md5` when preparing this report.

## 2. Challenge description and objectives

The challenge text states:

> We've infiltrated an underground food critic ring known as "The Palate" - a secretive group that rates and leaks reviews of exclusive restaurants. Their password database has been dumped and we intercepted a private chat log where members discuss how they choose their passwords. We created a file containing the l33t speak character substitutions they are known to use. Crack each member's l33t speak password.

This description suggests a **targeted dictionary-transformation attack**, rather than an unrestricted brute-force attack. The chat clues suggest base words, while `substitutions.json` defines how characters in those words can change.

The intended workflow is to:

1. Extract the base word suggested by each clue.
2. Inspect the supplied substitution mapping, including capitalization and multi-character replacements.
3. Generate candidates using those rules.
4. Hash the candidates, checking them against the targets.
5. Independently verify the matching plaintext and record the evidence.

## 3. Supplied files and target hashes

### Challenge artifacts

- `substitutions.json` — supplied leetspeak mapping; available in the solver's working directory.
- Four 32-character hexadecimal hashes, each paired with a clue in the challenge screen.

### Hashes and clue-derived base words

| Question | Clue summary | Base word | Target hash |
|---|---|---|---|
| Q1 | Chef's name; “Ducasse” | `Ducasse` | `7d07dc728906cf739d3b4860e836d6d3` |
| Q2 | Pantry staple; “Cayenne” | `Cayenne` | `d3090fd2c50212a176516f2235de8eb5` |
| Q3 | Cooking technique; “Braised” | `Braised` | `bc4a5d7fd3f922e3733b4bde95905094` |
| Q4 | Type of ordinary restaurant; “Taverna” | `Taverna` | `445575acfba37b70a6ff3978616449d8` |

All four targets are **32 hexadecimal characters (128 bits)**. That is consistent with MD5, but the length alone **does not identify the algorithm**; other hash functions and output variants can also yield 128-bit digests. MD5 was established here by actual matching recomputations.

## 4. Initial analysis

The clues are unusually explicit: **Ducasse**, **Cayenne**, **Braised**, and **Taverna** appear in the respective members' statements. This removes the need for a huge generic wordlist and reduces the search to transformations of four short strings.

The challenge name — `S4uc3d 4nd Expos3d` — and description both signal leetspeak. Examples include the replacement of letters by digits or punctuation, such as `a → 4`, `s → $`, and `c → (`. The exact allowed substitutions are determined by the provided JSON, not by generic assumptions.

**Working hypothesis:** For each base word, vary letter case and apply zero or more valid substitutions independently at each character position; compute MD5 and compare against the associated target.

The solver reports that Q1–Q3 were recovered quickly with this approach. Q4 initially resisted the ordinary substitutions and required investigation of how a slash replacement was represented in the JSON.

## 5. Analysis of `substitutions.json`

According to the solver's direct inspection of the original file:

- The mapping covers uppercase keys **A–Z**.
- Each key maps to a list of possible replacements; the first item is the ordinary lowercase letter.
- Transformations are **per position**, so repeated occurrences of the same letter can be replaced differently.
- **Mixed case** is allowed, and leaving letters unchanged is allowed.
- Some replacements are symbols or digits; some are multi-character sequences, such as `F → ph`, `W → vv`, and `X → ><`.
- Example substitutions reported from the file include `A → @`, `C → (`, `S → $`, `T → +`, and a slash-related substitution for `V`.
- The letters `D`, `J`, `K`, `M`, `N`, `Q`, `R`, and `Y` were reported to have no special leet form. Their normal lowercase/uppercase forms may still appear.

**Important distinction:** The original JSON file was not uploaded into this conversation. The rules above document the solver's inspection, not a fresh independent parsing of that file.

### Why per-position choices matter

Q1's recovered password, `dUCA5$e`, comes from `Ducasse`. The two `s` positions became different symbols (`5` and `$`). A transformation that globally replaced every `s` with the *same* symbol would have missed this solution.

Case changes matter equally: Q2's `(ayeNnE` contains both lowercase and uppercase letters, even among occurrences of the same character.

### Q4: slash/backslash representation

The key debugging finding was in the `V` replacement for **Taverna**. The solver reports a difference between the representation returned from the JSON and the slash that the challenge expects.

The distinction is important:

```json
"\/"
```

is a JSON escape for a **single forward slash** (`/`), whereas

```json
"\\/"
```

represents a **backslash followed by a forward slash** (`\/`) when decoded.

The solver reported receiving a two-character backslash-plus-slash candidate for `V` and then normalizing that particular representation to `/`. As a result, the winning Q4 password contains **a forward slash only**:

```text
7a/Erna
```

The saved `crack.py` implements the solver's normalization. This is a **challenge-specific parsing workaround**, not a general recommendation to remove backslashes from arbitrary passwords or substitution rules. The exact JSON spelling should be checked against the original `substitutions.json` when reviewing the full source.

## 6. Cracking methodology

### Attack design

A small Python cracker, `crack.py`, reads the mapping file and processes each clue separately.

Conceptually, the algorithm:

1. Loads substitutions using the standard JSON parser.
2. Uses the exact clue word as the starting point.
3. Creates allowed candidate values for each character position, including original and alternative case.
4. Includes the file's authorized leetspeak replacements.
5. Normalizes the problematic slash-related replacement for `V`, as described above.
6. Streams combinations one candidate at a time rather than storing all possible passwords in memory.
7. Deduplicates candidates when applicable.
8. Calculates the MD5 digest of each candidate string.
9. Compares the digest to the relevant target and records a verified match.

The essential test is:

```python
import hashlib

candidate_hash = hashlib.md5(candidate.encode("utf-8")).hexdigest()
if candidate_hash == target_hash:
    print("MATCH:", candidate)
```

This code illustrates the matching step; it is **not** presented as a transcript of the actual `crack.py`, whose full source remains in the solver's package.

### Search progression

| Stage | Action | Observation |
|---|---|---|
| Initial mapping attack | Transform `Ducasse`, `Cayenne`, `Braised` | Q1–Q3 recovered quickly, according to solver output |
| Initial Q4 attempt | Transform `Taverna` with initially decoded mappings | No matching MD5 candidate |
| Q4 troubleshooting | Investigate other 128-bit algorithms, iterations, affixes, and synonyms | Did not explain the missing match |
| Data-handling review | Examine the `V` substitution and slash escaping | Revealed a candidate-generation issue |
| Corrected mapping attack | Normalize the intended forward slash | Q4 recovered as `7a/Erna` |
| Independent checks | Rehash all passwords with MD5 | All four match exactly |

The solver described trying approximately a dozen alternative 128-bit algorithms during Q4 troubleshooting, but the names and outputs were not supplied here. They are therefore **not reconstructed or fabricated** in this report.

### Why the attack was effective

The clues drastically reduced the potential search space. Instead of guessing arbitrary strings, the cracker only needed combinations of a few known characters and file-defined substitutions.

The final passwords also demonstrate that multiple substitutions, unchanged letters, mixed capitalization, and punctuation can coexist in the same candidate.

## 7. Step-by-step commands and code

The solver reports saving a self-contained package in:

```text
/home/saba/NCL_Reports/S4uc3d_4nd_Expos3d/
```

Its contents are:

```text
S4uc3d_4nd_Expos3d/
├── REPORT.md
├── crack.py
├── verify.py
├── substitutions.json
├── hashes.txt
├── cracking_output.txt
└── verification_output.txt
```

The reported working commands are:

```bash
cd /home/saba/NCL_Reports/S4uc3d_4nd_Expos3d

# Recover passwords using supplied mappings:
python3 crack.py

# Recompute and compare the recovered MD5 digests:
python3 verify.py
```

**These are commands reported by the original solver.** The original scripts and their captured terminal outputs were not directly available in this conversation; no fabricated logs or unmeasured runtimes are included.

### Self-contained independent MD5 verification

The following program needs only Python's standard library. It does **not** depend on the `substitutions.json` file or on the candidate-generation logic.

```python
#!/usr/bin/env python3
import hashlib

cases = [
    ("Q1", "dUCA5$e",  "7d07dc728906cf739d3b4860e836d6d3"),
    ("Q2", "(ayeNnE", "d3090fd2c50212a176516f2235de8eb5"),
    ("Q3", "Br4i$3d",  "bc4a5d7fd3f922e3733b4bde95905094"),
    ("Q4", "7a/Erna",  "445575acfba37b70a6ff3978616449d8"),
]

for question, password, expected in cases:
    actual = hashlib.md5(password.encode("utf-8")).hexdigest()
    assert actual == expected, f"{question}: hash mismatch"
    print(f"{question}: password={password!r} md5={actual} MATCH=YES")
```

Save it as `verify_standalone.py` and run:

```bash
python3 verify_standalone.py
```

A second way to check the answers on a Linux system is with `md5sum`:

```bash
printf '%s' 'dUCA5$e'  | md5sum
printf '%s' '(ayeNnE' | md5sum
printf '%s' 'Br4i$3d'  | md5sum
printf '%s' '7a/Erna'  | md5sum
```

Use **single quotes** in the shell: Q1 and Q3 contain `$`, which could otherwise be interpreted by the shell. Also use `printf` without a trailing newline; hashing a newline produces a different digest.

## 8. Results and independent verification

All four plaintext passwords were recomputed with Python's `hashlib.md5` during preparation of this report. Every computed digest equaled the corresponding original challenge hash.

### Q1 — Ducasse

- **Base word:** `Ducasse`
- **Recovered password:** `dUCA5$e`
- **Algorithm:** MD5
- **Computed hash:** `7d07dc728906cf739d3b4860e836d6d3`
- **Target hash:** `7d07dc728906cf739d3b4860e836d6d3`
- **Result:** MATCH

This candidate uses mixed case and two different replacements for the repeated `s` characters.

### Q2 — Cayenne

- **Base word:** `Cayenne`
- **Recovered password:** `(ayeNnE`
- **Algorithm:** MD5
- **Computed hash:** `d3090fd2c50212a176516f2235de8eb5`
- **Target hash:** `d3090fd2c50212a176516f2235de8eb5`
- **Result:** MATCH

The initial `C` becomes `(`, while the remaining letters use deliberately mixed capitalization.

### Q3 — Braised

- **Base word:** `Braised`
- **Recovered password:** `Br4i$3d`
- **Algorithm:** MD5
- **Computed hash:** `bc4a5d7fd3f922e3733b4bde95905094`
- **Target hash:** `bc4a5d7fd3f922e3733b4bde95905094`
- **Result:** MATCH

Three characters are changed: `a → 4`, `s → $`, and `e → 3`.

### Q4 — Taverna

- **Base word:** `Taverna`
- **Recovered password:** `7a/Erna`
- **Algorithm:** MD5
- **Computed hash:** `445575acfba37b70a6ff3978616449d8`
- **Target hash:** `445575acfba37b70a6ff3978616449d8`
- **Result:** MATCH

The decisive detail is the **forward slash** in place of `v`, alongside `T → 7` and mixed case. The slash-escaping mismatch initially hid this candidate.

### Summary

| Q | Base word | Recovered password | Algorithm | Independent MD5 check |
|---|---|---|---|---|
| Q1 | `Ducasse` | `dUCA5$e` | MD5 | PASS |
| Q2 | `Cayenne` | `(ayeNnE` | MD5 | PASS |
| Q3 | `Braised` | `Br4i$3d` | MD5 | PASS |
| Q4 | `Taverna` | `7a/Erna` | MD5 | PASS |

**Verification scope:** This report independently verifies the final password-to-hash relationships. The original solver additionally reports successful execution of `crack.py`, `verify.py`, and command-line `md5sum` checks. Their original files/logs remain in the solver's package and were not available for direct audit here.

## 9. Final answers

The passwords to enter in the CTF answer fields are:

```text
Q1: dUCA5$e
Q2: (ayeNnE
Q3: Br4i$3d
Q4: 7a/Erna
```

**All answers are case-sensitive.** In particular:

- Q1 contains a literal dollar sign (`$`).
- Q2 **begins** with a literal opening parenthesis (`(`).
- Q3 contains a literal dollar sign (`$`).
- Q4 contains a **forward slash** (`/`), not a backslash (`\`).

These are the recovered plaintext passwords, not a single combined flag string.

## 10. Lessons learned

1. **Use the clues before brute force.** A known base word plus a small substitution mapping is far cheaper to search than arbitrary passwords.
2. **Hash lengths are hints, not proof.** A 32-character hex digest can suggest MD5, but verifying a candidate against the exact target is what establishes a match.
3. **Substitutions can be independent.** Repeated letters need not receive the same leetspeak replacement.
4. **Preserve exact case and punctuation.** Password hashes change completely if even one character differs.
5. **Treat data parsing as part of the attack.** Q4 was blocked by a character-encoding/escape interpretation issue, not by an inherently difficult password.
6. **Inspect multi-character replacements carefully.** A JSON entry can denote more than one output character; parsing and normalization choices must be intentional.
7. **Verify outside the cracker.** An independent MD5 recomputation helps catch logic errors and misleading positive results.
8. **Keep actual evidence.** Scripts, mapping files, original hashes, and captured output make a challenge reproducible later.
9. **Document failed approaches accurately.** The Q4 detour illustrates why broadening the algorithm search is sometimes less productive than inspecting inputs.
10. **Do not use these passwords as real-world security examples.** Predictable theme words plus substitutions and unsalted MD5 are weak against offline guessing.

### Reproduction checklist

- [x] Four original target hashes preserved
- [x] Four recovered plaintext passwords recorded
- [x] All four MD5 outputs independently recomputed and matched
- [x] Solver-reported working directory and commands documented
- [x] Q4 slash-escaping investigation recorded
- [ ] Original `substitutions.json`, `crack.py`, and terminal logs reviewed directly in this report's environment (not supplied here)

### Closing note

**Result: 4/4 password hashes cracked and independently validated — 60/60 available points worth of recovered answers.**

This writeup deliberately distinguishes independently reproduced verification from solver-reported code execution. For a fully audited archival record, retain the original `REPORT.md`, `crack.py`, `verify.py`, `substitutions.json`, and captured output files together with this report.
