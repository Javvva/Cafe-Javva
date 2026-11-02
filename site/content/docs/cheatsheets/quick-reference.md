---
title: "NCL quick reference"
description: "Commands, first checks, and the reasoning chains to remember before a team game."
---
Based on the October 23–25, 2026 chats. Use with the full study report and recovered chat archive. Historical instance values are examples, not portable credentials or offsets.

## Before the game

- Label every terminal by machine and account: Windows, local Kali, scanner, target.
- Check desktop and clipboard access, converters, wordlists, a working debugger, and actual cracking-device detection.
- Keep original challenge files separate from generated scripts and outputs.
- Assign one owner per challenge. Ask another teammate to verify a breakthrough before a submission or long compute job.
- Keep one shared note per challenge: exact questions, scope, files, attempts, confirmed answers, hypotheses, commands, output, and next test.

## First questions to ask

| Situation | First check |
|---|---|
| No hashes loaded | Is extraction output nonempty and in the expected format? |
| Cracking is slow | What algorithm, backend, device, candidate rate, and number of salts are actually active? |
| API route is 404 | Does frontend source show a version header or another routing condition? |
| 403 after discovering a hidden port | Separate transport reachability from application access control |
| Empty callback logs | Did the bot reach callback, and were response settings saved before the visit? |
| Callback runs but no token | Identify the exact capture/read stage that failed |
| Localhost scan finds nothing | Whose localhost are you scanning? |
| Sudo wrapper exists | Read its accepted arguments and allowed branches |
| Binary crashes | Inspect registers and memory before claiming controlled execution |
| Cipher self-test succeeds | Validate against independent real frames |

## Commands and what they establish

### File and hash workflow

```bash
file FILE
head -n 10 TEXT_FILE
7z l ARCHIVE
CONVERTER FILE              # Inspect errors before redirecting
CONVERTER FILE > hash.txt
wc -c hash.txt
john --show hash.txt
hashcat -I
nvidia-smi
```

Replace uppercase placeholders with actual values. A converter extracts verification data; it does not recover a password. A nonempty file still needs format validation. “0 recovered” and “0 loaded” are different results.

### Web and API investigation

```bash
curl -si "$BASE/"
curl -s "$BASE/"            # Read source and actual request construction
curl -s -H 'X-Api-Version: 2' "$BASE/openapi.json"
```

In You Have Been Pwned, the important route was selected by a header. The successful recorded chain was frontend clue → OpenAPI → file/environment disclosure through the version header → disclosed vault token → documented JSON POST. Putting a placeholder into an unrelated header did not work.

### Permissions and local services

```bash
whoami
hostname
pwd
sudo -l
cat /proc/net/unix
ls -la PATH
strings BINARY
```

Use these to identify the current environment, Unix sockets, privileged executables, and supported interfaces. In Hercules, the wrapper expected `HRC-1021`, not a free-form shell command.

### DMZ transport test from the recorded environment

```bash
nmap -Pn -n -sS -g 106 -p 22,106,8000 --reason target
curl --noproxy '*' --local-port 106 -si http://target:8000/
```

The source-port option was not honored by `-sT`. Source port 106 exposed the HTTP service, but did not bypass its 403 application filter. Do not treat an open SYN-scan result or a 400 parse error as application access.

### Plain debugger fallback

```bash
gdb -nx -q -batch \
  -ex 'run' \
  -ex 'info registers rip rsp rbp' \
  -ex 'x/8gx $rsp' \
  -ex 'bt' \
  --args ./BINARY ARGUMENT
```

This was useful when debugger add-ons tried to update without network access. Use GDB to understand corruption, then test privileged behavior in the intended execution context. Do not reuse a leaked address in another ASLR-randomized process.

## Completed reasoning chains to memorize

**Bad Weather:** `hail / 6 / case` → Collatz sequence → 1-based positions → toggle letter case → verify with supplied hashes.

```text
Positions: 6, 3, 10, 5, 16, 8, 4, 2, 1
dev2: iT3GRAnCkUg;
dev6: TIhIwRiN#In5
web1: iMnIF.aBEIp3
Conjecture: Collatz
```

**Scanner KB:** `/proc/net/unix` → protected socket → readable debug log → session token → SUID NASL interpreter → `get_kb_item` with the discovered prefix and token. User confirmed the first token-based lookup worked; the final value is absent from recovered text.

**Signal Drift:** C++/VM identification → rolling XOR encoder → faulty bounds check → proven overwrite → one-byte FNV leak → libc-relative calculations inside the same run → return-oriented chain → user-reported `SKY-SGDR-8439`.

**Cookie Security Protocol:** open redirect → callback reaches bot → cookie flag → stored HTML injection on `/board` → dangling iframe captures CSRF field → callback extracts token → authenticated promotion → verify `/admin`. The user reported completion. Cookie flag: `SKY-YUVJ-2398`; the final administrator flag text is absent.

**You Have Been Pwned:** correct version header → API schema → placeholder expansion → environment token disclosure → v2 vault POST. The successful JSON includes `SKY-AASC-3456`. The complete earlier `/flag.txt` read is absent.

## Unresolved investigations to learn from

**Birdwatchers:** Five SHA-512-crypt hashes, zero verified plaintexts in the collected record. Check maximum supported candidate length, exact rule output, policy compliance, salts, and positive controls before trusting a negative run. Do not describe a 32% job as exhausted or salt-specific evaluations as unique candidates. The policy did not explicitly require digits.

**Intercept:** Q1 LFSR was reported accepted. Later updates reported readable STATUS frames and 0x13 padding under a Fibonacci alternating-step model. Final SECURE plaintext is absent. A nonlinear output stream can coexist with a linear initialization relation; validate both separately. A failed padding sweep does not alone prove the meaning of `plen=0`.

**DMZ:** Q1 = 3; Q2 = Caddy 2.11.4. Q3 bypass string, Q4 internal HTTP port, and Q5 flag remain unconfirmed. The identical “Invalid IP address” response does not reveal the exact server configuration.

**Hercules:** The permissions and wrapper support `sudo -n /usr/local/bin/hc-run HRC-1021` on target as hercules-svc. The chat ends before its output. Do not claim a recovered token without saving it.

## A useful handoff

```text
Challenge and exact question:
Owner and current machine/account:
Original files and endpoint:
Confirmed findings, with saved output:
Hypotheses, clearly labeled:
Tests already run and precise coverage:
Known tool/environment problems:
Current best next test and why it distinguishes hypotheses:
Submission attempts remaining:
Exact answer and verification, if found:
```

## Final verification before submitting

- Is this evidence from the correct challenge and instance?
- Is the answer shown in output or independently verified?
- Are case, punctuation, whitespace, and format exact?
- Does the result prove the final outcome, or only an intermediate stage?
- Has another teammate checked the reasoning when practical?
- Have you saved the final command, output, and answer so the writeup is reproducible?
