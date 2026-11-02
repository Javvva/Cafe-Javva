---
title: "DMZ (Hard)"
description: "Beat the source-port filter, fingerprint Caddy, then follow the header that leaks the SSH credential."
category: "scanning-reconnaissance"
difficulty: "hard"
status: "solved"
season: "2026 NCL Individual"
points: "100 points"
tools: ["nmap", "curl", "ssh"]
---
## Overview and outcome

DMZ (100 points) is a network-enumeration box: hostname `target`, address `10.5.228.130`. We solved Q1 (three open ports) and Q2 (`caddy 2.11.4`) for 30/100. Q3 (the bypass string), Q4 (an internal HTTP port), and Q5 (the flag) stayed gated behind an IP filter that only accepts connections originating on the box itself.

The scenario is a "Liber8tion" server that protects its services from scanning, with hints that there are holes in those protections. The task is to bypass the protections and enumerate the software on the server.

## What we did

1. Beat the scan filter. Ordinary scans timed out, but sourcing from port 106 passed the firewall: `nmap -sS -Pn -p- -g 106 10.5.228.130` showed three open ports - 22 (SSH), 106, and 8000.
2. Fingerprinted the services. Port 8000 is Caddy; port 106 is a BIND recursive resolver (CHAOS `version.bind` = 9.20.26, `hostname.bind` = target); port 22 is OpenSSH 10.0p2. The highest port, 8000, is `caddy 2.11.4` (the Q2 answer).
3. Hit the Caddy gate. Every request returned `Invalid IP address` 403, which we identified as the caddy-defender plugin plus its advisory CVE-2026-46415.
4. Tried every remote bypass. 87 forwarded-IP header combinations (X-Forwarded-For, X-Real-IP, Forwarded, and others), PROXY protocol v1 and v2, IPv6, Host-header fuzzing, and alternate HTTP methods - all blocked.
5. Tested SSH. Password auth is enabled, but common credentials failed and fail2ban rate-limited us after about nine attempts.
6. Drained the DNS server. AXFR attempts, reverse-PTR sweeps, zone-name guesses, and internal-name lookups returned only BIND's built-in empty zones (home.arpa and RFC 6303 reverse zones); the resolver has no internet egress and no custom records.
7. Researched Caddy CVEs. The path-matcher case bypass was patched in 2.11.1, and the Windows path-traversal bypass is fixed in 2.11.4 and Windows-only, so neither applies to this box.

## Technical findings

Architecture: Kali reaches the target only when traffic is sourced from port 106, the firewall's one hole. The target exposes three services - SSH (22), a BIND recursive resolver (106), and Caddy with caddy-defender (8000). The internal HTTP service Q4 asks about is bound to localhost and never exposed externally.

The Caddy gate allows only `127.0.0.1` and returns `Invalid IP address` 403 to everything else. It checks the real connection source IP (RemoteAddr) and ignores all forwarded headers - confirmed by 87 header tests that every returned the identical 403. No path, Host, or method changes the result.

CVE-2026-46415 (caddy-defender reading RemoteAddr instead of the resolved client IP) is real but not usable here: the advisory states deployments where clients connect directly to Caddy are not affected, and we connect directly with no trusted proxy to route through.

The BIND resolver on 106 is recursive but has no internet egress (public names do not resolve) and serves only its built-in empty zones, so it holds no internal records and cannot make HTTP requests - a dead end for pivoting.

The net effect: every route to the backend needs a request originating from `127.0.0.1` on the box, and the only on-box primitive, SSH, is locked by credentials and rate-limiting.

## The walls, and lessons for next time

Q3 through Q5 all require an on-box foothold - a request originating from `127.0.0.1` - that is not exposed to an external attacker. SSH is rate-limited with no known credentials, Caddy is header-proof, the DNS server is empty, and the CVE does not apply to a direct connection. In competition that read as a design wall; post-challenge it proved solvable - see the Confirmed solution below.

Checklist for a similar DMZ box next time:

1. Try source-port tricks early to beat scan filters (`-g 53`, `-g 106`, `-g 20`, `-g 123`).
2. Fingerprint every service, including CHAOS DNS queries against BIND.
3. For an IP-gated reverse proxy, quickly test forwarded headers, PROXY protocol, and the proxy or plugin CVEs, then pivot to hunting for a foothold.
4. Hunt specifically for anything that yields a localhost origin: credentials, an SSRF endpoint, or a server-side request primitive.

Best remaining Q3 guesses if the instance is still live (low confidence, since no working bypass was ever demonstrated): `X-Forwarded-For`, then `::1`.

## Confirmed solution (post-challenge, from community)

The box was solvable; this is the intended path, pieced together from competitor discussion and a Cyber Skyline hint. Two things cost us the solve: we tested only a subset of headers, and we checked only the response body.

Full chain:

1. Scan bypass (Q1). The firewall trusts the source port, not the destination. Source probes from the one already-open service port, 106: `nmap -sS -Pn -p- -g 106 10.5.228.130` reveals 22, 106, 8000.
2. Fingerprint (Q2). The web server on 8000 reports its version in the response headers: `caddy 2.11.4`.
3. Bypass the IP filter (Q3). Real IP spoofing is blocked at the platform level, so do not rely on `X-Forwarded-For`. Sweep a large list of client-IP header names (for example the kaimi gist of \~76 headers) with the value `127.0.0.1`, and diff the full response including response headers against the baseline 403. One uncommon header is honoured; its response is still a 403 but leaks a credential in the response headers. That header, with `127.0.0.1`, is the Q3 answer.
4. SSH in. Decode the leaked credential and log in over SSH (port 22).
5. Find the internal service (Q4). `ss` and `netstat` may be missing, so read `/proc/net/tcp` directly and decode the hex ports by hand. Look for a service listening on loopback only, on a non-default port - it is the web server's own admin API, moved off its default port (normally 2019). That port is the Q4 answer.
6. Read the flag (Q5). Hit the admin API's config endpoint (for example `/config/`). It reveals both the real bypass header and the flag.

What we missed, for next time:

- Sweep the full header list, not a subset - the working header was an uncommon one.
- Diff the entire response, headers included, not just the body. The win was a credential in a response header, invisible to a body-only check.
- "Scan from inside" meant getting a shell via the leaked credential, then reading `/proc/net/tcp` when `ss` and `netstat` are gone.

References: kaimi IP-spoofing header list (gist.github.com/kaimi-/6b3c99538dce9e3d29ad647b325007c1) and OWASP "IP Spoofing via HTTP Headers".
