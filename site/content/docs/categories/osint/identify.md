---
title: "Identify (Easy)"
description: "Read the C2PA content credentials on four images to name the generator that made each one."
category: "osint"
difficulty: "easy"
status: "solved"
season: "2026 NCL Team"
points: "40 points"
tools: ["exiftool", "browser"]
---

Cyber Command, team game. A photographer claimed four nature photos were taken in Maine. The editors think all four were generated. Company, platform, or model names are accepted.

The generator names were in the original screenshots, not in the written steps.

| Question | Points | Ask |
| --- | ---: | --- |
| Q1 | 10 | AI generator that created image 1 |
| Q2 | 10 | AI generator that created image 2 |
| Q3 | 10 | AI generator that created image 3 |
| Q4 | 10 | AI generator that created image 4 |

1. Download the four images from the challenge.
2. Open [Content Credentials](https://verify.contentauthenticity.org/).
3. Drop each image in. The credential names the manufacturer.
4. Repeat for the other three.
5. Generated files often carry a C2PA signature. That site reads it. `exiftool` on Linux, or a browser EXIF viewer, can show the same credential.
