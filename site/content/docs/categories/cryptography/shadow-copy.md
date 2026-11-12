---
title: "Shadow Copy (Medium)"
description: "Recover a reference code from AES-CTR keystream reuse without finding the key."
category: "cryptography"
difficulty: "medium"
status: "partial"
season: "2026 NCL Individual"
points: "70 points"
tools: ["python"]
---
> **Category:** Cryptography  
> **Challenge:** Shadow Copy (Medium)  
> **Points:** 70  
> **Environment:** Linux terminal, `player@shadow`  
> **Recovered reference:** `SKY-QQVM-4821`  
> **Result status:** Recovered from challenge data and consistent with the stated format; **no challenge-platform acceptance message was provided**.

---

## 1. Executive summary

The challenge simulated ransomware that encrypted a company file share, including a disaster-recovery pack. The ransomware used AES in counter (CTR) mode, but for each 256-byte piece it chose the first counter block from a **15-byte fixed value plus a separately selected one-byte value**. This made reuse or overlap of AES-CTR keystream likely across different encrypted pieces.

We exploited **known plaintext + CTR keystream reuse** to reconstruct a two-part reference in `incident_pack.zip.enc`:

- **Part 1 (first 256-byte piece):** `SKY-QQVM`
- **Part 2 (second 256-byte piece):** `4821`
- **Combined answer:** `SKY-QQVM-4821`

The final prefix was verified by a direct three-way XOR of ciphertext from the incident pack, ciphertext from a weekly status document, and original plaintext found in a surviving laptop fragment. The suffix appeared in a recovered continuation sheet. The assembled answer contains no zeroes.

**Core lesson:** Strong AES encryption can be undermined if CTR keystream is reused. It is not necessary to recover the AES key if the same keystream encrypts two pieces and one plaintext is known.

## 2. Challenge statement and clues

The scenario described ransomware named *Liber8tion*. A folder of encrypted files survived, but the encryption key did not. A short fragment from an older laptop document was available.

Helpdesk's observations:

1. Files were split into **256-byte pieces**.
2. Each piece was encrypted independently with **AES-CTR**.
3. The counter block consisted of a **15-byte constant plus one final byte**.
4. The final byte was selected separately for each piece, **not sequentially across pieces**.
5. Once a piece started encrypting, the counter advanced during encryption.

The answer format was `SKY-ABCD-1234`, and the correct reference was explicitly said to contain **no digit `0`**.

### Why the counter design matters

AES-CTR generates keystream in 16-byte AES blocks. A 256-byte piece consumes up to:

\[
256 / 16 = 16 \text{ AES blocks}.
\]

There are only 256 possibilities for the *initial* last-byte value (0–255). Many independently chosen pieces can therefore have overlapping keystream ranges under the same key and constant counter prefix. The challenge's actual ciphertexts exhibited overlaps; the exploit does **not** depend on learning the AES key.

**Caveat:** Whether a particular implementation increments only the last counter byte or carries into preceding bytes on wraparound affects the exact sequence at the boundary. The practical attack below uses verified overlaps between actual ciphertext pieces rather than assuming a complete 4,096-byte cyclic stream is universally valid.

## 3. Files and working environment

The terminal was at `/home/player`. It contained:

```text
/home/player/
├── backups/
│   └── laptop_fragment.bin             (120 bytes; surviving plaintext)
└── recovered/
    ├── incident_pack.zip.enc           (512 bytes; main target)
    ├── weekly_status_update.txt.enc    (256 bytes; known-plaintext partner)
    ├── partial_decryption.txt          (pre-existing partial text output)
    ├── dr_test_report.txt.enc          (256 bytes; decoy)
    ├── lessons_learned_draft.txt.enc   (256 bytes; decoy)
    ├── tabletop_exercise.txt.enc       (256 bytes; decoy)
    ├── report_000.csv.enc              (CSV keystream-alignment aid)
    └── ...                             (other encrypted documents)
```

There were **100 `.enc` files**, comprising **328 encryption pieces** according to the first solver's output. Python 3.13.5, `xxd`, `file`, and OpenSSL were installed; **`find` was not installed**.

Quick inventory commands that worked:

```bash
pwd
ls -lah backups/ recovered/
ls -laR backups/ recovered/
python3 --version
xxd -g 1 backups/laptop_fragment.bin
cat recovered/partial_decryption.txt
```

For a minimal Python inventory when `find` is unavailable:

```bash
python3 - <<'PY'
from pathlib import Path
for folder in ("backups", "recovered"):
    for p in sorted(Path(folder).rglob("*")):
        if p.is_file():
            print(p, p.stat().st_size, "bytes")
PY
```

## 4. Cryptography: why XOR recovers plaintext

Encryption in CTR mode is a XOR with a pseudorandom keystream:

\[
C = P \oplus K.
\]

For two ciphertext segments using the **same aligned keystream**, we have:

\[
C_1 = P_1 \oplus K,\qquad C_2 = P_2 \oplus K.
\]

XOR the ciphertexts:

\[
C_1 \oplus C_2 = P_1 \oplus P_2.
\]

If we know \(P_2\), then:

\[
\boxed{P_1 = C_1 \oplus C_2 \oplus P_2.}
\]

This is the entire basis of the final recovery. No brute force against AES was involved.

### Distinguish the different kinds of evidence

- **Directly decrypted:** Bytes calculated with the XOR formula using a known, verified plaintext segment.
- **Recovered by alignment / crib dragging:** Candidate bytes from a hypothesis about the source text and keystream offset; must be validated against coherent text.
- **Statistically guessed:** Bytes generated by frequency or printability scoring; **not** proof of a flag.
- **Challenge-platform verified:** A submission accepted as correct. **Not observed in this conversation**.

## 5. Discovery and investigation chronology

### 5.1. Read the surviving evidence

`backups/laptop_fragment.bin` was ASCII text. The useful surviving section included:

```text
CSV exports: id,name,status; rows like 7,item-007,open (or closed, pending)
Overall status
```

The beginning of the fragment was cut off and had an anomalous draft line, so we used only the intact CSV section for the final known-plaintext attack.

`recovered/partial_decryption.txt` contained previously recovered excerpts of several encrypted files. In particular it showed the following *decoy* references:

| Reference | Context | Why not the answer |
|---|---|---|
| `SKY-DRTS-3300` | Disaster-recovery test | Test-only and contains zeroes |
| `SKY-LL24-9090` | Previous incident | Old reference and contains zeroes |
| `SKY-EXER-0001` | Tabletop exercise | Exercise-only and contains zeroes |

The same pre-existing partial text identified a **continuation sheet** in the second piece of `incident_pack.zip.enc`; the ending was not fully visible at that stage.

### 5.2. First keystream-recovery pass

An initial Python solver grouped encrypted 256-byte pieces by potential overlapping AES-CTR keystream and seeded recovered key bytes from known document prefixes.

Its output included:

```text
Files: 100 chunks: 328 aligned chunks: 25
Known keystream bytes: 153 /4096, contradictions: 0
```

The first piece of `incident_pack.zip.enc` was still opaque, but the second piece produced the meaningful excerpt:

```text
Continuation sheet.
Reminder to follow up with the vendor about the renewal.
The migration
part 2 of 2, join with '-': 4821
```

This revealed **Part 2 = `4821`**. The incomplete script also printed speculative *GUESSED* text; we did not use guessed bytes to justify the final flag.

### 5.3. High-bit matching: identify candidate keystream partners

Because ordinary ASCII bytes have their high bit cleared, for plaintext bytes below 128:

\[
\operatorname{MSB}(C) = \operatorname{MSB}(K).
\]

Comparing the most significant bits of ciphertext is therefore a useful way to **screen** for reused or shifted keystream positions across ASCII documents, even before decrypting them.

The first incident-pack piece produced these prominent candidate matches:

| Other encrypted file | Piece offset | Counter-block shift | High-bit matches |
|---|---:|---:|---:|
| `report_000.csv.enc` | 256 | −3 | 205/208 (98.6%) |
| `incident_draft_2.txt.enc` | 0 | +4 | 189/192 (98.4%) |
| `vendor_ticket_118.txt.enc` | 0 | +4 | 189/192 (98.4%) |
| `audit_2025_summary.txt.enc` | 0 | +4 | 189/192 (98.4%) |
| `weekly_status_update.txt.enc` | 0 | +4 | Strong overlapping pattern |

**Important:** A high match rate is evidence for a useful hypothesis, not itself a cryptographic proof. Binary bytes, non-ASCII text, or incorrect alignment can cause mismatches. We subsequently validated with meaningful plaintext.

### 5.4. Crib dragging with predictable CSV structure

The CSV files had predictable rows, including identifiers such as `18,item-018,pending`. Testing possible `open` / `closed` / `pending` statuses against the incident-pack ciphertext recovered coherent text:

```text
Incident reference sheet.
Reminder to follow up with the vendor about the renewal.
The migration is scheduled for next weekend.
Please review the attached
part 1 of 2:
```

A useful alignment was:

- `incident_pack.zip.enc` first piece, **target offset 43**
- `report_000.csv.enc` second piece, **source offset 91 within that 256-byte piece**
- Hence source absolute byte offset `256 + 91 = 347`
- The offset difference was `43 − 91 = −48` bytes, or **−3 AES blocks**.

Candidate CSV rows around 18–25 enabled reconstruction through most of the target's first piece, but the important bytes after `part 1 of 2:` were still missing.

### 5.5. Recover another document to find the precise final overlap

Using bytes already recovered from the incident pack, we partially decrypted several other encrypted text files.

Most importantly, the recovered plaintext of `weekly_status_update.txt.enc` contained the same CSV description as `backups/laptop_fragment.bin`:

```text
Onboarding docs still need a pass before the new hire starts.
Please review the attached numbers before Friday.
Draft agenda for
CSV exports: i...
```

That linked the **surviving plaintext fragment** to a specific **encrypted document**.

The relevant final alignment was:

| Data source | Byte range | Length |
|---|---|---:|
| `incident_pack.zip.enc` | `194:256` | 62 bytes |
| `weekly_status_update.txt.enc` | `130:192` | 62 bytes |
| Laptop fragment starting at `CSV exports:` | First 62 bytes | 62 bytes |

Both ciphertext segments were aligned to the same keystream positions, so we could directly recover the incident-pack plaintext using the known weekly-status text.

## 6. Final reproduction: recover Part 1

Run this from `/home/player` in the CTF terminal:

```bash
python3 - <<'PY'
from pathlib import Path
import re

root = Path.home()
incident = (root / "recovered/incident_pack.zip.enc").read_bytes()
weekly = (root / "recovered/weekly_status_update.txt.enc").read_bytes()
fragment = (root / "backups/laptop_fragment.bin").read_bytes()

# Only use the intact part of the surviving fragment.
known = fragment[fragment.index(b"CSV exports:"):]

# C_incident XOR C_weekly XOR P_weekly = P_incident
part1_plain = bytes(
    a ^ b ^ p
    for a, b, p in zip(
        incident[194:256],
        weekly[130:192],
        known
    )
)

print(repr(part1_plain))
assert part1_plain.startswith(b"\npart 1 of 2: SKY-")

match = re.search(rb"SKY-[A-Z1-9]{4}", part1_plain)
assert match, "Flag prefix not found"
prefix = match.group().decode("ascii")
print("Part 1:", prefix)
print("Full reference (using recovered Part 2):", prefix + "-4821")
PY
```

Observed key output:

```text
b'\npart 1 of 2: SKY-QQVM\nPK\x03\x04...part2.txt'
Part 1: SKY-QQVM
Full reference (using recovered Part 2): SKY-QQVM-4821
```

The `PK\x03\x04` sequence after `SKY-QQVM` is a recognizable ZIP local-file signature, and `part2.txt` appears shortly afterward. These bytes corroborate that the decrypted data is meaningful binary/text content, rather than a coincidental printable string.

**Why this is stronger than a score:** It recovered a coherent labeled reference, the expected `SKY-` prefix, and a ZIP structure from an **independent known plaintext source**.

### Short interactive-Python version (for terminals that cannot paste multiline blocks)

Enter `python3`, then type the lines one by one:

```python
from pathlib import Path as P
t=P('recovered/incident_pack.zip.enc').read_bytes()
w=P('recovered/weekly_status_update.txt.enc').read_bytes()
f=P('backups/laptop_fragment.bin').read_bytes()
f=f[f.index(b'CSV exports:'):]
p=bytes(x^y^z for x,y,z in zip(t[194:256],w[130:192],f))
print(p)
```

This was the form that ultimately worked in the challenge terminal.

## 7. Final recovery reference

```text
SKY-QQVM-4821
```

| Verification check | Outcome |
|---|---|
| Prefix from Part 1 | `SKY-QQVM` |
| Suffix from continuation sheet | `4821` |
| Joined with hyphen | `SKY-QQVM-4821` |
| Fits required `SKY-ABCD-1234` pattern | Yes |
| Contains zeroes | No |
| Accepted by challenge platform | **Not independently observed** |

## 8. What did not work, and why

1. **Assuming `find` was installed.** The container returned `bash: find: command not found`; using `ls -laR` or `Path.rglob()` solved inventory without package installation.
2. **Trying to read encrypted bytes as text.** `xxd` showed high-entropy ciphertext; it cannot be interpreted directly.
3. **Relying on old references.** Several `SKY-...` strings were decoys and contained zeroes.
4. **Treating the best high-bit alignment as confirmed.** A high match score was only a way to choose targets for crib dragging.
5. **Using statistical plaintext guesses as evidence.** The first solver displayed `GUESSED` text that was not reliable enough for submitting a flag.
6. **Stopping after partial plaintext.** The CSV crib recovered `part 1 of 2:` but not the reference immediately following it. The laptop fragment provided the missing independent known plaintext.
7. **Pasting a large script into an awkward browser terminal.** A short interactive Python program was more robust.

## 9. Reusable playbook for similar CTF challenges

### A. Triage

- Read the challenge's exact encryption description: mode, nonce/counter layout, chunk size, IV handling, and file boundaries.
- Inventory all files and sizes; identify unencrypted fragments and outputs from previous work.
- Examine a few relevant files with `file`, `xxd`, and `cat` (where appropriate).
- Search for file formats with predictable plaintext: CSV headers/rows, JSON, log timestamps, ZIP/GZIP headers, standard document introductions.

### B. Model the keystream

- For CTR, write down `C = P XOR K`.
- Determine the AES block size (16 bytes), piece length (256 bytes), and counter initialization behavior.
- Expect potential overlap if the nonce/counter starting space is too small or reused.
- **Do not assume byte offsets are the same across files.** Search for 16-byte-block shifts and validate alignment.

### C. Find and test overlaps

- For largely ASCII documents, screen candidate alignments using ciphertext high-bit similarity.
- Try **crib dragging**: suppose one side says `Reminder to follow up ...` or `id,name,status\n`; XOR and inspect the other side.
- Confirm candidates with several independent words and structural features, not merely a readable word.
- Recover known keystream bytes and propagate them across other overlapping ciphertext segments.

### D. Establish the flag

- Track which bytes are exact, crib-derived, or guessed.
- Look for split-document instructions (`part 1 of 2`, `join with '-'`).
- Validate the candidate against the stated flag format and special constraints.
- Prefer a single well-supported submission over trial-and-error guesses.

### E. Save reusable evidence during the event

For each useful plaintext match, record:

```text
Target file:
Target offset:
Source file:
Source offset:
Known plaintext:
Alignment validation:
Recovered text:
Confidence: exact / crib-validated / statistical guess
```

This makes it easier to reproduce results, debug offset mistakes, and share work with teammates.

## 10. Further learning

**Concepts to study:**

- AES-CTR nonce/counter uniqueness
- Two-time-pad and many-time-pad attacks
- XOR algebra and keystream recovery
- Crib dragging with known plaintext
- Known file signatures (`PK\x03\x04`, GZIP magic bytes, CSV headers)
- Counter alignment in 16-byte blocks
- Distinguishing cryptographic verification from statistical language scoring

**Defensive lesson:** Never reuse a CTR keystream under the same key. Use a properly designed unique nonce/counter scheme per encryption and, for real-world file encryption, prefer an authenticated-encryption construction with securely managed nonces. Randomness from a tiny one-byte starting-counter space is not a safe substitute for nonce uniqueness.

---

## 11. One-minute competition reminder

> **Pattern to recognize:** AES-CTR + repeated fixed nonce prefix + small/random counter suffix + multiple files + surviving plaintext.  
> **Attack:** Identify aligned keystream reuse, compute `P_target = C_target XOR C_known XOR P_known`, then verify structure and extract the flag.  
> **This case:** `incident[194:256] XOR weekly[130:192] XOR laptop_csv_fragment` → `SKY-QQVM`; continuation sheet → `4821`.  
> **Result:** `SKY-QQVM-4821` (recovered; platform acceptance not shown).

*Prepared from the challenge statement, terminal transcripts, encrypted-file names and offsets, solver outputs, and final recovered plaintext provided in this conversation.*
