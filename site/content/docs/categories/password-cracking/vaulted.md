---
title: "Vaulted (Medium)"
description: "Extract a KeePass hash, crack the master password, and read the admin entry."
category: "password-cracking"
difficulty: "medium"
status: "solved"
season: "2026 NCL Individual"
points: "70 points"
tools: ["keepass2john", "hashcat", "john"]
---
> **Challenge:** Vaulted  
> **Difficulty:** Medium  
> **Category:** Password Cracking / Digital Forensics / KeePass  
> **Total points:** 70  
> **Result:** All four questions solved and reported as independently verified  
> **Report prepared:** November 6, 2026

## 1. Challenge Overview

**Cyber Command** provided an encrypted KeePass database recovered from a fictional Liber8tion operative's laptop. An intercepted chat log indicated that a vault user reused a simple password pattern: an **X-Men codename followed immediately by a lucky number** of one to four digits, without leading zeroes.

The challenge required determining how to extract the vault's crackable representation, identifying the correct Hashcat mode, recovering the **master password**, and then opening the vault to retrieve the credential in its administrator entry.

| Question | Task | Points |
|---|---|---:|
| Q1 | Name the tool that extracts a crackable hash from `.kdbx` | 10 |
| Q2 | Identify the Hashcat mode for the vault | 15 |
| Q3 | Recover the KeePass master password | 25 |
| Q4 | Recover the stored `admin-panel` password | 20 |
| **Total** | | **70** |

### Final answers

| Question | Verified answer | Supporting observation |
|---|---|---|
| **Q1** | `keepass2john` | Extracted a `$keepass$` record accepted by cracking tools |
| **Q2** | `13400` | The vault uses KDBX3 with AES-KDF; Hashcat loaded and cracked it in this mode |
| **Q3** | `cable73` | Recovered by John and Hashcat; accepted during vault decryption |
| **Q4** | `R3d-Ph03n1x-99!` | Read from the `Liber8tion-Ops-Panel` entry, user `admin` |

**Important distinction:** `cable73` is the *vault master password*; `R3d-Ph03n1x-99!` is a *separate password stored inside the decrypted vault*.

## 2. Challenge Description and Objectives

The challenge described an imaged laptop containing `liber8-ops.kdbx` and an intercepted list of X-Men codenames, `codenames.txt`. The relevant password hint was:

> “your codename plus your lucky number” — one to four digits, never padded with leading zeros.

The intended analytical approach was a small, informed offline password search rather than an unbounded brute-force attempt. Success required:

1. Inspecting the KeePass database and its KDF.
2. Extracting a format suitable for John the Ripper / Hashcat.
3. Generating the exact `<codename><number>` candidates.
4. Cracking and validating the master password.
5. Decrypting the vault and finding the stored administrator credential.

The work was performed against the supplied CTF artifacts.

## 3. Supplied Files and Initial Evidence

The original challenge files were located under:

```text
/home/saba/Downloads/pass_medium/
├── liber8-ops.kdbx
└── codenames.txt
```

The reproducibility package was saved separately at:

```text
/home/saba/NCL_Reports/Vaulted/
```

The original `.kdbx` was **referenced read-only and not modified**.

### Evidence inventory

| Artifact | Role |
|---|---|
| `liber8-ops.kdbx` | Encrypted KeePass database, source evidence |
| `codenames.txt` | Candidate X-Men codenames from the intercepted chat |
| `vault.john` | `keepass2john` output with the filename prefix |
| `vault.hash` | Filename prefix removed; used with Hashcat |
| `candidates.txt` | Generated codename-and-number combinations |
| `cracking_output.txt` | Captured output from cracking |
| `verification_output.txt` | Captured output from verification |

No full vault hash, private header values, or terminal transcripts were provided in this conversation; those are retained in the original local package.

## 4. KeePass Vault Format Analysis

The solver reported the following metadata from the actual vault:

| Property | Determined value |
|---|---|
| File format | **KDBX3** (KeePass database version 3) |
| Key derivation | **AES-KDF** |
| KDF rounds | **6,000** |
| Extracted hash prefix | `$keepass$*2*6000*0*…` |
| Applicable Hashcat mode | **13400** |
| Argon2 KDF | **Not used** |

The extracted record and the database header were used together to select the attack method. The fact that a file is named `.kdbx` is **not sufficient** to choose a mode: KDBX versions and KDF choices vary. For this file, the concrete metadata and successful Hashcat execution established mode `13400`.

### Why an extracted hash can be cracked offline

A KeePass database is not an ordinary single-password hash file. It contains encrypted data plus header material needed to evaluate candidate master passwords. `keepass2john` turns relevant database material into a record that a cracker can evaluate. The tool does not decrypt the vault by itself.

## 5. Hash Extraction and Hashcat Mode Identification

### Q1 — Extraction tool: `keepass2john`

The executed extraction command was:

```bash
keepass2john /home/saba/Downloads/pass_medium/liber8-ops.kdbx > vault.john
```

This produced a John-compatible record beginning with:

```text
<database filename>:$keepass$*2*6000*0*...
```

*The line above is illustrative, truncated to the supplied prefix; it is not a pasted terminal transcript.*

The filename prefix was removed for the Hashcat input:

```bash
cut -d: -f2- vault.john > vault.hash
```

Using `-f2-` retains every field after the initial filename separator rather than inadvertently discarding later colon-delimited data.

### Q2 — Hashcat mode: `13400`

For this KDBX3 / AES-KDF database, the actual Hashcat confirmation command was:

```bash
hashcat -m 13400 -a 0 vault.hash candidates.txt
```

Hashcat accepted the extracted record and recovered the same master password as John. This made the mode selection operationally verified, not a guess inferred from the filename or the hash prefix alone.

Reference material:

- [John the Ripper `keepass2john` source](https://github.com/openwall/john/blob/bleeding-jumbo/src/keepass2john.c)
- [Hashcat example hash formats (including KeePass mode 13400)](https://hashcat.net/wiki/doku.php?id=example_hashes)

## 6. Password Candidate Generation

The chat clue strongly constrained the master password to:

```text
<X-Men codename><decimal integer from 1 through 9999>
```

The number is appended **without separators and without leading zeroes**. For example, the clue permits `cable73`, not `cable0073`.

The solver used the supplied codename list and generated the numeric suffixes plus reasonable capitalization variants. The actual generator was saved as `generate_candidates.py`; its complete source is in the Claude-side package.

Executed command:

```bash
python3 generate_candidates.py > candidates.txt
```

If there are `N` unique codename forms, an exhaustive search over the specified suffixes produces up to `9,999 × N` candidates before accounting for case variants and duplicates. The **actual** candidate count is not asserted here because the `codenames.txt` content and generator output were not supplied to this chat.

### Why this was efficient

Instead of trying arbitrary passwords, the attack prioritized the human behavior described in the logs: a predictable codename plus a short integer. The correct combination was:

```text
cable + 73 = cable73
```

## 7. Master Password Cracking Process

### Step 1 — Crack with John the Ripper

The command reported as actually executed:

```bash
john --wordlist=candidates.txt --pot=vault.pot vault.john
```

**Recovered password:**

```text
cable73
```

### Step 2 — Cross-check with Hashcat

A second cracker was used against the Hashcat-compatible extraction:

```bash
hashcat -m 13400 -a 0 vault.hash candidates.txt
```

**Reported result:** Hashcat also recovered `cable73`.

This second result served two purposes: it confirmed the plaintext password and showed that **mode 13400** was accepted and effective for this specific vault.

### Step 3 — Confirm the password decrypts the vault

The separate verification code re-derived the KeePass encryption key and checked the database's **StreamStart** integrity bytes. The password was accepted and the KDBX3 content was decrypted. This is stronger evidence than a textual output from a single cracking program.

**Q3 result: `cable73`.**

## 8. Vault Decryption and Admin-Panel Recovery

The environment lacked `keepassxc-cli` and `pykeepass`, and package installation through `pip` was restricted. Rather than treating that as a blocker, the solver used a self-contained KDBX3 reader, `kdbx3_open.py`, based on the installed Python `cryptography` library and an in-script Salsa20 implementation.

The command reported as actually executed:

```bash
python3 kdbx3_open.py cable73 "Liber8tion-Ops-Panel"
```

### Integrity checks during decryption

The custom reader:

1. Parsed the vault's KDBX3 header and its required cryptographic parameters.
2. Derived the database key from the recovered master password and the vault's 6,000-round AES-KDF settings.
3. Verified the **StreamStart** bytes after decryption.
4. Verified the **SHA-256 checksum of every HashedBlock** in the decrypted payload.
5. Processed protected entry fields using the vault's **Salsa20** inner stream.
6. Retrieved the password associated with the administrator entry.

These checks were reported as passing. A separate `verify.py` reader returned the same entry password.

### Clarifying the entry name

The question calls the target entry **“admin-panel.”** The actual KeePass record was reported as:

| Field | Actual value |
|---|---|
| Entry title | `Liber8tion-Ops-Panel` |
| Username | `admin` |
| Password | `R3d-Ph03n1x-99!` |

This is the vault's administrator-login entry, but its title is **not literally `admin-panel`**. The naming difference is retained in the report to avoid changing the evidence to match the question's informal wording.

**Q4 result: `R3d-Ph03n1x-99!`**

## 9. Final Answers and Independent Verification

| Question | Exact answer | Verification method | Reported status |
|---|---|---|---|
| **Q1** | `keepass2john` | Created a `$keepass$` extraction accepted by John and Hashcat | **PASS** |
| **Q2** | `13400` | KDBX3 + AES-KDF metadata; Hashcat loaded and cracked the record | **PASS** |
| **Q3** | `cable73` | Matching John / Hashcat results; successful key derivation and StreamStart check | **PASS** |
| **Q4** | `R3d-Ph03n1x-99!` | KDBX3 integrity checks, entry decryption, second reader confirmation | **PASS** |

### Reproducibility commands

The provided package can be used to reproduce the cracking and verification in the original solver environment:

```bash
cd /home/saba/NCL_Reports/Vaulted
./crack.sh
python3 verify.py
```

The following underlying commands were reported as executed (shown together for convenient reference):

```bash
keepass2john /home/saba/Downloads/pass_medium/liber8-ops.kdbx > vault.john
cut -d: -f2- vault.john > vault.hash
python3 generate_candidates.py > candidates.txt
john --wordlist=candidates.txt --pot=vault.pot vault.john
hashcat -m 13400 -a 0 vault.hash candidates.txt
python3 kdbx3_open.py cable73 "Liber8tion-Ops-Panel"
```

### Saved report package

```text
/home/saba/NCL_Reports/Vaulted/
├── REPORT.md
├── hashes.txt
├── vault.john
├── vault.hash
├── codenames.txt
├── generate_candidates.py
├── crack.sh
├── kdbx3_open.py
├── verify.py
├── cracking_output.txt
└── verification_output.txt
```

**Environment limitation:** This standalone Markdown writeup was assembled from the solver's supplied completion summary. The `.kdbx`, source code, and full captured logs were not uploaded to this conversation, so they were **not executed or independently inspected while preparing this copy**. Verification statuses refer to tests completed and reported by the original solver. The full scripts and raw execution evidence remain in the original package.

## 10. Lessons Learned and Security Implications

### 1. Choose the cracking mode from the actual database

`.kdbx` is a container extension, not a unique hash algorithm. Inspect the vault version and KDF rather than selecting a Hashcat mode from the extension alone.

### 2. A strong vault design cannot compensate for a predictable master password

The database used encryption and a KDF, yet the known pattern `<codename><1..9999>` sharply reduced the candidate search space. `cable73` was straightforward to recover once the codenames and password pattern were known.

### 3. Targeted wordlists beat unfocused brute force

The chat clue directly identified the base words and numeric suffix bounds. Enumerating those candidates avoided unrelated guesses and made a verification-driven attack feasible.

### 4. Use independent tools for confidence

John and Hashcat agreed on the master password. The separately implemented KDBX3 verification then confirmed that it actually decrypted the database. This layered evidence reduces the risk of misreading a cracking result.

### 5. Verify decrypted content cryptographically

Checking the StreamStart bytes and per-block SHA-256 digests strengthened the conclusion that the decrypted vault was intact. Independently retrieving the administrator entry provided further confidence in Q4.

### 6. Preserve exact entry names and exact password characters

The administrator entry's real title was `Liber8tion-Ops-Panel`, and its password contains uppercase, lowercase, digits, hyphens, and `!`. Those details must be transcribed precisely.

### 7. Keep reproducibility separate from claims of execution

The extracted hash, generator, custom vault parser, verifier, and captured output were saved together. At the same time, the report distinguishes directly reported execution from details not visible in this conversation.

---

## Challenge Completion Summary

**Vaulted (Medium) — 70/70 possible points solved at the technical level.**

```text
Q1: keepass2john
Q2: 13400
Q3: cable73
Q4: R3d-Ph03n1x-99!
```

**Status:** Four answers recovered; the original solver reported successful cracking, vault decryption, integrity verification, and a clean reproduction from the saved project directory.

*Use the retained `cracking_output.txt`, `verification_output.txt`, and source scripts as authoritative raw evidence when publishing a portfolio version of this writeup.*
