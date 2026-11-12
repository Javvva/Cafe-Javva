---
title: "Pullen Park Carousel"
description: "Identify the carousel, the carver, and the per-animal restoration estimate from public archives."
category: "osint"
difficulty: "hard"
status: "solved"
season: "2026 NCL Individual"
points: "110 points"
tools: ["browser"]
---
## Final Investigation Report

| | |
|---|---|
| **Report date** | 2026-11-08 |
| **Challenge** | "Cyber Command": Liber8tion is trying to heist the figures from a carousel exhibit and other works by the same carver |
| **Final status** | **All 7 questions answered. Q7 answer = $400 (accepted by the challenge form).** |
| **Total points available** | 110 (Q1 10, Q2 10, Q3 15, Q4 10, Q5 15, Q6 25, Q7 25) |
| **Prepared by** | Claude (Cowork session), with the user's team, a Chrome-extension agent, Cursor agents, ChatGPT and Gemini as search tools |

---

## 1. Executive summary

1. The carousel is the **Pullen Park Carousel** in Raleigh, North Carolina. It is a Dentzel carousel carved largely by **Salvatore Cernigliaro**. The Q1 carving is a pig, shown in an exhibit at **Colonial Williamsburg** (Abby Aldrich Rockefeller Folk Art Museum).
2. **Q7 asked** for the 1975 per-animal cost estimate, by an expert who appraised the carousel, for stripping, sanding, painting and rebuilding one animal.
3. **Q7's answer is $400.** It is in a two-page document in the **City of Raleigh Historic Resources and Museum Program archive**: *Progress Report to the Civic Committee to Restore the Pullen Park Carousel*, by Cy Farley, Raleigh Fine Arts Society chairman, dated **31 August 1976** (catalog PPC2024.002.020, record 34906).
4. The sentence on page 1 says that Dick Norton of Connecticut, who looked at the carousel in **1971**, gave "an approximate figure of $400.00 per animal at that time". The question says 1975, so the question's year is looser than the source's.
5. We spent most of the effort chasing **totals** ($60,000, $100,000, $74,215, $88,000, $330,798). These were never per-animal figures. The answer was in a **JavaScript-driven archive catalog** that ordinary search engines and our own tools could not read. A tool that browsed it like a person (ChatGPT, then the Chrome extension) found it.
6. A fake YouTube video claiming "$480 per animal" was a decoy. The form rejected $480.

---

## 2. The question set and accepted answers

| Q | Pts | Question (short) | Accepted answer | Notes |
|---|---|---|---|---|
| Q1 | 10 | To whom is the carving attributed? (Firstname Lastname) | **Salvatore Cernigliaro** | First attempt was entered in the wrong box ("Williamsburg") |
| Q2 | 10 | City of the museum housing the exhibit in 2026 | **Williamsburg** | Two wrong attempts first ("Philadelphia", "Philadelphia Museum of Art, Philadelphia") |
| Q3 | 15 | Three other animals displayed alongside the pig (2020–2026) | **Cat, Camel, Ostrich** | |
| Q4 | 10 | Park with the most original carousel pieces by the Q1 sculptor | **Pullen Park** | Confirms the carousel for Q5–Q7 |
| Q5 | 15 | Horse rumored to count rotations; what sculpture trails it in the same row? | **Lion** | Max 2 attempts; "Goat" was wrong, "Lion" correct |
| Q6 | 25 | Position (a–r / A–R) where the pig from storage was added, per historic documentation | **g** | Wrong attempts first: H, h, a, L, N |
| Q7 | 25 | 1975 per-animal restoration estimate (stripping, sanding, painting, rebuilding) | **$400** | Wrong first: 60,000, then $480 |

### Q7 submission history

| Attempt | Value | Result |
|---|---|---|
| 1 | 60,000 | Incorrect (this was the project total estimate, 1976) |
| 2 | $480 | Incorrect (from an unsourced, flagged YouTube video) |
| 3 | $400 | **Correct** (submitted by a teammate after the archive record was verified) |

---

## 3. The Q7 answer in detail

### 3.1 The document

| Field | Value |
|---|---|
| Collection | City of Raleigh Historic Resources and Museum Program archive (PastPerfect Online) |
| Site | raleighhrmprogram.catalogaccess.com |
| Record | https://raleighhrmprogram.catalogaccess.com/archives/34906 |
| Catalog number | PPC2024.002.020 |
| Title | Progress Report to the Civic Committee to Restore the Pullen Park Carousel |
| Author | Cy Farley, Raleigh Fine Arts Society chairman |
| Date | 31 August 1976 |
| Length | 2 pages |
| Page 1 scan | https://raleighhrmprogram.catalogaccess.com/api/images/98180 |
| Context | Report of an initial committee meeting on 29 June 1976 in Tom Bradshaw's office |

### 3.2 The key passage (page 1, decision 1)

- The committee asked **Dean McKinney (NCSU School of Design)** for a master plan to "establish a firm financial figure for the total restoration".
- McKinney suggested getting estimates from people with hands-on experience restoring carousel animals.
- The committee contacted **Richard Burton of Richmond, Virginia** (worked on the Kings Dominion and Busch Gardens Williamsburg carousels). His estimate was "to be here shortly". No figure given.
- **The answer sentence (ChatGPT's transcription, confirmed by the extension's reading):** "We have several other possible candidates to interview one, Dick Norton of Connecticut who looked at the Pullen carousel in 1971 -- giving us an approximate figure of $400.00 per animal at that time."
- A handwritten blue-ink margin note beside decision 1 reads: "This was where the trouble started! Frank could not make a commitment."

### 3.3 Other content in the same report (page 1 decision 2 and page 2)

- Charles Asby would prepare a fundraising portfolio for Wake County businesses; he "cannot proceed until we get our cost quotations" (margin note: "This was done").
- Initial grant of **$6,000** from the National Park Service and NC State Historical Society, matched by city funds, "for the stabilization and security of the building" (a building total, not animals).
- Charles Sprigman, National Endowment for the Arts Southeastern Regional Director, was "skeptical about financial support".
- A carousel ball in October 1976 "aiming at $5,000.00" (a fundraising target).
- The Raleigh Artist Community planned to work on the Chavis Park carousel to gain experience restoring animals.

### 3.4 Why the question says 1975 but the source says 1971

- The report dates Norton's visit and figure to **1971**. We found no document dated 1975 with a per-animal price.
- The question text may paraphrase loosely ("1970s refurbishment", "1975"). Possible explanations: (a) the question writer used a date from elsewhere in the file, (b) the writer treated the 1970s estimate as 1975, or (c) there is a further record we did not find. The form accepted $400, so none of this changes the answer.
- **Confidence: High.** The form accepted the answer, and two independent tools (ChatGPT's transcription, the extension's reading of both pages) agree on the sentence.

### 3.5 What we have and have not seen directly

- Claude (this session) **could not open** the archive pages or the scan: the site blocks automated readers (robots rules). No page or image was downloaded by Claude.
- The sentence was read by **ChatGPT** and then read in a real browser by the **Chrome extension agent**, which reported opening both pages without downloads.
- **Action recommended:** the team should save both pages of the report (screenshot or save-as) as evidence. See section 11.

---

## 4. Related records in the same archive collection

The Pullen Park Carousel collection is catalog series **PPC2024.002.xxx** (record IDs roughly 34881–35028 in the site's `archives/` URLs). The following were read or reported by ChatGPT and the extension. None except 34906 gives the answer.

| Record | Catalog no. | Date | What it is | Read by |
|---|---|---|---|---|
| 34906 | PPC2024.002.020 | 31 Aug 1976 | Farley progress report (**the answer**) | ChatGPT, extension |
| 34908 | PPC2024.002.022 | 6 Dec 1976 | **Thomas C. Layton bid**, Sandusky, Ohio (details below) | ChatGPT, extension |
| 34904 | – | May 1976 | Farley letter recruiting an adviser | ChatGPT |
| 34905 | – | – | Newby letter proposing a restorer | ChatGPT |
| 34907 | – | Jul 1976 | State letter recommending a preservation grant; application details | ChatGPT |
| 34973 | – | – | Separately cataloged application scan | ChatGPT |
| 34944 | – | Feb 1977 | Farley letter describing Layton's bid and appealing for funds | ChatGPT |
| 34943 | – | Jan 1977 | Minutes discussing stabilization | ChatGPT |
| 34945 | – | Mar 1977 | Council memo on funding and shipping animals to Ohio | ChatGPT |
| 34998 | PPC2024.002.072a-b | 21 Aug 1978 | Minutes at Archives and History (Peter Sandbeck, Cy Farley, Ann Turner, Ann Walker); grants and Rosa Regan stripping paint | ChatGPT, extension |
| 34882 | PPC2024.002.002 | 30 Jul–1 Aug 1974 | Roland Summit's recommended procedures for restoring the *Smithsonian's* Dentzel carousel (stripping, structural repairs; no price) | ChatGPT, extension |
| 34949 | PPC2024.002.042 | 15 Apr 1977 | Phase III site-improvement estimate; carousel section III = **$33,990** | extension |
| 34952 | PPC2024.002.044 | 13 May 1977 | Copy of the above; note "we did this free" on part a. of section III | extension |
| 34959 | PPC2024.002.051 | 14 Sep 1977 | Durward R. Center (Historical Instrument Restorations, Baltimore) price estimate for organ restoration | extension |
| 34964 | PPC2024.002.056 | 21 Oct 1977 | Overhead Door Co. proposal for carousel enclosure doors, $16,830 | extension |
| 34965 | PPC2024.002.057 | 19 Nov 1977 | Carolina Builders proposal for doors, $18,200 | extension |
| 34987 | – | – | Gilbert notes on paint treatment | ChatGPT |
| 34918 | – | – | Herschell manufacturer chronology | ChatGPT |
| 34881 / 34919 / 34948 / 34974 / 35028 | – | – | Tax letter / donation note / door memo / file folder / blank registration form | ChatGPT |

### 4.1 The Layton bid (record 34908, 6 Dec 1976)

Letter from **Thomas C. Layton, 918 W. Monroe St., Sandusky, Ohio**, to Mrs. Farley, "to completely restore the 1912 Dentzel Carousel at Pullen Park".

| Item | Price |
|---|---|
| 52 animals | **$600 each** = $31,200 |
| 2 chariots | $500 each = $1,000 |
| 18 upper units | $350 each = $6,300 |
| Outer rim, 18 units | $250 each = $4,500 |
| **Total** | **$43,000** |

- Work listed: stripping; carving and replacement of all missing or defective wooden parts; priming; finish coat; toning and hand trimming; clear protective coat. Price "includes cost of all labor, paint, materials and carving".
- Quote valid until 15 Feb 1977; completion guaranteed "by the summer season of 1978" if the first shipment arrives by 1 Mar 1977. 10% deposit required.
- This is a **1976 bid**, a flat $600 per animal. It is **not** the Q7 answer. It matches the earlier newspaper reports of animals being shipped to an expert in Ohio. That Layton is the unnamed Ohio expert is **our inference**, not stated in a source.

### 4.2 Catalog search behavior (important lesson)

The extension searched the catalog (34,789 records): "Norton" returned 4 unrelated hits; "per animal" returned **0 hits**; "stripping" 4 hits; "estimate" 24 hits (5 in this collection). **The key report was not indexed under "Norton"** because the catalog does not index the scan text. The answer could only be found by opening the scans.

---

## 5. Which documents the question writers used

- **Q6 source:** the City of Raleigh *Landmark Ordinance and Report* for the Carousel at Pullen Park (20-page PDF, https://cityofraleigh0drupal.blob.core.usgovcloudapi.net/drupal-prod/COR10/CarouselAtPullenPark_LandmarkOrdinanceAndReport.pdf). It contains the 1976 National Register nomination form (prepared by Virginia Currie and Ann Turner of the Raleigh Fine Arts Society and Catherine Cockshutt, 23 April 1976). Page 17 is the circular floor plan with positions labeled in Roman numerals (outer row), **a–r** (center row) and **A–R** (inner row). Item 7 lists each animal by position, plus an "Animals in Storage" list that includes a pig.
- **Same document also holds (no cost, but the experts):**
  - Rol Summit, 1971, "after examining slides": "one of the best ...... very old for an operating carousel".
  - Dick Norton, Horse of a Different Color, Bristol, Connecticut: "estimates its worth as over $100,000" (value of the whole carousel; undated).
  - Murray Childs Black attributes the carousel to Dentzel.
  - $300 spent on the pipe organ in 1948; fluid drive installed in 1957.
  - Five animals in storage and replaced by cast aluminum.
  - Ordinance 1976-285, adopted 17 Aug 1976, registered 22 Sep 1976, Book 2436 page 237.
- **Q7 source:** the City of Raleigh Historic Resources and Museum Program archive, committee papers series PPC2024.002 (section 3 and 4).
- **Pattern:** the question writers used **official, primary documents hosted on city or state sites**, including scan-only items. Future similar challenges should start there.

---

## 6. Investigation timeline

Phases from the project record (earlier phases are summarized from session notes; dates not always recorded).

1. **Identify the carousel (Q1–Q4).** Carver Salvatore Cernigliaro → Dentzel → Colonial Williamsburg exhibit → Pullen Park.
2. **Q5/Q6.** Lion and position g, found from the landmark report/NRHP documentation.
3. **Q7, newspaper phase.** Searches of the News & Observer 1975–79 (Newspapers.com), Raleigh Fine Arts Society (RFAS) scrapbooks on DigitalNC (106501–106504, 106593, 106594, 106597, 106617), biennial reports, THJH issues, NRHP form, NCA Carousel Resource Guides, WRAL, Wikipedia, NCpedia, TCLF, NCA census, Technician. Result: only totals and Fried's general rule.
4. **Q7, audio phase.** Rol Summit interview (Coney Island History Project, transcribed locally), Rosa Patton lecture (Glen Echo, 2021), local faster-whisper transcription. No Raleigh estimate.
5. **Reframing.** The team realized the target was a **1970s appraisal document with a per-animal figure**, not a 1975 newspaper line. Searches for 1970-only material (N&O, Technician, scrapbook images 106597 59/64 and 106501 19/20/33/56/71/102) came back negative.
6. **Outside-the-box phase.** Brainstorm of non-standard sources (unread newsletters, finding aids, HathiTrust/Google Books, conservator papers, TV film, theses, grants). Gemini, Brave and a first ChatGPT query all returned the same totals.
7. **Breakthrough.** ChatGPT searched the **City of Raleigh archive catalog** and quoted the Farley report (record 34906). The Chrome extension then read records 34906 and 34908 and ran keyword searches. A teammate submitted **$400** and it was accepted.

---

## 7. Every dollar figure we found, and why it was not the answer

| Figure | What it is | Source | Why not Q7 |
|---|---|---|---|
| **$400 per animal** | Norton's approximate per-animal figure, 1971 | Farley report 31 Aug 1976 (34906) | **This is the answer** |
| $600 per animal (52 animals) | Layton's bid, Dec 1976 | Archive record 34908 | 1976 bid, flat price, not the appraiser's estimate |
| $200–$400 per figure | Frederick Fried's general rule for restoration | N&O 3 May 1976, p.23 (47 figures) | General range, not an appraisal of Pullen |
| $60,000 | City Manager L.P. Zachary's 1976 project estimate | Raleigh Times 2–3 Apr 1982 clippings | Project total; submitted and **rejected** |
| $100,000 | Norton's valuation of the whole carousel | NRHP form (1976) | Value, not restoration cost |
| $60,000 vs $100,000 | "by one source / by another" (unnamed) | RFAS scrapbook 106502 img 26 | Totals |
| $74,215 | Funds needed to restore all 52 animals | N&O 27 Feb 1977 (106502 img 45) | Total |
| $88,000 | "One figure ran as high as" | The State, Feb 1979 | Total |
| ~$80,000 | Project figure | Technician, 6 Apr 1977 | Total |
| $330,798 | Final restoration cost | Raleigh Times, 3 Apr 1982 | Final total ($208,000 animals and panels, $117,000 building, $5,000 organ) |
| over $375,000 | Editorial total for restoration and repairs | Raleigh Times, 2 Apr 1982 | Total |
| $6,000 | NPS/State Historical Society matching grant, FY1975–76 | Farley report; scrapbooks | Building stabilization |
| $13,500 raised | Funds raised at one stage | 106502 img 26 | Fundraising total |
| $1,425 / $1,500 / $2,500 | Purchase price claims (conflicting) | WRAL; Raleigh Times; Raleigh Times | Purchase prices |
| $480 per animal | Claim in a YouTube description | YouTube Cr2BsWigslA | **Decoy; rejected by form** |
| $33,990 | Carousel section of Phase III estimate, Apr 1977 | Archive 34949 | Site work |

**Correction to earlier notes:** the two Raleigh Times clippings in NCA Resource Guide 008 are dated **2 and 3 April 1982** (headers read directly from the uploaded PDF). Earlier notes said "1981 vs 1983".

---

## 8. People named in the record

| Person | Role | Source |
|---|---|---|
| **Dick (Richard) Norton** | Horse of a Different Color, Bristol, CT; appraiser; $400/animal (1971); valued carousel over $100,000 | Farley report; NRHP form |
| Rol (Roland) Summit | Dealer and restorer, Rolling Hills CA; reviewed slides 1971; recommendations for Smithsonian Dentzel carousel 1974 | NRHP form; archive 34882 |
| Frederick Fried | Carousel historian, New York; lectured in Raleigh 27 Apr 1976; "$200–$400 per figure" | N&O 1976; RFAS scrapbook |
| Richard Burton | Richmond VA restorer (Kings Dominion, Busch Gardens); estimate awaited in 1976 | Farley report |
| Thomas C. Layton | Sandusky, Ohio restorer; Dec 1976 bid | Archive 34908 |
| Cy Farley | RFAS chairman; author of the progress report | Archive |
| Dean McKinney | NCSU School of Design; master plan suggestion | Farley report |
| Rosa Ragan (later Patton) | Restoration project supervisor; paint conservation | Multiple |
| L.P. Zachary | City Manager; 1976 $60,000 estimate | Raleigh Times 1982 |
| Frank Evans | Parks and Recreation Director | NRHP form; N&O 1970 |
| Ercell (Erseil) Liles | Parks and Recreation administrative assistant | Raleigh Times 1982; guidebook |
| Jimmie Chambers | Retired Parks director; repair history | NRHP form |
| Virginia Currie, Ann Turner, Catherine Cockshutt | Prepared the NRHP nomination (23 Apr 1976) | NRHP form |
| Durward R. Center | Baltimore organ restorer (1977–78) | Archive 34959 |
| Peter Sandbeck | State Archives and History; 1978 meeting | Archive 34998 |
| Charles Asby, Charles Sprigman | Fundraising portfolio; NEA regional director | Farley report |

---

## 9. What did not work (negative results, so nobody repeats them)

- **Newspapers.com / News & Observer:** coverage of 1970–74 is thin (5 hits for "Pullen Park carousel"). **The search ignores "OR"**: three OR queries each returned exactly 46 hits because only the first term was matched. Use one term per search. 1970-only search found three passing mentions (23 Jul, 5 Sep, 26 Nov 1970), no estimate. Cost talk starts only in 1976.
- **RFAS scrapbooks (DigitalNC):** 106597 (1965–1970) has no carousel pages ("Flying Horse" is a Chagall print). 106501 images 19, 20, 33, 56, 71, 102 negative; 109, 121, 122 mention the carousel (guidebook items and Fried lecture) with no costs. 106502 read in full.
- **Technician (NC State):** no 1970 issue mentions the carousel; the 1977 hit is a project total.
- **Tar Heel Junior Historian (THJH):** the Winter 1979 "Carolina Carousel II" intro promises an "assessment of costs" that is not in the scan. Fall 1978 and Spring 1979 have no dollar amounts.
- **State Library N&O Index:** discontinued; points to NewsBank (needs an NC library card; not used).
- **Search engines and AI tools:** Google-style searches, Gemini, Brave's AI summary and a first ChatGPT query all returned the same totals. Brave's "$60,000 in 1975" was an AI conflation of the 1976 total.
- **Web sources checked and negative:** Raleigh landmark report, LocalWiki, roadarch, vintagecarousels, WRAL archive pages, NCA Pullen photo show, NCPI 36373/36394/36400, NCSU library page, Burlington Menagerie relocation file (a different carousel), ArcGIS signage storymap, Smithsonian archive photo, Raleigh Register Winter 2024, savingplaces Rosa Patton interview, a travel blog (copies Wikipedia).
- **Blocked to automated tools:** newspapers.com (robots), Columbia Anubis, NARA, YouTube fetch, rosapatton.com, the Raleigh HRM archive catalog.
- **Our own mistakes (owned):** the extension read the wrong pages of Resource Guide 008 (printed labels 18–21 were mistaken for PDF pages); ECU NCPI 25654 was misattributed to the 1975–76 fundraising years (it is a 1986 article); a first dashboard render bug ("string contains invalid characters"); I briefly described the public dashboard as private.

---

## 10. Decoys and unverified claims

| Item | Status |
|---|---|
| YouTube "Pullen Park Refurbishing Carousel (1975) Raleigh Cost" (Cr2BsWigslA) | **Flagged as fake.** Uploaded the day it was found by a one-subscriber channel; modern phone footage; description claims an expert estimated "$480 per animal" with no source; the form rejected $480. Do not cite. |
| "$480" | Rejected by the form |
| Brave AI "$60,000 estimate in 1975" | Unsupported; the $60,000 is a 1976 total |
| Other teams planting decoys | Likely; treat posts that appear just as a challenge peaks with suspicion |

---

## 11. Evidence to preserve (do this now)

1. Save or screenshot **both pages** of record 34906 (the Farley report), including the page 1 scan at /api/images/98180 and the handwritten margin note.
2. Save record 34908 (Layton bid, 3 pages) and the 34949 estimate page.
3. Save the 20-page landmark report PDF (Q6 source; page 17 diagram).
4. Note the date and time of access for each (archives can be reorganized).
5. If more detail is needed, upload the saved pages to the session and the quotes can be re-verified.

---

## 12. Lessons and methods that worked

1. **Totals are not per-unit numbers.** Never divide a total by a count to get a per-animal figure; look for the sentence that states the unit.
2. **Pull the question's wording apart.** "Expert appraised" pointed to a named appraiser (Norton). Searching for the appraiser's name, not the year, was the right pivot.
3. **Primary documents live in catalogs and scans.** City and state archive catalogs (PastPerfect and similar) usually do not index scan text. A human-style browser agent that opens each record beats keyword search.
4. **Use multiple tool families.** Our own web tools hit robots rules; ChatGPT and the Chrome extension could browse. Gemini and Brave's AI summaries repeat the same few web sources.
5. **One term per search** on Newspapers.com; do not rely on OR.
6. **Treat AI summaries as leads only.** Require the page title, URL and an exact quote before submitting.
7. **Keep a log of negatives.** The dead-ends list stopped repeated work.
8. **Submit with care.** Three Q7 submissions were made; two were wrong (60,000; $480). Q5 had a two-attempt limit; check each question's note.

---

## 13. Project tooling and artifacts (carried from session notes)

- Repo (user's Cursor copy is master). At the last merger report: roughly 115 sources, 54 figures and 47 leads logged. Vocabulary: confidence High/Medium/Low; status figure-found / negative / partial / not-checked / blocked / unverified-claim.
- Offline search: SQLite FTS5 (`scripts/search.py`) and `library/search.html`.
- Local transcription: faster-whisper (CPU int8) for Summit and Patton audio.
- Dashboards (Claude Artifacts, Dashboard type):
  - Current: https://claude.ai/artifact/LmUASK6TCVN2QSYC6kHv1j
  - Old public one with a broken leads table and the $480 row: https://claude.ai/artifact/EasCLfPxcLoMZue1JhZ4YB (deletion recommended; needs the owner's confirmation)
- Agents: Opus merger and Sonnet miners in Cursor; Chrome extension for logged-in sites; prompts kept short because the extension declines long tasks and errors often (its reports stay Medium until re-checked).

---

## 14. Open items

- [ ] Commit this report and the answer to the repo (see below).
- [ ] Save the evidence pages (section 11).
- [ ] Mark Q7 as **found** in sources, figures and leads; close the remaining Q7 leads (NewsBank, Carolina Comments, THJH assessment, Wake County Crabtree/Murray folders, Smithsonian Fried papers) as "no longer needed".
- [ ] Decide whether to delete the old public dashboard.
- [ ] Sync the dashboard with the final state.
- [ ] Optional: read the rest of the PPC2024.002 series for a 1975-dated record, if anyone wants to resolve the 1971-vs-1975 wording.

---

## Appendix A. Source and URL list

**Q7 answer**
- Farley progress report: https://raleighhrmprogram.catalogaccess.com/archives/34906 (scan: https://raleighhrmprogram.catalogaccess.com/api/images/98180)
- Layton bid: https://raleighhrmprogram.catalogaccess.com/archives/34908
- Other series records: archives/34904, 34905, 34907, 34973, 34944, 34943, 34945, 34998, 34882, 34949, 34952, 34959, 34964, 34965, 34987, 34918, 34881, 34919, 34948, 34974, 35028 (all under https://raleighhrmprogram.catalogaccess.com/)

**Q6 and background**
- Landmark ordinance and report (20 pp.): https://cityofraleigh0drupal.blob.core.usgovcloudapi.net/drupal-prod/COR10/CarouselAtPullenPark_LandmarkOrdinanceAndReport.pdf
- NRHP nomination, state copy: https://files.nc.gov/ncdcr/nr/WA0008.pdf
- NCA Carousel Resource Guide 008 (Raleigh Times clippings, 2–3 Apr 1982): https://www.carousels.org/CRG/NCA_Carousel_Resource_Guide008.pdf
- NCA Pullen Park photo show: https://carousels.org/psp/PullenPark
- RFAS scrapbooks on DigitalNC: lib.digitalnc.org/record/106501, 106502, 106503, 106504, 106594, 106597
- Rosa Patton interview: https://savingplaces.org/stories/revealing-true-colors-a-conversation-with-historic-carousel-restorer-rosa-patton
- Roland Summit oral history: https://www.coneyislandhistory.org/oral-history-archive/roland-summit

**Physical holdings noted but not needed** (reported by ChatGPT; not checked)
- Wake County Library archives: Elizabeth Gilbert Crabtree Papers, Box 89 Folder 4 (1973–1984 Pullen Park Carousel file); Elizabeth Reid Murray collection (two carousel folders); four restoration folders dated 1976–1984.
- Smithsonian, Fried papers (NMAH.AC.0528), Box 26 Folder 4, "Pullen Park, Raleigh, North Carolina" (in-person access).

---

## Appendix B. Short reproduction path (for the next challenge of this type)

1. Identify the object (carver, museum) and the place (park).
2. Find the National Register nomination and city landmark report for it; they give position diagrams and name the experts.
3. For cost questions, search for the **expert's name** in the city's historic-resources archive catalog, not for the year or the dollar amount.
4. Open every record in the project's catalog series; the keyword search will not see scan text.
5. Require a quoted sentence, a record number and a URL before submitting.

---

## Appendix C. Commit message for the repo (suggested)

```
Q7 solved: $400 per animal (Norton, 1971, quoted in Farley progress report 31 Aug 1976)

- Source: City of Raleigh HRM archive, PPC2024.002.020 (record 34906), page 1
- Confirmed by challenge form (accepted $400)
- Add archive series PPC2024.002 as sources (records 34906, 34908, 34949, ...)
- Layton bid ($600/animal, Dec 1976) logged as related, not the answer
- Flag $480 (YouTube) as decoy; record that $60,000 was a 1976 total
- Resource Guide 008 clippings dated 2-3 Apr 1982
- Add final report docs/FINAL_REPORT.md
```
