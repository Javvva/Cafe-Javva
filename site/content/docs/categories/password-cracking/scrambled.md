---
title: "Scrambled (Hard)"
description: "Rediscover how last year's passwords were transformed and crack the new hash list."
category: "password-cracking"
difficulty: "hard"
status: "solved"
season: "2026 NCL Individual"
points: "65 points"
tools: ["hashcat", "python"]
---
**Challenge:** Scrambled  
**Category:** Password Cracking / Cyber Command  
**Difficulty:** Hard  
**Value:** 65 points (Q1: 15, Q2: 20, Q3: 30)  
**Outcome:** All three requested answers recovered and independently MD5-verified (**65/65**).  
**Audit-wide outcome:** 24/24 hashes recovered, according to the completed cracking run reported by the operator.  
**Report date:** November 6, 2026  

> **Evidence scope.** This report is based on the challenge statement and the operator's detailed execution summaries. The recovered answers were **independently rehashed** for this report using Python's `hashlib` and matched all three original hashes. The original historical potfile, complete 24-hash input, scripts, and captured execution logs remain in the operator's local folder; they were **not supplied to the report author** for independent inspection. Performance, candidate counts, and audit-wide crack totals below are labeled as operator-reported where applicable.

---

## 1. Challenge Overview

The challenge describes a follow-up password audit. A prior year's Hashcat potfile contains recovered passwords, but the same passwords no longer directly crack the current year's hash list. Team members left three examples of passwords they managed to recover, but did not document the candidate-generation technique. The objective is to rediscover that technique, attack the **entire current audit hash list**, and identify three requested plaintext passwords.

The supplied examples are:

```text
berwockyjschachror
inAdminrarwo
!anyonHSV68@F
```

The requirement to attack *all* hashes is central: successful recoveries can themselves become inputs to later rounds of password candidate generation.

## 2. Objectives and Target Hashes

| Question | Points | MD5 target hash | Final plaintext |
|:--|--:|:--|:--|
| Q1 | 15 | `289a06bbfe9413851dd55d2954f69e97` | `6548300ide` |
| Q2 | 20 | `a198d2d02d6afd847ab76c9840be6056` | `prced` |
| Q3 | 30 | `a04beb5b3f1a286ddb5e0ee5e8b6a389` | `801gue76m389ue7680` |

**Algorithm:** unsalted MD5 for the requested challenge hashes; **Hashcat mode:** `0`. The MD5 identification is supported by exact recomputation of each recovered password—not merely the 32-character hash length.

## 3. Evidence and Initial Analysis

The operator identified:

- **50 plaintext passwords** recovered in the previous year's Hashcat potfile, including examples such as `jabberwocky`, `rorschach`, `AdminAdmin`, `V68@FHS`, and `anyone!`.
- **24 current-year audit hashes**, of which only three were explicitly graded.
- Three already-known current-style plaintexts in the challenge description.

The examples are unusual but clearly contain recognizable rearrangements and fragments of historical plaintexts:

- `berwockyjschachror`: fragments associated with `jabberwocky` and `rorschach`.
- `inAdminrarwo`: multiple fragments, including material associated with `AdminAdmin`.
- `!anyonHSV68@F`: rotated/sliced material associated with `anyone!` and `V68@FHS`.

These observations led to a candidate model based on cyclic rotations, contiguous fragment extraction, and concatenation. The operator reported successful reconstructions of all three examples.

**Input preservation:** the original potfile and the full 24-hash list should remain unchanged. Extract plaintext portions carefully: a password in a Hashcat potfile can include punctuation, including a colon, so blindly splitting every colon is unsafe unless the hash-field format is known.

## 4. Identification of the Hash Algorithm

The target digests contain 32 hexadecimal characters, which suggested MD5 but did not prove it. A known plaintext/hash pair is the decisive test:

```python
import hashlib

password = "prced"
print(hashlib.md5(password.encode("utf-8")).hexdigest())
# a198d2d02d6afd847ab76c9840be6056
```

This matches Q2 exactly. Q1 and Q3 were also independently recomputed with MD5 after recovery (Section 9). The operator used Hashcat mode `0` for the cracking attacks.

## 5. Historical Potfile Analysis and First-Generation Fragments

The initially reconstructed method was:

1. Read the 50 recovered historical plaintexts.
2. Generate cyclic rotations of each word.
3. Extract contiguous substrings (including wraparound across the end of a rotated word).
4. Deduplicate the resulting fragments.
5. Concatenate two or more fragments without separators.
6. Hash each candidate with MD5 and compare it against the **full list of 24 current hashes**.

The operator's initial generator produced **2,206 first-generation fragments**.

A conceptual example shows why rotation is useful:

```text
source:       procedura
rotations:    procedura, rocedurap, ocedurapr, ...
fragments:    pr, ced, ...
combination:  pr + ced  ->  prced
```

This is an illustrative decomposition of Q2, consistent with the operator's confirmed approach; exact originating offsets can be regenerated from the local scripts.

Reported first-generation cracking commands:

```bash
python3 generate_candidates.py fragments > fragments.txt

# Two-fragment combinations
hashcat -m 0 -a 1 current_hashes.txt fragments.txt fragments.txt

# Construct an intermediate two-fragment list and use it for three fragments
/usr/lib/hashcat-utils/combinator.bin fragments.txt fragments.txt > twofrag.txt
hashcat -m 0 -a 1 current_hashes.txt fragments.txt twofrag.txt
```

With these initial attacks the operator recovered **11 of 24 hashes**, including Q1 (`6548300ide`) and Q2 (`prced`).

**Implementation note:** These commands are transcribed from the supplied execution summary, not independently re-executed for this document. The local scripts handle the exact fragment-selection logic and any resource management needed to regenerate large inputs.

## 6. Why the Initial Approach Stalled

Q3 did not appear in the initial combinations. The operator reported running additional attacks, including:

- Exhaustive two-, three-, and four-fragment combinations from the original fragment vocabulary; the four-fragment pass reportedly evaluated approximately **2.4 × 10¹³** candidate combinations and reached 100%.
- Reversed and wraparound fragments, examples added as seeds, character deletions/subsequences, permutations, extensive rule transformations, interleaving, and insertion.
- A bounded five-fragment search using very short fragments; this also finished without solving Q3.

These searches were computationally expensive, but they were all constrained by the *vocabulary of fragments available at the time* or by particular transformation families.

A crucial distinction: **Not finding Q3 in the tested two-to-four-fragment spaces did not prove Q3 inherently required five or more fragments.** It proved only that Q3 was absent from those *specific generated candidate sets*. The later solution demonstrated why that narrower conclusion mattered.

## 7. Breakthrough: Iterative Fingerprint Attack

The key insight was to **feed current-year recovered passwords back into the fragment generator**.

The first 11 successful cracks were not just answers: they were new strings that might contain useful substrings absent from any original potfile word. In particular, when two old fragments were joined, a substring crossing their join could become a reusable **second-generation fragment**. This boundary-spanning fragment would not exist as a contiguous substring of any single historical source word.

The revised algorithm was:

1. Start with the historical 50 plaintexts and the supplied example strings.
2. Generate first-generation fingerprints (cyclic substrings).
3. Combine fingerprints and attack all 24 current hashes.
4. Add **every newly cracked plaintext** to the seed collection.
5. Re-expand the new plaintexts into substrings, retaining only genuinely new fragments.
6. Run prioritized combinations involving those new fragments against **all remaining hashes**.
7. Repeat until no more hashes crack or no more useful new fragments are generated.

This is an iterative **fingerprint attack**: the dictionary evolves as cracking succeeds. It explains the challenge's otherwise conspicuous instruction to attack the entire 24-hash collection.

### Reported iterative results

| Stage | Fragment sources / action | Reported total cracked |
|:--|:--|--:|
| Generation 1 | Historical potfile → 2,206 fragments; combinator attacks | **11 / 24** |
| Generation 2 | Expand 11 recovered passwords + 3 example strings; test fresh combinations | **15 / 24** |
| Generation 3 | Re-expand all 15 current recovered passwords; iterate again | **24 / 24**, including Q3 |
| Convergence check | Repeat feedback cycle | No additional cracks needed |

Additional reported measurements:

- Expanding the 11 recovered passwords and three examples produced **2,054 fragments**, of which **1,600 were new** relative to the original 2,206.
- The later feedback round contributed **1,893 newly generated fragments**, according to the operator.
- A second follow-up round after all 24 were recovered yielded no new cracks and the process converged.

### Why Q3 became reachable

**Q3 password:** `801gue76m389ue7680`

The operator traced it to material obtained from already-cracked passwords, including:

- `801gue76`, a rotation associated with recovered `gue76801`.
- New substring material spanning boundaries in another recovered string, reported as involving `ue7680389`.

The exact source offsets, concatenation boundaries, and intermediate hash-to-plaintext chain should be read from the local `fingerprint_iterate.sh` and captured logs. Those files were not furnished here, so a more precise origin chain is **not invented**.

The important confirmed conclusion is that **Q3 was reached in the iterative feedback rounds**, using fragments made available only after current-year plaintexts were themselves cracked. This is a much stronger explanation than asserting that Q3 simply needed a longer brute-force combination.

## 8. Executed Workflow and Reproduction

The local reproducibility package is reported as:

```text
/home/saba/NCL_Reports/Scrambled/
    REPORT.md
    crack.sh
    fingerprint_iterate.sh
    generate_candidates.py
    verify.py
    [historical potfile, current hashes, supporting outputs/logs]
```

The exact presence and filenames of the supporting inputs should be checked in that local directory. Large regenerable candidate lists were intentionally removed after the working scripts had been validated.

Operator-provided reproduction commands:

```bash
cd /home/saba/NCL_Reports/Scrambled

# Build and attack first-generation fragment candidates.
./crack.sh

# Feed cracked plaintexts back into the fingerprint dictionary until convergence.
./fingerprint_iterate.sh

# Independently verify the three graded results.
python3 verify.py
```

Reported final result: **24/24** current audit hashes cracked, with all three graded answers recovered. The operator also reported independent verification via `verify.py` and shell `md5sum`.

The originally running bounded five-fragment GPU job was allowed to finish before the GPU was reused; it did **not** recover Q3. The ultimately successful iterative fingerprint method did not require PRINCE or an unrestricted five-fragment attack.

## 9. Final Answers and Independent Verification

The table below contains the exact grader targets and recovered plaintexts.

| Q | Target MD5 | Password | MD5 recomputed independently | Status |
|:--|:--|:--|:--|:--|
| Q1 | `289a06bbfe9413851dd55d2954f69e97` | `6548300ide` | `289a06bbfe9413851dd55d2954f69e97` | **MATCH** |
| Q2 | `a198d2d02d6afd847ab76c9840be6056` | `prced` | `a198d2d02d6afd847ab76c9840be6056` | **MATCH** |
| Q3 | `a04beb5b3f1a286ddb5e0ee5e8b6a389` | `801gue76m389ue7680` | `a04beb5b3f1a286ddb5e0ee5e8b6a389` | **MATCH** |

### Standalone independent verification

The following uses Python's standard-library MD5 implementation; it does not depend on the Hashcat potfile or on the attack scripts:

```python
#!/usr/bin/env python3
import hashlib

targets = {
    "Q1": ("289a06bbfe9413851dd55d2954f69e97", "6548300ide"),
    "Q2": ("a198d2d02d6afd847ab76c9840be6056", "prced"),
    "Q3": ("a04beb5b3f1a286ddb5e0ee5e8b6a389", "801gue76m389ue7680"),
}

all_valid = True
for question, (expected, password) in targets.items():
    computed = hashlib.md5(password.encode("utf-8")).hexdigest()
    matched = computed == expected
    all_valid &= matched
    print(f"{question} | password={password} | MD5={computed} | MATCH={'YES' if matched else 'NO'}")

print("ALL VERIFIED:", "YES" if all_valid else "NO")
```

**Independent recheck performed for this report:** all three comparisons returned `True` using Python `hashlib`.

Expected verified digests:

```text
Q1: 289a06bbfe9413851dd55d2954f69e97  MATCH=YES
Q2: a198d2d02d6afd847ab76c9840be6056  MATCH=YES
Q3: a04beb5b3f1a286ddb5e0ee5e8b6a389  MATCH=YES
```

The operator's separate verification of the other 21 recovered audit passwords, as well as their plaintext values, cannot be independently reproduced from the summary alone because the complete recovered potfile was not provided here.

## 10. Lessons Learned and Security Implications

1. **Use all available hash targets when the attack can learn from recoveries.** The extra 21 hashes were vital stepping stones, not distractors.
2. **A wordlist can be dynamic rather than static.** Every successful crack can contribute new fragments or statistical signals to the next round.
3. **New substrings can cross boundaries.** Combining known fragments creates novel contiguous character sequences that may not exist in the original vocabulary.
4. **Exhausting a candidate model is not the same as exhausting all password constructions.** The failed four-fragment search ruled out only candidates the original generator could enumerate.
5. **GPU speed cannot compensate for a missing generation strategy.** Targeted dictionary expansion solved what a much larger static search did not.
6. **Verify plaintexts independently.** Matching the exact MD5 digest is the definitive check for each graded result.
7. **Preserve scripts and meaningful logs.** Recording which generation produced each match explains the result far better than a final potfile alone.
8. **Password reuse and predictable transformations are risky.** Even modified passwords can be exposed when attackers learn structures from prior leaks and related accounts.

### Final outcome

**Scrambled (Hard): SOLVED — 65/65 graded points.**  
**Operator-reported audit-wide recovery: 24/24 hashes.**  
**Directly independently verified in this report: Q1, Q2, and Q3 (3/3).**

### References and provenance

- Challenge text and the three supplied example passwords: user-provided NCL prompt.
- First-generation and iterative cracking counts, tools, environment, and command history: operator's final execution summary.
- Independent MD5 checks: directly performed during preparation of this report using Python `hashlib`.
- Relevant technique: Hashcat's *Fingerprint Attack* workflow, including iterative expansion of recovered passwords into fresh candidate material.
