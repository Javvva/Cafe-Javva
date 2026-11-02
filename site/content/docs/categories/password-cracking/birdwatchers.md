---
title: "Birdwatchers (Hard)"
description: "Decrypt the leaked auth capture, then crack SHA-512-crypt hashes with a scientific-name wordlist."
category: "password-cracking"
difficulty: "hard"
status: "partial"
season: "2026 NCL Individual"
points: "60 points, 3 of 5 recovered"
tools: ["tshark", "hashcat", "john", "openssl", "python"]
---
**Category:** Password Cracking · **Points:** 60 · **Attempts allowed:** 25
**Outcome:** 0 / 5 recovered. Concluded **not solvable from the material provided** (see §7).
**Date of work:** 2026-10-25 · **Hardware:** NVIDIA RTX 5080 + Intel Ultra 9 285K (WSL2/Kali)

---

## 1. Challenge summary

Story: a subset of "Liber8tion" are birdwatchers using a forum. We tapped a *misconfigured auth
server* and captured backend auth traffic. Crack 5 users' passwords.

Given files (the ONLY download): `password4/traffic.pcap`, `password4/sslkeylog.txt`.
Public website (clue source): `https://00845d86f6bb45fa409e9d896a4525e2-birdwatchers.web.cityinthe.cloud/`

Five accounts (all surnames are birds; first names are the Alice/Bob/Charlie/Diana/Eve crypto convention):
`alice.wren` (Q1,10pt) · `bob.finch` (Q2,10pt) · `charlie.hawk` (Q3,15pt) · `diana.swift` (Q4,10pt) · `eve.martin` (Q5,15pt)

**Stated password intelligence (the key constraint):**
> "at least 10 characters, with exactly one uppercase character and exactly one special character."
Digits are NOT required.

---

## 2. Getting the hashes (this part fully worked)

1. `traffic.pcap` = a single TLS 1.3 session (16 packets) between client `172.23.0.3` and auth
   server `172.23.0.2:8443` (SNI `auth`, cert `CN=auth,O=LBS,C=GB`, server `uvicorn`, client `python-httpx/0.28.1`).
2. `sslkeylog.txt` contained the TLS session secrets (the misconfig).
3. Decrypt + follow the HTTP stream:
   ```
   tshark -r traffic.pcap -o tls.keylog_file:sslkeylog.txt -q -z follow,tls,ascii,0
   ```
4. One request only: `GET /debug/users` → 200, JSON body (623 bytes) = **username → hash**, nothing else
   (no email/bio/join-date fields — verified exhaustively).

**The five hashes** (`$6$` = sha512crypt, hashcat mode 1800, 16-char salt, 86-char digest):
```
alice.wren:$6$K85i2JodjMjBvExR$tVeBocC2FyAK5MBiAJKpRmqpOZd4YWTn4stNzr1Y0hchGcx/9L/QLYKlITFzMP1FvNve4xocf.C4LtXkSt0Ho/
bob.finch:$6$7GHP2IgaKGdopPVL$LCcy1dJqPlVWltaFCDmduqFGrCwWUaoRvNRu2usMYINiL75YL/oNQ3vJytIQjQ2OtEKwVss9uWVTj.nirU27s/
charlie.hawk:$6$Nrgdl4OVDh0kwRyU$6vDmAWjK3umtPxytoEsGznkZ4SytcIx8W6GyLf2i4cdObd5w51PAvNo28BGqU6sSe2z1jqEirrA6kW4PMnobK1
diana.swift:$6$TkMvvOnaSqBOsEkK$EWLpKRTeThPJM.ccOnVKyYtvLphT0fbUF4RbEtQJa0qRpCuamnD/E6TUmyQKAdpfx4qQyq/NxwkixUi6TmjeO0
eve.martin:$6$XMcwWZth/CiYrmJE$IvXdOf0OBcVvBMjLle9Gn6XIYwbQl4UJQuwKgiCUatNeWWSqPNvFz6ell3IgEkz6NPS0j0Zuz9N7KVb1fKxSe/
```

**Pipeline proven correct** (so every "no crack" is a true negative):
- `openssl passwd -6 -salt <realsalt> 'KnownPw'` → matches when fed back (tested on each real salt).
- john positive control: appended a known-pw hash on a real salt to the batch → cracked it, 5 real left.
- hashcat canary (ASCII + UTF-8 multibyte) cracked with the pure kernel.

---

## 3. Website clues (the complete clue set)

The site is **4 static HTML pages** (Home/Species/Sightings/Members), pure nginx, **no JS, no API,
no login backend** (`POST /login` → 404, no `<form>`, no hidden fields/comments). "Login required to
view full profiles" is display text with **nothing behind it** — a static mock.

Per-user signal:
| User | Favourite / theme | Location | Numbers / facts | Quote |
|---|---|---|---|---|
| alice.wren | reed/garden **warbler**, dawn chorus, "warbler specialist" | Ashwood, hawthorn | 200 sightings, joined 2021, "4am" | "The warbler's song is worth getting up at 4am for." |
| bob.finch | **kingfisher**, nuthatch, "generalist birder" | Fen River, Millbridge, Fenwick Oak | first kingfisher aged 9, 14 sightings | — |
| charlie.hawk | **peregrine**, kestrel/merlin/sparrowhawk, "raptor enthusiast" | Harrow Ridge | since 2020, wingspan 95cm, **320 km/h**, 07:14/06:42 | "The peregrine is nature's precision instrument." |
| diana.swift | **swift**, dunlin, nestbox, ringing | Ashwood Reserve, Saltmarsh estuary | nestbox 7, 187 species, 2024, 09:00 | — (named after the swift) |
| eve.martin | **puffin**, gannet, "seabird specialist" | Skomer Island, Bass Rock | ×6 puffins, 2021 peak, **10,000 pairs** | "Puffins never get old." |

Society: "Liber8tion" (leet), "LBS", "Est. 2019". Records follow the **BTO checklist** → species codes:
REEWA/RW, GARWA/GW, KINGF/KF, PEREG/PE, SWIFT/SI, DUNLI/DN, PUFFI/PU, GANNE/GX, NUTHA/NH, etc.

---

## 4. Approaches tried (all 0/5, full coverage verified)

Each ran with the length bug fixed (see §5) and candidates confirmed policy-compliant.

**Themed word mutations**
- Every themed word, **capital at ANY position**, **special at ANY position**, **full ASCII special
  set AND Unicode specials** (× — 🐦 · … ° • curly quotes), **every number 0000–9999**, plus the
  distinctive facts (320, 10000, 95, 187, 200, times, years).
- Two-word compounds & separators (`Reed-warbler`, camelCase `reedWarbler`), title-case (`ReedWarbler2021!`).
- 3-word themed passphrases (~2M), bird×context combinator (species × locations/roles).
- BTO 2/5-letter codes (`REEWA2021!`, `Pereg2020!`) + EURING numbers.
- Latin binomials (`Falco peregrinus`, `Fraterculaarctica!`) incl. genus-cap + space form.
- Personal phrases / mottos / quotes / sentence-mnemonics (`Nature'sprecision`, `Puffinsnevergetold!`),
  apostrophe forms, times with colons (`Peregrine07:14`).
- Username-with-dot (`Alice.wren`, dot = the special) + variants.

**Full-vocabulary / standard-ruleset**
- Entire website vocabulary (~1,083 tokens incl. descriptors) × structural generation (11M candidates).
- Full UK/BTO species list (~537 species) × policy rules.
- Canonical NCL hybrid: `Capitalize(page word) + 0–3 digits + special` over full vocab incl. role words
  (Specialist/Enthusiast/Birder/Generalist/Organiser).
- CeWL-style vocab (1,414: page + British species + descriptors + compounds) × **OneRuleToRuleThemAll
  (52,014 rules)**, policy-filtered → 184k valid → 0.
- rockyou straight (full length) · rockyou × best66 (policy-filtered, 6.7M) · English dict × 715 rules
  · rockyou × 192 custom rules (to ~32%).

**Infeasible (documented, not run):** rockyou × OneRule — ~7×10¹¹ candidates to generate/filter (days
on one GPU), ~1.8×10⁹ survive the policy filter (~6h to hash). Not practical.

---

## 5. Tooling lessons learned (IMPORTANT for team games)

1. **`-O` optimized kernel caps sha512crypt at 15 chars.** It *silently rejects* longer candidates
   (`Reedwarbler2021!` = 16). Early runs lost all ≥16-char guesses. Verify with a long canary:
   `-O` → "Maximum password length: 15" + Rejected 100%; without `-O` → "256". **Rule: use pure kernel
   for >15-char candidates; `-O` only when you KNOW all candidates ≤15.**
2. **Custom charset containing `?` breaks masks.** `-2 '!@#...?'` → "Syntax error in mask" and the
   run silently fails. Escape literal `?` as `??`, or drop it. **Always check Status/Rejected lines.**
3. **hashcat allows only ONE cracking instance.** A second launch dies with "Already an instance
   running on pid N" and produces NO output. Several of our batched runs silently no-op'd because a
   stray/background run held the lock. **Rule: confirm `pgrep -x hashcat` is clean before launching;
   never run competing hashcat jobs; beware shell `for`-loops that respawn after a `pkill`.**
   (`--stdout` does NOT take the lock, so generation can run alongside a cracker.)
4. **Small wordlist + big ruleset = terrible GPU utilization.** 1,414 words × OneRule ran at ~14 kH/s
   (7h ETA) because batches are tiny. **Fix: pre-generate to a flat file and crack as a straight
   dictionary** (big batch → full GPU), ideally **policy-filtered** first.
5. **The policy-filter trick** (the single most useful technique here):
   ```
   hashcat --stdout WORDLIST -r RULES \
    | grep -P '^.{10,}$' \
    | grep -P '^[^A-Z]*[A-Z][^A-Z]*$' \
    | grep -P '^[A-Za-z0-9]*[^A-Za-z0-9][A-Za-z0-9]*$' \
    > policy_cands.txt     # (or pipe straight into: hashcat -m 1800 hashes.txt)
   ```
   The 3 greps enforce ≥10 / exactly-one-uppercase / exactly-one-special. It shrank OneRule's 73M
   output to 184k (≈400×), making strong rulesets feasible on slow `$6$`.
6. **Split per-user for speed when a candidate set is user-specific:** one hash = one salt =
   5× faster than testing all 5 salts.
7. **Verify offline, never burn attempts.** Any guess can be checked with
   `openssl passwd -6 -salt <salt> '<guess>'` vs the stored hash — free, instant, offline. We never
   submitted an unverified guess.

---

## 6. Speeds observed (RTX 5080, sha512crypt mode 1800)
- Optimized kernel (`-O`, ≤15 chars): ~820 kH/s
- Pure kernel (no `-O`, any length): ~120–190 kH/s
- Straight rockyou (14.3M × 5 salts): ~90 s · With small-list + rules: as low as 14 kH/s (avoid).

---

## 7. Why it wasn't solved / what we'd have needed

The policy line pins the **shape** precisely (≥10, exactly 1 upper, exactly 1 special, digits
optional). We ran that exact shape against **every word source available** — full site vocabulary, all
~600 British species, descriptors, compounds, Latin names, English dictionary, rockyou — with every
capital position, special char (ASCII + Unicode), and number. The shape is fully covered. What's
missing is the specific **seed word**, which is **not exposed on the public site**.

Evidence it's not derivable from what we had:
- Backend `/debug/users` leaked ONLY the hashes (no profile fields).
- Website is a static mock: no login backend, so the "full member profiles" that would hold each
  user's real seed **do not exist server-side** and can't be reached.
- No NCL hint panel entries for this challenge; no supplied wordlist.
- Per-user inconsistency (eve has no sighting time; bob/diana have no quote) argues against any single
  clean per-user template.

**To solve it we would have needed ONE of:**
1. A single **confirmed plaintext** (teammate / official writeup) → reveals the generator → finish the
   other four in seconds with the proven pipeline.
2. The **exact password format** if stated anywhere (e.g. "Species+Year+Symbol").
3. The **login-gated member profiles** (if the intended version of the challenge had a real login with
   extra personal data) — the single data source we could not access.

Most likely explanation: the passwords were **generated to be deliberately hard / effectively random
within the policy**, i.e. not recoverable from the public clues — consistent with 0/5 after a very
thorough sweep. (If a writeup later shows a clean themed answer, re-check §5 pitfalls — a silent
`-O`/lock/charset failure is the usual culprit when "the obvious guess" seems untested.)

---

## 8. Recommendations for TEAM GAMES

**Methodology**
- Do the easy extraction first (here: TLS decrypt → hashes). Confirm hash type early (`$6$`=sha512crypt
  mode 1800; `$y$`=yescrypt; `$apr1$`=md5apr1; `$7z$`/`$ansible$` have their own `*2john` tools).
- **Always run a positive control** (known pw on a real salt) before trusting any "exhausted, 0".
- CeWL the challenge site, then **custom-wordlist + rules** is the designed path for themed NCL
  password challenges — but enrich the wordlist with **compound bases** (OneRule can't join words) and
  **role/descriptor words from bios**, not just the obvious nouns.
- Use the **policy as a filter** to make strong rulesets (OneRule/dive) feasible on slow hashes.

**Avoid the traps from §5** — they cost us hours here: the `-O` length cap, the `?`-in-charset mask
error, the single-instance lock (and `for`-loop respawn after `pkill`), and small-list GPU starvation.

**Division of labour (team):** one person owns extraction/hash-ID, one owns wordlist/CeWL enrichment,
one owns rule/mask strategy + GPU scheduling (never two hashcat crackers at once). Keep a shared
`pot` + a running journal of what's been tried (shape × wordlist) so no effort is duplicated.

**Time management:** if the designed method (CeWL × OneRule, policy-filtered) comes back empty, STOP —
don't invent endless cosmetic variations. Re-check the clue source for data behind a login / a format
hint, and move to other challenges to bank points. Never spend answer attempts on guesses you can
verify offline are wrong.

---

## 9. Artifacts (in `~/Downloads/password4/`)
- `hashes.txt`, `traffic.pcap`, `sslkeylog.txt`, `site_all.html` (saved site)
- `birdwatchers.pot` (empty — no cracks), `birdwatchers_research.md` (hypothesis journal)
- Candidate generators: `gen*.py`, `birdgen.py`; wordlists: `site_words.txt`, `brit_species.txt`,
  `merged_base.txt`, `bto_species.txt`; rules: `OneRuleToRuleThemAll.rule`, `expand.rule`, `rocku.rule`
- Run logs: `*.out`

---

## 10. ⭐ SOLUTION (reverse-engineered post-event from community hints)

**THE FORMAT:** `Genus` + `<one special char>` + `species` — a bird's **scientific binomial**
with the space replaced by the single special character. Genus is capitalized (= the one uppercase),
species lowercase, ≥10 chars. **The bird is RANDOM — NOT the user's stated favourite.** That is why
every themed attack (favourite bird, location, quotes, BTO codes) failed: the website theme was a
*decoy*; the real seed is just "any genus+species from a massive bird list."

The two community hints that unlocked it:
- "genius [=genus] special character species, first letter capitalized" + "massive list of all genus
  and species of birds."
- "Hashcat rules would have helped for your final 2 if you had the right wordlist." (the two 15-pt
  ones use a rarer species / a variation; the three 10-pt ones are plain binomials.)

**Recovered passwords:**
| User | Password | Species |
|---|---|---|
| alice.wren | `Falco.tinnunculus` | Common Kestrel |
| bob.finch | `Erithacus_rubecula` | European Robin |
| diana.swift | `Vanellus@vanellus` | Northern Lapwing |
| charlie.hawk | (see §11) | |
| eve.martin | (see §11) | |

**Winning method (fast on RTX 5080 — minutes):**
1. Get a comprehensive bird scientific-name list. We used the **IOC World Bird List** (~11,000 species):
   ```
   curl -sL 'https://www.worldbirdnames.org/Multiling%20IOC%2014.2.xlsx' -o ioc.xlsx
   ```
   Parse the binomial column (`IOC_14.2`, column D) with stdlib `zipfile`+regex (no pandas needed) →
   `Genus species` per row. (Master XML `master_ioc-names_xml.xml` adds ~19,800 subspecies trinomials.)
2. Build candidates `Genus<special>species` for every binomial × every special char
   (`!@#$%^&*()-_=+[]{};:'",.<>/?`~|\` and space), keeping only policy-valid (≥10, 1 upper, 1 special).
   ~370k–900k candidates.
3. Crack straight (no `-O` needed; it's fast): `hashcat -m 1800 --username hashes.txt sci_gs.txt`.
   → the 3 plain-binomial users fall instantly.
4. For the "harder" 15-pt users, add a rule/hybrid variation (append a digit, or use the subspecies
   trinomial list) — "hashcat rules would have helped."

**Key takeaway for team games:** when an elaborate theme leads NOWHERE after exhaustive themed attacks,
suspect the theme is a **decoy** and the real seed is a large **domain wordlist** (here: all bird
scientific names). The policy ("one upper, one special") then just describes how the two tokens are
joined (Capitalized genus + special + species). Always keep **domain wordlists** handy (taxonomies,
place lists, product catalogs) and know how to pull/parse them quickly (xlsx = zip+XML, no pandas).

---

## 11. Final status & the last two

**Recovered & verified (3/5):**
- alice.wren = `Falco.tinnunculus`  (Common Kestrel)
- bob.finch  = `Erithacus_rubecula` (European Robin)
- diana.swift= `Vanellus@vanellus`  (Northern Lapwing)

**charlie.hawk & eve.martin (the two 15-pt) — NOT recovered here.** Confirmed NOT present as:
- plain IOC binomial (spreadsheet 11,276 and master-XML 11,161) × every special char,
- IOC binomial + a trailing/leading digit,
- IOC subspecies trinomials.
So their species sit in a **different / larger taxonomy** than IOC 14.2 — exactly the Discord hint
"you needed the right wordlist" for the final two. The likely sources are **eBird/Clements** or
**AviList 2025** (which assign some birds to different *genera* than IOC) or the **GBIF backbone**
(includes synonyms/older names). In THIS environment those downloads were blocked (403/unreachable);
only worldbirdnames.org/IOC was reachable.

**On a competition Kali box with open internet, to finish all 5:**
```
# eBird/Clements integrated checklist (has species + groups + subspecies, ~11k, different genera):
#   https://www.birds.cornell.edu/clementschecklist/download/   (grab the CSV)
# AviList 2025 unified checklist:  https://www.avilist.org/   (or its Zenodo record)
# GBIF backbone (all bird names incl. synonyms): https://api.gbif.org/v1/species/search?highertaxonKey=212&rank=SPECIES
# Then, exactly as for the 3 solved:
python3 build_genus_species.py <taxonomy.csv>   # -> Genus<special>species, policy-filtered
hashcat -m 1800 --username hashes.txt genus_special_species.txt --potfile-path birdwatchers.pot
# If still missing, add the rule/hybrid variations (append digit, subspecies) — "rules would have helped".
```

**TEAM TAKEAWAY (most important line of this report):** keep a local cache of big **domain wordlists**
BEFORE the competition — all-birds taxonomies (IOC + eBird/Clements + AviList), world place names,
given-name/surname lists, product/brand lists, etc. Here we lost the final two only because we could
not fetch the alternate bird taxonomy live. A pre-staged `~/wordlists/birds_all_scientific.txt`
(merge of IOC+Clements+AviList+GBIF, deduped) would have cracked all five in minutes.
