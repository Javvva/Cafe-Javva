---
title: "Unknowns (Easy)"
description: "Identify four odd hash lengths and crack them with a short wordlist instead of a long brute force."
category: "password-cracking"
difficulty: "easy"
status: "solved"
season: "2026 NCL Individual"
points: "45 points"
tools: ["mdxfind", "hashcat", "john"]
---
> **Category:** Cryptography / Hash Cracking  
> **Difficulty:** Easy  
> **Points:** 45 (Q1: 10, Q2: 10, Q3: 10, Q4: 15)  
> **Status:** Solved — all four answers reported verified  
> **Source:** Challenge screenshot and subsequent solver handoff  
> **Writeup prepared:** 2026-11-06

## 1. Challenge Overview

**Challenge title:** *Unknowns*

**Cyber Command — original prompt (transcribed from the provided screenshot):**

> We have a handful of hashes the team hasn't been able to identify or crack using hashcat or john. We're confident that rockyou should work...but hashcat can't identify the hashes properly to crack them. We've heard that maybe mdxfind can do the trick? Download the hashes and see what you can do.

**Challenge note:**

> Any individual password in this challenge should not take long. If you're waiting minutes for it to crack you're going the wrong way.

**Objective:** Determine the plaintext password corresponding to each of four hexadecimal hashes. The main challenge is choosing the correct hash algorithms or repeated-hashing behavior, rather than using an expensive brute-force attack.

## 2. Supplied Hashes

| Question | Points | Original hash | Hex characters |
|---|---:|---|---:|
| Q1 | 10 | `111d47729ebecd8bc14e894591f173b9a9fa9e9495eb7466` | 48 |
| Q2 | 10 | `df2921ceb14a7687c59b2d13c6caf497` | 32 |
| Q3 | 10 | `efa7b9920c5a91d9425fc13ce67a49b078fe3ea5f5057fd7ba61f27dfc53ec20` | 64 |
| Q4 | 15 | `9e4c96757d3436b101f8c92e160aef4b` | 32 |

The downloaded input was reportedly saved as `hashes.txt`. The file's contents were conveyed in the screenshot and solver handoff; the original downloaded file was not uploaded with this conversation.

## 3. Initial Analysis

The hashes are hexadecimal strings, but **their lengths alone cannot establish their algorithms**:

- A 48-character hexadecimal output represents 192 bits and is consistent with Tiger-192, among other possibilities.
- A 32-character output represents 128 bits. It could be MD5, MD4, NTLM, HAVAL-128, or the result of repeated MD5.
- A 64-character output represents 256 bits. It could be SHA-256, SHA3-256, Snefru-256, or something else.

The challenge prompt named **`rockyou`** and **`mdxfind`**, strongly suggesting a dictionary-based multi-algorithm search. Conventional hash identification based solely on digest size would be insufficient.

## 4. Tools and Approach

### Tools reportedly used

| Tool | Role | Execution status |
|---|---|---|
| John the Ripper Jumbo | Cracked Q1 using Tiger and Q3 using Snefru-256 | **Executed**, per solver handoff |
| `rockyou.txt` | Dictionary of password candidates | **Used**, per solver handoff |
| Python 3 | Custom HAVAL implementation, dictionary testing, five-round MD5, and checks | **Executed**, per solver handoff |
| `mdxfind` | Multi-algorithm hash search suggested by challenge | **Not executed**; unavailable in the solver's sandbox |
| Hashcat | Mentioned in challenge description | **No successful execution reported** |

Operating system versions, John version, Python version, and original command transcripts are not included in the information supplied here. The external solver reports that actual John status/rate output is retained in its `REPORT.md`; that file has not been provided directly to this writer.

### Approach in brief

1. Store the four hashes and check their digest lengths.
2. Use `rockyou.txt` as the candidate wordlist.
3. Test uncommon digest algorithms rather than relying on generic MD5/SHA auto-identification.
4. For Q1 and Q3, use named formats in John the Ripper.
5. For Q2, implement and validate HAVAL with the correct output size and pass count.
6. For Q4, test repeated MD5, with each round digesting the **ASCII hexadecimal output** of the previous round.
7. Recompute or verify each result against the complete target digest.

## 5. Question-by-Question Solution

### Q1 — Tiger-192

- **Target:** `111d47729ebecd8bc14e894591f173b9a9fa9e9495eb7466`
- **Digest size:** 192 bits
- **Identified algorithm:** Tiger-192
- **Recovered password:** `cuteme`
- **Successful method:** John the Ripper Jumbo with `--format=Tiger` against the `rockyou` dictionary.
- **Reported verification:** Tiger(`cuteme`) equals the full target digest.

A general *reproduction example* (not claimed to be the exact original terminal command):

```bash
printf '%s\n' '111d47729ebecd8bc14e894591f173b9a9fa9e9495eb7466' > q1_tiger.txt
john --format=Tiger --wordlist=/usr/share/wordlists/rockyou.txt q1_tiger.txt
john --show --format=Tiger q1_tiger.txt
```

### Q2 — HAVAL-128, 3 passes

- **Target:** `df2921ceb14a7687c59b2d13c6caf497`
- **Digest size:** 128 bits
- **Identified algorithm:** HAVAL-128-3 (128-bit output, three passes)
- **Recovered password:** `chiqui`
- **Successful method:** Custom Python implementation of HAVAL-128-3 and a `rockyou.txt` dictionary scan.
- **Reported verification:** HAVAL-128-3(`chiqui`) equals the full target digest.

The solver reports validating the HAVAL implementation against **six official empty-string test vectors**: 128-bit and 256-bit output lengths across each of the 3-, 4-, and 5-pass variants. A first implementation failed 4-/5-pass vector checks; the correction concerned HAVAL's pass-count-dependent **Fphi permutations**.

Relevant original implementation files were reportedly saved as `haval.py`, `piwords.json`, `pi_const.py`, and `crack_haval.py`. Those file contents have **not** been shared here, so they are not reproduced or independently code-reviewed in this report.

### Q3 — Snefru-256

- **Target:** `efa7b9920c5a91d9425fc13ce67a49b078fe3ea5f5057fd7ba61f27dfc53ec20`
- **Digest size:** 256 bits
- **Identified algorithm:** Snefru-256
- **Recovered password:** `slbenfica`
- **Successful method:** John the Ripper Jumbo with `--format=Snefru-256` against `rockyou`.
- **Reported verification:** Snefru-256(`slbenfica`) equals the full target digest.

A general *reproduction example* (not a verbatim original transcript):

```bash
printf '%s\n' 'efa7b9920c5a91d9425fc13ce67a49b078fe3ea5f5057fd7ba61f27dfc53ec20' > q3_snefru.txt
john --format=Snefru-256 --wordlist=/usr/share/wordlists/rockyou.txt q3_snefru.txt
john --show --format=Snefru-256 q3_snefru.txt
```

### Q4 — MD5 iterated five times, ASCII-hex chaining

- **Target:** `9e4c96757d3436b101f8c92e160aef4b`
- **Digest size:** 128 bits
- **Identified construction:** MD5 iterated 5 times, labeled `MD5x05` by `mdxfind`
- **Recovered password:** `lisseth`
- **Successful method:** Python `hashlib.md5` wordlist scan with five rounds of hexadecimal-string chaining.
- **Verification:** The five-round chain was independently recomputed when preparing this summary and **exactly matches** the target.

The recurrence is:

```text
h1 = MD5("lisseth").hexdigest()
h2 = MD5(h1.encode("ascii")).hexdigest()
h3 = MD5(h2.encode("ascii")).hexdigest()
h4 = MD5(h3.encode("ascii")).hexdigest()
h5 = MD5(h4.encode("ascii")).hexdigest()
```

**Independently reproduced intermediate values:**

| Round | Hex digest |
|---:|---|
| 1 | `dba708f96ca6d1d23aa3bdb1f14f3e6d` |
| 2 | `8b431c7933a2e81ef927a411c76ceb79` |
| 3 | `23ec1f12f0792a8f209c7bfbf74e6f1e` |
| 4 | `843a18254d903aa3c80b26580f18e83a` |
| 5 | `9e4c96757d3436b101f8c92e160aef4b` |

Standalone independent check:

```bash
python3 - <<'PY'
import hashlib
h = "lisseth"
for round_no in range(1, 6):
    h = hashlib.md5(h.encode("ascii")).hexdigest()
    print(f"round {round_no}: {h}")
assert h == "9e4c96757d3436b101f8c92e160aef4b"
print("Q4 verified")
PY
```

**Important distinction:** Hashing the ASCII *hexadecimal digest* in later rounds is **not the same** as hashing the raw 16-byte MD5 digest.

## 6. Reproducibility Package

The external solver reported creating the following files on its own machine at:

`/home/saba/NCL_Reports/Unknowns/`

```text
Unknowns/
├── REPORT.md          # Full solver-authored writeup and original session evidence
├── hashes.txt         # Four target hashes
├── haval.py           # HAVAL implementation and vector tests
├── piwords.json       # HAVAL π-derived constants/data
├── pi_const.py        # HAVAL constants support
├── crack_haval.py     # Custom Q2 password search
├── crack_md5x5.py     # Custom Q4 password search
├── verify_all.py      # Verifier for Q1, Q2, and Q4
└── verify.sh          # John-based verifier for Q1 and Q3
```

The following commands were **reported as successfully re-run from that folder**:

```bash
cd /home/saba/NCL_Reports/Unknowns
python3 haval.py
python3 verify_all.py
bash verify.sh
```

The two custom dictionary attacks can reportedly be re-run as follows (with the expected `rockyou` wordlist available in their environment):

```bash
python3 crack_haval.py
python3 crack_md5x5.py
```

**Access limitation:** The local filesystem path and actual source files are on the external solver's environment, not attached here. Their execution and contents cannot be independently inspected from this conversation. The code snippets above are the provided handoff commands, not reconstructed evidence of execution.

## 7. Intended `mdxfind` Route (Not Executed)

The challenge specifically hinted at `mdxfind`. The external solver suggested this intended command:

```bash
mdxfind -h 'ALL' -f hashes.txt /usr/share/wordlists/rockyou.txt
```

It was **not run** because `mdxfind` was unavailable and could not be built in that environment. The proposed output labels (`TIGER`, `HAVAL128_3`, `SNEFRU256`, `MD5x05`) should be treated as **expected/inferred format names**, not captured terminal output.

The report's actual recovery methods were John the Ripper for Q1/Q3 and custom Python for Q2/Q4.

## 8. Final Answers and Verification

| Q | Algorithm | Password | Verification |
|---|---|---|---|
| **Q1** | Tiger-192 | **`cuteme`** | Reported verified with John / Tiger |
| **Q2** | HAVAL-128-3 | **`chiqui`** | Reported verified with validated custom HAVAL implementation |
| **Q3** | Snefru-256 | **`slbenfica`** | Reported verified with John / Snefru-256 |
| **Q4** | MD5 × 5 (ASCII-hex chained) | **`lisseth`** | Reported verified; also independently recomputed in this writeup |

These are **passwords entered into the four answer fields**, not a single combined flag string. No flag wrapper (for example `flag{...}`) was shown in the challenge.

## 9. Lessons Learned

1. **Digest length is a clue, not proof.** Several unrelated algorithms have the same output length.
2. **Specify the algorithm rather than trusting auto-identification.** Tiger-192, HAVAL-128-3, and Snefru-256 require testing the appropriate hash format.
3. **Repeated hashing can look ordinary.** Q4 had the same 32-hex-character appearance as normal MD5, despite using five chained rounds.
4. **Chaining semantics matter.** Rehashing hexadecimal text differs from rehashing raw digest bytes.
5. **Validate custom cryptographic code.** Known-answer vectors helped catch implementation errors in the HAVAL logic before using it to validate the target.
6. **Use the challenge's time hint.** The prompt said each password should crack rapidly; this favored a correct-algorithm dictionary approach instead of broad brute force.
7. **Don't conflate the intended route with the route executed.** `mdxfind` was an explicit hint, but the recovery in this case used John and Python.

## 10. Evidence, Provenance, and Follow-up

### Evidence available in this writeup

- Original challenge screenshot and its four exact hash strings.
- Solver-reported algorithms and passwords.
- Solver-reported tool usage and package filenames.
- Q4 five-round intermediate values independently calculated for this writeup.

### Evidence available only in the external solver's package

- The complete original `REPORT.md`.
- Actual terminal transcripts (including John's rates and completion lines).
- Full source code for HAVAL and both custom dictionary scanners.
- Detailed HAVAL test-vector comparison outputs.
- Tool versions, operating-system specifics, and any other environment data recorded there.

### Integrity notes

- No fictitious cracking logs, timings, or status outputs are included here.
- The sample John commands are explicitly examples, not purported historical transcripts.
- Q1/Q2/Q3 matches are stated as **solver-reported**, since their verification environments/source files were not supplied for independent execution here.
- Q4 was independently verified through Python's standard-library MD5 implementation.
- The external solver reported that all four matches were freshly reproduced in its package folder.

### Source references

- [Debian `tcltrf` HAVAL reference implementation](https://sources.debian.org/src/tcltrf/2.1.4-dfsg3-8/generic/haval-1.1/haval.c)
- [Crypto++ HAVAL reference documentation](https://cryptopp.com/docs/ref54/class_h_a_v_a_l.html)
- [John the Ripper](https://www.openwall.com/john/)
- [mdxfind GitHub repository](https://github.com/Cynosureprime/mdxfind)

---

**Outcome:** Four of four passwords recovered, accounting for **45/45 challenge points**, subject to the reported verifications and successful challenge submission.
