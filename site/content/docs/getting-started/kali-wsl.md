---
title: "Kali, WSL, and Win-KeX"
description: "Which machine each command ran on, and how the cracking box was set up."
---
Sources: C14, **Enable Kali Visuals**, C13, and parts of C02.

C14 asked how to restore the Kali desktop on Windows, use KeX without full screen, and install Claude inside Kali. All three assistant replies in that original chat failed to load. A later chat explicitly identifies Windows 11, Kali under WSL2, and `kex --win`; that later evidence establishes the environment but does not recover the missing installation steps.

Clipboard troubleshooting distinguished a local Linux terminal from a remote browser terminal. The historical discussion used `clip.exe` only as a local WSL-to-Windows path. It also noted that an empty results file was a data issue rather than a clipboard issue. No Claude installation success is demonstrated by the available source.

**Team preparation:** Before the event, confirm the desktop and clipboard work, the actual cracking tool sees the intended compute device, local converters run on a sample file, and a plain debugger works offline. Label terminals “Windows,” “local Kali,” “scanner,” and “target.” Keep the source files and generated outputs in a separate directory for each challenge.
