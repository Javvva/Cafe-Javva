---
title: "Hexed (Medium)"
description: "Recover three five-character Unicode passwords from known character blocks."
category: "password-cracking"
difficulty: "medium"
status: "solved"
season: "2026 NCL Individual"
points: "45 points"
tools: ["hashcat", "python"]
---
**Category:** Password Cracking  
**Difficulty:** Medium  
**Points:** 45 (3 × 15)  
**Challenge:** Hexed  
**Result:** 3/3 passwords recovered and verified

> **Evidence scope:** This report uses the challenge prompt and execution summary supplied by the solver. The original Hashcat session, GPU, `crack.sh`, and local report directory were not accessible in this chat. Separately, all three plaintext–UTF-8–MD5 relationships were recomputed with Python during preparation of this report. Historical tool output and uninspected script contents are not invented.

## 1. Challenge Overview

Liber8tion members used **non-ASCII passwords** in the hope that Unicode characters would make conventional password cracking impractical. The task was to recover three **five-character** passwords from their hashes. The challenge accepted either the literal Unicode password or its **UTF-8 hexadecimal representation**.

The supplied hash values contained 32 hexadecimal digits each, suggesting—but not proving—MD5. The challenge notes constrained the Unicode block for each answer, making focused mask attacks possible.

## 2. Challenge Description and Objectives

The key information in the challenge was:

- **Every password has exactly five Unicode characters**, not five UTF-8 bytes.
- No numbers or special characters are used.
- Q1 draws from **Armenian**.
- Q2 draws from **Hiragana**.
- Q3 draws from **CJK Unified Ideographs Extension D**, not the full CJK ideograph repertoire.
- Literal Unicode answers and UTF-8 hexadecimal encodings are both accepted.

**Targets:**

| Question | Character set | Target hash |
|---|---|---|
| Q1 | Armenian | `b56aff135f39eaa6273034f42509b7a2` |
| Q2 | Hiragana | `029da55dd67e981d42cd1c12416abf51` |
| Q3 | CJK Unified Ideographs Extension D | `c08c6b747f8cb943ac455c88ecd936ff` |

The objective was to recover the exact byte sequences that produce these hashes, verify the decoded five-character passwords satisfy the charset rules, and document a reproducible cracking process.

## 3. Supplied Hashes and Character-Set Constraints

The three target strings are 128-bit hexadecimal digests. Unlike traditional ASCII passwords, Unicode characters are encoded to multiple bytes in UTF-8:

| Question | Unicode range of the answer | UTF-8 bytes per character | Bytes for five characters |
|---|---|---:|---:|
| Q1 | Armenian, observed U+0570–U+057D | 2 | 10 |
| Q2 | Hiragana, observed U+3046–U+3085 | 3 | 15 |
| Q3 | CJK Extension D, U+2B740–U+2B81D | 4 | 20 |

The Q3 allowed set contains **222 assigned Extension D ideographs** (Unicode U+2B740 through U+2B81D), corresponding to `222^5 = 539,218,609,632` potential five-character passwords if enumerating only that exact set. The executed **byte-oriented mask**, however, searched a **superset** of that range. Its Q3 search space was `256^5 = 1,099,511,627,776` candidates.

> **Important distinction:** A 20-byte UTF-8 string can still represent exactly five Unicode code points. Conversely, a mask that generates valid-looking UTF-8 byte patterns can include non-letter or out-of-block characters; recovered answers therefore require explicit Unicode membership checks.

## 4. Hash Algorithm Identification

All three hashes were 32 hexadecimal characters long, so **MD5 (Hashcat mode `0`)** was tested. Length alone cannot uniquely identify the algorithm; the decisive confirmation came after recovered candidates recomputed to the exact supplied digests using:

```python
import hashlib
hashlib.md5(password.encode("utf-8")).hexdigest()
```

Every target matched using ordinary MD5 of the UTF-8 bytes. No Unicode normalization, transliteration, or character-encoding conversion was required.

**Cracking tool reported:** Hashcat GPU mask mode (`-m 0 -a 3`) with `--hex-charset`.

## 5. Unicode and UTF-8 Technical Analysis

Hashcat masks in this attack were constructed around **UTF-8 byte positions**, rather than treating one mask token as one entire Unicode character.

Examples of recovered encodings:

```text
Q1: հոսող            -> d5 b0 d5 b8 d5 bd d5 b8 d5 b2   (10 bytes)
Q2: しゅうごう        -> e3 81 97 e3 82 85 e3 81 86 e3 81 94 e3 81 86   (15 bytes)
Q3: 𫝰𫟡𫝩𫟃𫞝      -> f0 ab 9d b0 f0 ab 9f a1 f0 ab 9d a9 f0 ab 9f 83 f0 ab 9e 9d (20 bytes)
```

The byte-position constraints were:

- **Armenian:** lead byte from `d4 d5 d6`; continuation byte from `80` through `bf`.
- **Hiragana:** first byte `e3`; second byte `81` or `82`; third byte from `80` through `bf`.
- **CJK Extension D:** first two bytes `f0 ab`; third byte from `9d 9e 9f a0`; fourth byte from `80` through `bf`.

These masks were intentionally a **tight superset** of the actual allowed letter sets. They make GPU search practical, and final validation rules out out-of-range or invalid recovered text. In particular, not every string generated by the masks necessarily satisfies the challenge's charset constraints.

## 6. Character-Set Generation and Keyspace Design

The solver reports using `generate_charsets.py` to produce exact letter lists and show UTF-8 byte structure. The Hashcat attack then used the more convenient byte-position masks shown below.

To build the shared UTF-8 continuation-byte charset:

```bash
TAIL=$(python3 -c "print(''.join('%02x'%b for b in range(0x80,0xc0)))")
```

That outputs the hexadecimal byte values `80` to `bf` inclusive, **64 options**.

| Mask | Possible byte patterns per Unicode character | Five-position mask size |
|---|---:|---:|
| Q1: 3 lead × 64 continuation | 192 | `192^5 = 260,919,263,232` |
| Q2: 1 lead × 2 second × 64 third | 128 | `128^5 = 34,359,738,368` |
| Q3: 1 first × 1 second × 4 third × 64 fourth | 256 | `256^5 = 1,099,511,627,776` |

These are **candidate counts**, not byte totals. Search-space values are upper bounds for the masks; they are not counts of five-letter passwords that remain valid in each Unicode block.

## 7. Password-Cracking Methodology

The reported workflow was:

1. Inspect the hash lengths and test MD5 with mode `0`.
2. Construct byte-level masks that cover the relevant UTF-8 encodings.
3. Run Hashcat on the NVIDIA GPU with `-a 3` (mask attack), `--hex-charset`, and `-O` as shown in the solver's recorded commands.
4. Stop once a target hash is found.
5. Decode the recovered hex bytes as UTF-8 and validate five Unicode code points in the correct block.
6. Independently hash the raw UTF-8 bytes using Python's `hashlib`.

The problem is a **targeted finite-keyspace search**, not a generic dictionary attack. The Unicode block restriction is the critical information that makes cracking tractable.

## 8. Actual Commands and Reported Cracking Results

The following commands are reproduced from the solver's summary of the executed workflow. The target hash files `q1.hash`, `q2.hash`, and `q3.hash` each contain the respective original target digest, one per file.

```bash
TAIL=$(python3 -c "print(''.join('%02x'%b for b in range(0x80,0xc0)))")

# Q1 — Armenian: 5 × (two-byte UTF-8 character)
hashcat -m 0 -a 3 --hex-charset \
  -1 d4d5d6 -2 "$TAIL" \
  q1.hash '?1?2?1?2?1?2?1?2?1?2' -O

# Q2 — Hiragana: 5 × (three-byte UTF-8 character)
hashcat -m 0 -a 3 --hex-charset \
  -1 e3 -2 8182 -3 "$TAIL" \
  q2.hash '?1?2?3?1?2?3?1?2?3?1?2?3?1?2?3' -O

# Q3 — CJK Unified Ideographs Extension D: 5 × (four-byte UTF-8 character)
hashcat -m 0 -a 3 --hex-charset \
  -1 f0 -2 ab -3 9d9e9fa0 -4 "$TAIL" \
  q3.hash '?1?2?3?4?1?2?3?4?1?2?3?4?1?2?3?4?1?2?3?4' -O
```

**Reported cracking environment:**

| Component | Reported value |
|---|---|
| GPU | NVIDIA GeForce RTX 5080, 16 GB |
| NVIDIA driver | 621.14 |
| CPU | Intel Core Ultra 9 285K; 12 threads reported |
| MD5 rate | Approximately 51 GH/s |
| Q3 observation | Recovered at 45.79% of the approximately 1.1-trillion-candidate mask space |

These performance figures are **solver-reported**, not independently benchmarked during report preparation. The available summary does not contain full original Hashcat status logs or a recorded total runtime.

**Recovered passwords:**

| Q | Unicode password | UTF-8 hexadecimal |
|---|---|---|
| Q1 | `հոսող` | `d5b0d5b8d5bdd5b8d5b2` |
| Q2 | `しゅうごう` | `e38197e38285e38186e38194e38186` |
| Q3 | `𫝰𫟡𫝩𫟃𫞝` | `f0ab9db0f0ab9fa1f0ab9da9f0ab9f83f0ab9e9d` |

**Troubleshooting / correctness note:** The byte masks include a few characters outside the named blocks. This is acceptable for **search**, but the found password must still pass a separate block-membership and Unicode-letter test. The Hiragana password includes the small character `ゅ` (U+3085), which is a valid letter, not punctuation.

## 9. Final Answers and Independent Verification

All three plaintexts were independently checked with Python `hashlib` during preparation of this report. Each:

- Has **exactly five Unicode code points**.
- Has the expected UTF-8 hexadecimal representation.
- Round-trips from bytes back to the identical Unicode string.
- Contains only Unicode letters (`Ll` for Q1, `Lo` for Q2 and Q3).
- Uses characters from its specified block.
- Produces the exact original MD5 digest.

### Q1 — Armenian

```text
Password:        հոսող
Code points:     U+0570 U+0578 U+057D U+0578 U+0572
UTF-8 hex:       d5b0d5b8d5bdd5b8d5b2
Original MD5:    b56aff135f39eaa6273034f42509b7a2
Recomputed MD5:  b56aff135f39eaa6273034f42509b7a2
Match:           YES
```

### Q2 — Hiragana

```text
Password:        しゅうごう
Code points:     U+3057 U+3085 U+3046 U+3054 U+3046
UTF-8 hex:       e38197e38285e38186e38194e38186
Original MD5:    029da55dd67e981d42cd1c12416abf51
Recomputed MD5:  029da55dd67e981d42cd1c12416abf51
Match:           YES
```

### Q3 — CJK Extension D

```text
Password:        𫝰𫟡𫝩𫟃𫞝
Code points:     U+2B770 U+2B7E1 U+2B769 U+2B7C3 U+2B79D
UTF-8 hex:       f0ab9db0f0ab9fa1f0ab9da9f0ab9f83f0ab9e9d
Original MD5:    c08c6b747f8cb943ac455c88ecd936ff
Recomputed MD5:  c08c6b747f8cb943ac455c88ecd936ff
Match:           YES
```

### Standalone verification script

The following independent script can be saved as `verify.py`. It uses only Python's standard library and does **not** depend on Hashcat or the solver's cracking implementation.

```python
import hashlib
import unicodedata

targets = [
    ("Q1", "հոսող", "d5b0d5b8d5bdd5b8d5b2",
     "b56aff135f39eaa6273034f42509b7a2", 0x0530, 0x058F),
    ("Q2", "しゅうごう", "e38197e38285e38186e38194e38186",
     "029da55dd67e981d42cd1c12416abf51", 0x3040, 0x309F),
    ("Q3", "𫝰𫟡𫝩𫟃𫞝",
     "f0ab9db0f0ab9fa1f0ab9da9f0ab9f83f0ab9e9d",
     "c08c6b747f8cb943ac455c88ecd936ff", 0x2B740, 0x2B81D),
]

for question, password, expected_hex, expected_hash, lo, hi in targets:
    raw = password.encode("utf-8")
    checks = {
        "five_codepoints": len(password) == 5,
        "correct_block": all(lo <= ord(c) <= hi for c in password),
        "letters_only": all(unicodedata.category(c).startswith("L") for c in password),
        "utf8_hex_matches": raw.hex() == expected_hex,
        "utf8_roundtrip": bytes.fromhex(expected_hex).decode("utf-8") == password,
        "md5_matches": hashlib.md5(raw).hexdigest() == expected_hash,
    }
    print(question, "MATCH=YES" if all(checks.values()) else "MATCH=NO", checks)
    assert all(checks.values()), f"Verification failed for {question}"

print("ALL VERIFIED: YES")
```

**Result of independent recomputation:** `MATCH=YES` for Q1, Q2, and Q3; all checks passed.

## 10. Lessons Learned and Security Implications

1. **Unicode characters are not bytes.** A five-character Unicode password might occupy 10, 15, or 20 bytes in UTF-8, depending on the script.
2. **UTF-8 structure can narrow search dramatically.** Known leading bytes and continuation-byte ranges allow tightly constrained byte-level masks.
3. **Precise challenge hints matter.** Restricting Q3 to Extension D avoids an otherwise impractically broad CJK search.
4. **The mask need not be a perfect character-set enumerator.** A GPU-friendly superset can be fast, provided every match is validated against the exact Unicode requirement afterward.
5. **Hash length is a clue, not proof of algorithm.** Confirm the candidate hash type by recomputing it against recovered plaintext.
6. **Encoding consistency is essential.** The MD5 input here is the actual UTF-8 byte sequence, not code-point numbers, UTF-16, or the literal ASCII text of the hexadecimal representation.
7. **Unicode does not make a short password intrinsically resistant to offline guessing.** A short password from a predictable, disclosed character set remains vulnerable—especially when stored as fast, unsalted MD5.
8. **Submission robustness:** UTF-8 hex avoids unsupported glyphs and copy/paste issues, which is why it is the preferred challenge submission format.

### Reproduction directory

The solver reports that the original package is located at:

```text
/home/saba/NCL_Reports/Hexed/
├── REPORT.md
├── hashes.txt
├── generate_charsets.py
├── crack.sh
├── verify.py
└── [charset files, hash inputs, captured output, and Hashcat potfile as generated]
```

The full directory was not available for inspection here, so the bracketed items are descriptive rather than a claimed complete file inventory.

**Reported replay commands:**

```bash
cd /home/saba/NCL_Reports/Hexed
python3 generate_charsets.py
./crack.sh
python3 verify.py
```

The original solver reports that this process recovers all three passwords and independently verifies them. The verification code in Section 9 offers a second, standalone check that does not require GPU execution.

---

**Final result:** **3/3 recovered**, **45/45 challenge points available**. The independent hash and Unicode checks confirm that the three answers are valid for the supplied targets. This does not independently establish whether the answers were submitted to the NCL platform.
