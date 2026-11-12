---
title: "Spin A Yarn (Medium)"
description: "Crack SHA-256-crypt hashes built from usernames or Vanna's Choice color names."
category: "password-cracking"
difficulty: "medium"
status: "solved"
season: "2026 NCL Individual"
points: "75 points"
tools: ["hashcat"]
---
> **Category:** Password Cracking  ·  **Difficulty:** Medium  ·  **Points:** 75 (5 × 15)  
> **Status:** Solved — 5/5 target accounts  ·  **Hash scheme:** SHA-256 crypt (`$5$`, Hashcat mode `7400`)

## 1. Challenge Overview

**Challenge:** *Spin A Yarn*  
**Scenario:** An NCL Cyber Command investigation of Linux password hashes from members of Liber8tion who are fans of Lion Brand's Vanna's Choice yarn.

**Objective:** Recover the passwords belonging to `mtrina`, `shall`, `ymonroe`, `ptrey`, and `fday`.

The challenge supplies two possible password-construction rules:

1. A default password formed as `username` immediately followed by **exactly three decimal digits** (including `000` through `099`).
2. A fan-inspired password formed by concatenating **two different official Vanna's Choice swatch color names**, with spaces removed and official capitalization preserved.

These two narrow patterns are far more efficient than unrestricted password guessing.

## 2. Challenge Description and Objectives

The challenge described access to a Linux server run by members of Liber8tion and reported two observed password habits: username plus three random digits, or two Vanna's Choice swatch colors concatenated with their internal spaces removed. Five user accounts were selected for grading.

| Question | Account | Points |
|---|---|---:|
| Q1 | `mtrina` | 15 |
| Q2 | `shall` | 15 |
| Q3 | `ymonroe` | 15 |
| Q4 | `ptrey` | 15 |
| Q5 | `fday` | 15 |
| **Total** | | **75** |

**Scope:** Offline analysis of the hashes supplied as part of this authorized CTF challenge. No remote server login or online password spraying was required.

## 3. Supplied Files and Hash Analysis

The original screenshot/text in the challenge conversation showed ten shadow-style records. In Claude's subsequent execution environment, the complete ten-record file was not present in Downloads, so the **five target entries transcribed from the challenge** were used to build the reproducibility package. The five other accounts were not needed to recover the requested answers.

The five target records were:

```text
mtrina:$5$vGi.VSj5bpBelURq$rLDK9gqlcx6HKB94kxtzFpJo8xQ71sy7pgBbfBlbPnC::::::
shall:$5$wAknPJJkaGAlCJZ5$GNxvuUDE3Tsz1cXHgVxQcUGn9060tEW3GN1fPT6dzOA::::::
ymonroe:$5$mfJ74xr0b6FSrTmz$t0wb//TZraZtHUiTTNIXnNfegmj3UCvn8RxMgk227oC::::::
ptrey:$5$CSMShjT.IC6GiWIp$FP.m8pImEhMrv09/j2kIS7NCkdqkr349hQH5sNjVQp4::::::
fday:$5$O5ykoDOWgIZUBncq$TAAdeQCwoqLV63PGJt/.I5K2eF63.QoiOScJjMv.fiC::::::
```

Each record follows the general shape:

```text
username:$5$salt$checksum::::::
```

The fields following the crypt hash are extra empty account-data fields and **are not part of the password hash**. Each salt is individual to the user.

To extract only the second colon-delimited field from the local working copy:

```bash
cut -d: -f2 hashes.txt > hashes_only.txt
```

Preserve the complete `$5$...$...` value; do not split it on dollar signs or truncate its salt.

## 4. SHA-256 Crypt Identification

The leading `$5$` marker identifies Unix **SHA-256 crypt** (`sha256crypt`). This is a salted, iterated password-hashing scheme, not the single-round `SHA256(password)` digest. These records do not specify `rounds=...`, so they use the usual **5,000-round default**.

The corresponding Hashcat mode is:

```text
7400 — sha256crypt $5$, SHA256 (Unix)
```

Example validation/setup commands:

```bash
hashcat --help | grep -i sha256crypt
cut -d: -f2 hashes.txt > hashes_only.txt
```

Unlike a raw SHA-256 hash, a full SHA-256 crypt string retains its algorithm marker, salt, and encoded checksum, which are needed for correct comparison.

## 5. Username-Based Password Attack

The first strategy enumerated every string of the form:

```text
<username><three-digit-decimal-number>
```

For each username, the suffix ranges from `000` to `999`, inclusive. **Leading zeros must be retained** because the challenge specifies three digits, unlike the earlier *Vaulted* challenge.

For the five target users this is at most `5 × 1,000 = 5,000` candidates. Claude reported using `generate_username_candidates.py` to generate the list.

**Actual reported commands:**

```bash
python3 generate_username_candidates.py > username_candidates.txt
hashcat -m 7400 -a 0 hashes_only.txt username_candidates.txt --potfile-path=yarn.pot
```

The wordlist recovered three target passwords:

| Account | Verified password | Rule |
|---|---|---|
| `mtrina` | `mtrina762` | `mtrina` + `762` |
| `shall` | `shall965` | `shall` + `965` |
| `ymonroe` | `ymonroe135` | `ymonroe` + `135` |

The username rule did not recover the remaining two accounts; the color-based rule addressed them.

## 6. Official Vanna's Choice Color Research

**Reference:** [Lion Brand — Vanna's Choice Yarn](https://www.lionbrand.com/products/vannas-choice-yarn)

Claude reported collecting **93 official swatch names** into `colors.txt`, retaining the names as written on the product page. Its associated scripts were `extract_colors.py` and `generate_color_candidates.py`.

Candidate creation followed these constraints:

- Use exactly **two distinct** color names.
- Remove spaces *within* each official color name.
- Preserve official capitalization and wording.
- Concatenate the two names with **no punctuation or separator**.
- Test both possible orders (`ColorAColorB` and `ColorBColorA`).

For **93** distinct swatches, there are `93 × 92 = 8,556` ordered pairs before any deduplication. The relevant verified color names were **White**, **Colonial Blue**, **Taupe**, and **Silver Heather**.

Examples of the successful transformation:

```text
White + Colonial Blue  → WhiteColonialBlue
Taupe + Silver Heather → TaupeSilverHeather
```

**Evidence boundary:** The number of colors and the creation of `colors.txt` were reported by Claude. This standalone report does not reproduce or audit the full 93-line list, since that original file was not uploaded to this conversation. The color-pair passwords themselves were independently verified against the supplied crypt hashes.

## 7. Color Combination Password Attack

Claude generated ordered distinct color pairs and tested them against the remaining SHA-256 crypt targets using Hashcat.

**Actual reported commands:**

```bash
python3 generate_color_candidates.py > color_candidates.txt
hashcat -m 7400 -a 0 hashes_only.txt color_candidates.txt --potfile-path=yarn.pot
hashcat -m 7400 hashes_only.txt --show --potfile-path=yarn.pot
```

The results were:

| Account | First color | Second color | Password |
|---|---|---|---|
| `ptrey` | White | Colonial Blue | `WhiteColonialBlue` |
| `fday` | Taupe | Silver Heather | `TaupeSilverHeather` |

The colors were concatenated in that exact order. Their spaces were removed, while their case was retained.

## 8. Cracking Commands, Workflow, and Troubleshooting

The report producer's package path is:

```text
/home/saba/NCL_Reports/Spin_A_Yarn/
```

The full reported sequence was:

```bash
cd /home/saba/NCL_Reports/Spin_A_Yarn

# Prepare the five target hashes for hashcat.
cut -d: -f2 hashes.txt > hashes_only.txt

# Strategy A: username + 000–999.
python3 generate_username_candidates.py > username_candidates.txt
hashcat -m 7400 -a 0 hashes_only.txt username_candidates.txt --potfile-path=yarn.pot

# Strategy B: ordered pairs of distinct yarn colors.
python3 generate_color_candidates.py > color_candidates.txt
hashcat -m 7400 -a 0 hashes_only.txt color_candidates.txt --potfile-path=yarn.pot

# Show recovered pairs from the shared potfile.
hashcat -m 7400 hashes_only.txt --show --potfile-path=yarn.pot
```

Claude reported that `crack.sh` originally stopped after the first Hashcat pass because a **non-zero exit code** was returned when not all target hashes were recovered in that pass. The script was updated to handle that expected intermediate situation while allowing the second strategy to run; the corrected end-to-end execution recovered **5/5**.

A robust implementation should also check for genuine Hashcat errors rather than suppressing *all* non-zero codes, and should confirm that the final `--show` results cover each requested target. The exact repaired `crack.sh` source was not provided to this conversation, so its internal control flow is not reproduced here.

**Reported package contents:**

```text
Spin_A_Yarn/
├── REPORT.md
├── hashes.txt
├── hashes_only.txt
├── colors.txt
├── extract_colors.py
├── generate_username_candidates.py
├── generate_color_candidates.py
├── crack.sh
├── verify.py
├── cracking_output.txt
└── verification_output.txt
```

Generated candidate lists and `yarn.pot` may also exist at runtime; the listing above describes the essential reported artifacts rather than an exhaustive directory inventory.

## 9. Final Answers and Independent Verification

### Final answers

| Question | Username | Recovered password | Attack method | Verification |
|---|---|---|---|---|
| Q1 | `mtrina` | `mtrina762` | Username + three digits | **MATCH** |
| Q2 | `shall` | `shall965` | Username + three digits | **MATCH** |
| Q3 | `ymonroe` | `ymonroe135` | Username + three digits | **MATCH** |
| Q4 | `ptrey` | `WhiteColonialBlue` | White + Colonial Blue | **MATCH** |
| Q5 | `fday` | `TaupeSilverHeather` | Taupe + Silver Heather | **MATCH** |

### Independent verification procedure

Claude reported checking each result with `openssl passwd -5`, separately from Hashcat, and achieving five exact matches.

I also **independently ran OpenSSL in this report-creation environment** against the five full target hashes above. Each recomputed SHA-256 crypt string exactly matched the corresponding supplied string.

Commands used for this independent verification:

```bash
openssl passwd -5 -salt 'vGi.VSj5bpBelURq' 'mtrina762'
openssl passwd -5 -salt 'wAknPJJkaGAlCJZ5' 'shall965'
openssl passwd -5 -salt 'mfJ74xr0b6FSrTmz' 'ymonroe135'
openssl passwd -5 -salt 'CSMShjT.IC6GiWIp' 'WhiteColonialBlue'
openssl passwd -5 -salt 'O5ykoDOWgIZUBncq' 'TaupeSilverHeather'
```

For every output, compare the complete result against the respective `$5$...` field from Section 3. The salts are case-sensitive and must be passed exactly as shown.

| Account | Salt used | Expected checksum | OpenSSL result |
|---|---|---|---|
| `mtrina` | `vGi.VSj5bpBelURq` | `rLDK9gqlcx6HKB94kxtzFpJo8xQ71sy7pgBbfBlbPnC` | MATCH |
| `shall` | `wAknPJJkaGAlCJZ5` | `GNxvuUDE3Tsz1cXHgVxQcUGn9060tEW3GN1fPT6dzOA` | MATCH |
| `ymonroe` | `mfJ74xr0b6FSrTmz` | `t0wb//TZraZtHUiTTNIXnNfegmj3UCvn8RxMgk227oC` | MATCH |
| `ptrey` | `CSMShjT.IC6GiWIp` | `FP.m8pImEhMrv09/j2kIS7NCkdqkr349hQH5sNjVQp4` | MATCH |
| `fday` | `O5ykoDOWgIZUBncq` | `TAAdeQCwoqLV63PGJt/.I5K2eF63.QoiOScJjMv.fiC` | MATCH |

**Independent result:** **5 / 5 MATCH**. These are successful, exact cryptographic comparisons, not inferred passwords or plausible guesses.

### Reproduction

From Claude's local package directory, use:

```bash
cd /home/saba/NCL_Reports/Spin_A_Yarn
./crack.sh
python3 verify.py
```

According to Claude's summary, the repaired `crack.sh` recovers all five passwords end-to-end and `verify.py` independently validates every one using OpenSSL.

**Limitations and provenance:**

- I verified the five plaintext/hash pairs with OpenSSL, but **did not have Claude's original `crack.sh`, wordlists, Hashcat output, or `verify.py` to inspect or rerun** in this chat.
- Claude stated that the full ten-account file was absent from its Downloads directory and it used the five target entries supplied in the challenge text. The ten-account listing was visible in the earlier conversation; only the five relevant records are used in this report.
- The official color source URL is documented. The exact 93-swatch file is retained in Claude's package, not embedded here.
- Claude noted that Python 3.14 no longer provides the legacy standard-library `crypt` module; using `openssl passwd -5` avoided that dependency.
- No Hashcat speed, runtime, device specification, or console log is invented here.

## 10. Lessons Learned and Security Implications

**Read the entire password-format clue.** Three digits requires testing `000` to `999`, not just integers 1–999. A small formatting detail can determine whether the intended candidate is generated.

**Recognize Unix crypt markers.** `$5$` identifies salted SHA-256 crypt. Choosing Hashcat mode `7400` prevents the common mistake of attacking the entry as raw SHA-256.

**Prioritize targeted dictionaries.** Five thousand username candidates and only 8,556 ordered pairs of 93 official swatches are small, auditable spaces compared with unrestricted brute force.

**Treat capitalization and ordering as password bytes.** `WhiteColonialBlue` is not equivalent to `ColonialBlueWhite`, `whitecolonialblue`, or `White Colonial Blue`.

**Use reliable, challenge-relevant sources.** The official Lion Brand swatch names provided the exact vocabulary needed for the second strategy.

**Do not let intermediate tool status stop a multi-stage attack.** An incomplete first pass is expected when some accounts use another known format; script logic should continue appropriately while still surfacing genuine errors.

**Independently verify all candidate secrets.** Matching each password using OpenSSL's SHA-256 crypt implementation gives stronger evidence than relying only on a cracked-status line.

**Defensive lesson:** Personal identifiers and highly predictable themed combinations create very small offline search spaces, even when the storage scheme is salted and iterated. Use long, random, unique passwords and modern adaptive password hashing where possible.

---

## References

1. [Lion Brand — Vanna's Choice Yarn, official product/swatches page](https://www.lionbrand.com/products/vannas-choice-yarn).
2. [Hashcat example hashes and mode documentation](https://hashcat.net/wiki/doku.php?id=example_hashes) — SHA-256 crypt (`$5$`) / mode 7400.
3. [OpenSSL `passwd` documentation](https://docs.openssl.org/master/man1/openssl-passwd/) — `-5` option for SHA-256 crypt.
4. Local Claude reproducibility package: `/home/saba/NCL_Reports/Spin_A_Yarn/` (reported location; not accessible in this chat).

*Prepared from the supplied CTF challenge, Claude's reported execution summary, and independent verification of the five SHA-256 crypt strings. This report documents an authorized training challenge.*
