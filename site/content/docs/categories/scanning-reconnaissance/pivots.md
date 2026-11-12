---
title: "Pivots (Hard)"
description: "Move from the foothold through SSH and SMB by comparing host config, then find the odd service."
category: "scanning-reconnaissance"
difficulty: "hard"
status: "solved"
season: "2026 NCL Team"
points: "100 points"
tools: ["ssh", "nmap", "smbclient"]
---
## Complete Technical Walkthrough, Investigation Audit & Reusable Reconnaissance Playbook

> **Status: COMPLETE — 100/100 points, three questions accepted.**  
> **Event:** National Cyber League (NCL), Fall 2026 Team Game  
> **Area:** Cyber Command → Scanning & Reconnaissance → Pivots (Hard)  
> **Challenge value:** 100 points (Q1 20, Q2 30, Q3 50)  
> **Challenge date:** November 6–7, 2026 (investigation documented November 7)  
> **Approach:** Authorized reconnaissance, credential discovery, SSH/SMB lateral movement; no vulnerability exploitation required.  
> **Report purpose:** Preserve the successful solve *and* the reasoning, failed hypotheses, commands, caveats, and evidence-handling practices that will improve future competition performance.

**Handling note:** This private training version contains challenge passwords, internal IP addresses, and flags. Do not publish those secrets while an event is active or when competition rules prohibit disclosure. Prepare a sanitized copy for public sharing.

**Evidence convention used throughout:**  
- **[OBSERVED]** — directly supported by command output or a screenshot in the conversation.  
- **[REPORTED]** — supplied in the completed write-up, but not reproduced as raw command output in the available transcript.  
- **[INFERRED]** — plausible interpretation rather than a demonstrated fact.  
- **[RULE]** — constraint stated by the challenge's engagement notes.

---

## 1. Executive summary

The challenge began with SSH access to a host named `foothold`. The intended objective was to map progressively isolated networks, discover credentials through reconnaissance, move through three SSH identities, and identify an unusual TCP service on the deepest network. The decisive difficulty was **credential placement**, not exploitation: after many failed attempts to find the next secret in network services, a **differential comparison of two similar hosts' readable configuration files** highlighted `/etc/profile` on `dev`. Its trailing line exported an unusual value:

```sh
export INTERNAL=Coherence-Java-Scrooge2
```

The value worked as the SSH password for `level3` at `10.11.229.100`. Inside that host (`internal`), a readable, root-owned `.bash_history` contained the syntax and credentials for an authenticated SMB connection as `level3-smb` to a share named `internal`. That share contained `flag2.txt`. From `internal`, network-interface inspection exposed a fourth `/27` segment. A restrained TCP-connect scan of its responsive hosts found a previously unknown service at `10.11.229.132:843`, whose banner provided the final flag [REPORTED]. The competition UI subsequently showed all three questions completed [OBSERVED].

### 1.1 Accepted answers

| Question | Points | Actual result | Evidence |
|---|---:|---|---|
| Q1 — contents of `flag1.txt` | 20 | **`SKY-BNED-1567`** | Downloaded from guest-readable `public` SMB share [OBSERVED] |
| Q2 — contents of `flag2.txt` | 30 | **`SKY-BGHH-7925`** | `smbclient get` then local `cat /tmp/flag2.txt` [OBSERVED] |
| Q3 — flag from unknown deepest-segment service | 50 | **`SKY-AJFF-5275`** | Flag and banner method in supplied final write-up [REPORTED]; Q3 accepted on screenshot [OBSERVED] |

**Flag-length detail:** The Q1 and Q2 flag values contain 13 printable characters. A 14-byte file is consistent with the value followed by a newline (`\n`); it does not imply a missing character.

### 1.2 Completion evidence

![NCL Pivots (Hard) completion screenshot: Success; Q1, Q2, and Q3 marked complete](evidence/screenshots/pivots_hard_completed_100of100.png)

*Figure 1.* The competition interface states **“Success! You have completed all the questions for this challenge.”** Three green checkmarks appear beside Q1–Q3. The screenshot also shows `OPEN: 10.11.229.132:843` in the terminal. The exact Q3 flag text is supplied in the accompanying completed write-up, not visible in this screenshot.

### 1.3 The actual lesson

**Do not confuse “we searched for credential-looking strings” with “we examined the host's configuration.”** A deliberately named environment variable such as `INTERNAL` may be missed by keyword searches for `password`, `secret`, `flag`, or `level3`. Comparing differences between nearly identical systems turned a huge, low-signal filesystem into a short list of anomalies.

---

## 2. Authorization, scope, and challenge constraints

The challenge's engagement notes framed the task as reconnaissance and information gathering, with credential-based lateral movement in scope and exploitation unnecessary [RULE]. The starting host was `foothold`; the initial username and password were both `level1`.

The notes also supplied useful search-space constraints:

1. Usernames follow `level1`, `level2`, `level3`, ... [RULE].
2. Intermediate segments expose SSH and SMB on standard ports [RULE]. In practice an SMB listener was also observed on TCP 139, consistent with NetBIOS Session Service; the notes were a heuristic rather than a precise packet-level claim.
3. The deepest segment hosts a *new* service somewhere in TCP 1–1023 [RULE].
4. `chisel` was provided on Kali, but the successful solution did **not** require Chisel; SSH forwarding was sufficient for the access demonstrated.
5. The scope was the challenge instance's internal addresses. No external hosts or unrelated systems were required.

**Competition process note:** Read the engagement notes before touching the network. They explain why a full 65,535-port scan of each intermediate host would waste time and why `10.11.229.100` was likely an intermediate hop rather than the final service.

---

## 3. Final topology and trust boundaries

### 3.1 Diagram

```text
Segment 0 — 10.11.229.32/27
  Kali (attacker) ─── SSH ───> foothold [10.11.229.36, level1]
                                    |
                                    | second interface .69
                                    v
Segment 1 — 10.11.229.64/27
  foothold .69 ------ dev .66 [SSH, level2] ------ smb .68 [SMB]
                          |                           |
                          | second interface .98      | second interface .101
                          v                           v
Segment 2 — 10.11.229.96/27
                      dev .98 ------ internal .100 [SSH, level3]
                                              |
                                              | second interface .130
                                              v
Segment 3 — 10.11.229.128/27 (deepest)
                                           internal .130
                                               |
                                 .129   .131   .132 [TCP 843 → Q3]
```

The Samba addresses `.68` and `.101` refer to the **same multi-homed Samba container** [OBSERVED from matching reverse-DNS container identifier and identical share contents]. The drawing reflects connectivity, *not* an assertion that a host routes traffic between its attached networks by default. Each authorized SSH login creates an application-level pivot.

### 3.2 Network inventory

| Segment | CIDR | Known IPs and roles | Access milestone |
|---|---|---|---|
| Initial | `10.11.229.32/27` | `foothold` `.36`; Kali instance | SSH as `level1` |
| Intermediate 1 | `10.11.229.64/27` | `dev` `.66`; `.67` ICMP-responsive; Samba `.68`; foothold `.69` | Anonymous Samba → `level2` |
| Intermediate 2 | `10.11.229.96/27` | `dev` `.98`; `.99` ICMP-responsive; `internal` `.100`; Samba `.101` | `/etc/profile` → `level3` |
| Deepest | `10.11.229.128/27` | `.129` ICMP-responsive; `internal` `.130`; `.131` ICMP-responsive; **`.132:843`** | TCP service → Q3 |

The broadcast/network endpoints are not targets. The deepest `/27` has usable addresses `.129`–`.158`; the scan focused first on the three other ICMP-responsive IPs reported in the sweep. A host that fails ICMP is not necessarily down: this was a pragmatic narrowing step, not a universal discovery guarantee.

### 3.3 Evidence for the pivots

On Dev [OBSERVED]:

```text
lo       127.0.0.1/8
eth0     10.11.229.66/27
eth1     10.11.229.98/27
```

Relevant routes:

```text
10.11.229.64/27 dev eth0 src 10.11.229.66
10.11.229.96/27 dev eth1 src 10.11.229.98
```

There was **no default IPv4 route** on Dev. This explains why blindly assuming that Dev could reach the deepest segment was incorrect.

On `internal` as `level3` [OBSERVED]:

```text
eth0     10.11.229.130/27
eth1     10.11.229.100/27

10.11.229.96/27  dev eth1 src 10.11.229.100
10.11.229.128/27 dev eth0 src 10.11.229.130
```

Seeing `10.11.229.130/27` directly established the previously unseen fourth network. The final service was not reachable by the earlier host without pivoting.

### 3.4 Host/service summary

| Host or IP | Observed service(s) | Other facts |
|---|---|---|
| `foothold` `.36` | SSH 22 | Initial access as `level1` |
| `dev` `.66` | SSH 22 | SSH as `level2`; `127.0.0.1:9000` was our own temporary SSH/Chisel tunnel |
| `smb` `.68` and `.101` | SMB 445; `.101` also TCP 139 | Identical container ID in reverse DNS; guest `public`; authenticated `internal` |
| `.67` and `.99` | ICMP-responsive, no discovered TCP listener in documented checks | Role remains unconfirmed; ARP presence alone did not identify a service |
| `internal` `.100` | SSH 22 | SSH as `level3`; also `.130` on deepest subnet |
| `.129`, `.131` | ICMP-responsive | No TCP 1–1023 listener found by the documented Python scan |
| `.132` | **TCP 843** | Newly found service; returned Q3 flag [REPORTED] |

The Docker-style MAC format (`02:42:...` derived from the IPv4 address) and reverse DNS were useful for topology corroboration, **not** a credential source.

---

## 4. Credential provenance and access chain

| Order | Identity / secret | Source and discovery | Where it worked | Confidence |
|---|---|---|---|---|
| Starting access | `level1` / `level1` | Challenge introduction | SSH to `foothold` | [OBSERVED] |
| Second hop | `level2` / `spoof-front-dusk` | Guest SMB file `public/auth.conf` | SSH to Dev `.66` | [OBSERVED] |
| Third hop | `level3` / `Coherence-Java-Scrooge2` | Dev `/etc/profile` line `export INTERNAL=...` | SSH to `internal` `.100` | [OBSERVED] |
| Protected SMB | `level3-smb` / `gratify-maximum-graduate` | Command stored in `internal` user's `.bash_history` | `//smb/internal` SMB share | [REPORTED discovery, OBSERVED successful authentication] |

**Critical architecture distinction:** The SSH accounts and Samba account were authenticated independently. An SSH password that works for `level2` does not imply a matching Samba login. The `level2`/`spoof-front-dusk` SMB login returned `NT_STATUS_LOGON_FAILURE`. Conversely, a Samba account's existence does not prove it is a valid SSH username.

**Another important correction:** The private `internal` share did not *magically come into existence* after entering the password. The evidence shows the share was **inaccessible or undiscoverable to the earlier anonymous and incorrect-credential sessions**, then accessible after authenticating as `level3-smb`. The server-side implementation and share visibility policy were not inspected.

---

## 5. Clean, reproducible solve path

The following is a concise reconstruction of the successful route. Commands specify the host. Passwords are shown in explanatory text rather than embedded in command-line arguments wherever possible.

### Phase A — Establish Foothold access and inspect the first segment

**On Kali:**

```bash
ssh level1@foothold
# Password: level1
```

**On Foothold:**

```bash
whoami
hostname
ip -br addr
ip -4 route
```

The second interface exposed the `10.11.229.64/27` segment. The guest-accessible Samba service was at `10.11.229.68:445`.

For SMB tooling on Kali, establish a local port forward **from Kali** through Foothold:

```bash
ssh -o ExitOnForwardFailure=yes -fN \
  -L 127.0.0.1:25446:10.11.229.68:445 \
  level1@foothold
```

This makes `127.0.0.1:25446` on Kali connect to the Samba service through Foothold. It does *not* make SMB run on Kali.

### Phase B — Guest SMB → Flag 1 and Level 2 password

**On Kali:**

```bash
smbclient -L //127.0.0.1 -p 25446 -N
smbclient //127.0.0.1/public -p 25446 -N -c 'ls'
smbclient //127.0.0.1/public -p 25446 -N \
  -c 'get flag1.txt /tmp/ncl_flag1.txt; get auth.conf /tmp/ncl_auth.conf'

cat /tmp/ncl_flag1.txt
cat /tmp/ncl_auth.conf
```

**Observed remote files:**

```text
public/
  flag1.txt
  auth.conf
```

**Observed flag:**

```text
SKY-BNED-1567
```

**`auth.conf`:**

```ini
[authentication]
user='level2'
password='spoof-front-dusk'
```

The file was only **65 bytes**, and a byte-level inspection did not find additional hidden content. This was the correct and complete first-stage breadcrumb, rather than a document to keep probing for concealed secrets.

### Phase C — SSH pivot to Dev

**On Kali:**

```bash
ssh -J level1@foothold level2@10.11.229.66
# Enter level1, then spoof-front-dusk
```

**On Dev:**

```bash
whoami
hostname
ip -br addr
ip -4 route
```

Expected identity: `level2` on `dev`. Dev attached to the `10.11.229.64/27` and `10.11.229.96/27` segments. Target `10.11.229.100` exposed SSH 22, but the credential required for `level3` remained unknown at this stage.

**Optional convenient tunnel (on Kali):**

```bash
ssh -o ExitOnForwardFailure=yes -fN \
  -L 127.0.0.1:25445:10.11.229.101:445 \
  -J level1@foothold level2@10.11.229.66
```

This creates a separate SMB forward to the same Samba container's `.101` interface. It is **not** required to rediscover the `public` files, but it was used later to retrieve Q2 from Kali.

**Optional SOCKS pivot (on Kali):**

```bash
ssh -o ExitOnForwardFailure=yes -fN \
  -D 127.0.0.1:1080 \
  -J level1@foothold level2@10.11.229.66
```

This was used for ProxyChains TCP-connect reconnaissance. **SOCKS5 is not equivalent to arbitrary UDP reachability.** TCP scans through ProxyChains cannot prove UDP ports are closed.

### Phase D — The actual Level 3 breakthrough: compare configurations

Initial keyword-based filesystem scans searched for `password`, `credential`, `level3`, `flag2`, etc. but did not uncover the next secret. The reason became clear once `/etc/profile` was read: the line used **`INTERNAL`**, a term absent from the search expressions.

The successful investigation shifted from **“find matching names/strings”** to **“find unexpected differences between similar hosts.”** Foothold and Dev contained substantially the same Debian image, with `/build/build.sh` and many package files in common.

1. Generate an inventory of readable paths from both hosts (excluding `/proc`, `/sys`, `/dev` and symlinks).
2. Compare the sorted path lists.
3. Compare hashes of small readable files in `/etc`, `/build`, `/opt`, `/srv`, and `/mnt` (in the investigation, maximum 256 KiB).
4. Examine differences not explained by hostname, user identity, or SSH host keys.

The 12 paths reported as changed were:

```text
/etc/group
/etc/hostname
/etc/hosts
/etc/passwd
/etc/passwd-
/etc/profile                    <-- useful anomaly
/etc/ssh/ssh_host_ecdsa_key.pub
/etc/ssh/ssh_host_ed25519_key.pub
/etc/ssh/ssh_host_rsa_key.pub
/etc/ssh/sshd_config
/etc/subgid
/etc/subuid
```

Unlike `hostname`, `passwd`, or host-key material, **`/etc/profile` was not an obvious per-host identity file**. A direct read from Dev [OBSERVED]:

**On Kali:**

```bash
ssh -J level1@foothold level2@10.11.229.66 \
  'tail -n 25 /etc/profile'
```

**Relevant output:**

```sh
export INTERNAL=Coherence-Java-Scrooge2
```

This provided a testable candidate for the `level3` account (the user sequence was in the challenge rules). Authentication succeeded.

**Why the config diff mattered:** Reading `/etc/profile` directly would have worked too; **the diff was the investigative method that drew attention to it** after other approaches had failed. This is a transferable technique, not a claim that a hash comparison is inherently necessary.

### Phase E — Login to Level 3 (`internal`)

**Simplest command, run on Kali with a terminal allocated:**

```bash
ssh -tt -J level1@foothold level2@10.11.229.66 \
  'ssh -tt -o StrictHostKeyChecking=accept-new level3@10.11.229.100'
```

The inner SSH asks for the discovered Level 3 password:

```text
Coherence-Java-Scrooge2
```

**Confirmed session prompt:**

```text
level3@internal:~$
```

**Alternative actually used during the investigation (Kali ControlMaster):**

```bash
ssh -M -S /tmp/dev -fN \
  -J level1@foothold level2@10.11.229.66

ssh -S /tmp/dev -t 10.11.229.66 \
  'ssh -o StrictHostKeyChecking=no level3@10.11.229.100'
```

This alternative depends on a matching, working control socket and prior SSH connection. In future work, prefer `StrictHostKeyChecking=accept-new` or verified keys rather than globally disabling host-key checks.

### Phase F — Discover the protected SMB account and Flag 2

**On `level3@internal`:**

```bash
pwd
ls -la ~
cat ~/.bash_history
```

The home directory contained a small, readable, root-owned `.bash_history` from before the session [OBSERVED metadata]. The supplied write-up records the following exact clue [REPORTED]:

```bash
smbclient //smb/internal -U level3-smb --password="gratify-maximum-graduate"
```

This finally explained why the previously discovered `level3-smb` Samba account existed. It was **not** the SSH Level 3 identity; it was a separate account for the Samba share named `internal`.

**On Kali**, using the existing local forward to Samba `.101:445`:

```bash
smbclient //127.0.0.1/internal -p 25445 \
  -U level3-smb -c 'ls'
# Enter: gratify-maximum-graduate
```

**Observed result:**

```text
.                                   D
..                                  D
flag2.txt                           N       14
```

**On Kali:**

```bash
smbclient //127.0.0.1/internal -p 25445 \
  -U level3-smb -c 'get flag2.txt /tmp/flag2.txt'

cat /tmp/flag2.txt
```

**Observed Q2 flag:**

```text
SKY-BGHH-7925
```

An earlier attempt to list shares as `level3-smb` returned `NT_STATUS_LOGON_FAILURE`; the later authenticated `internal` share access succeeded. The transcripts do **not** establish that the earlier login attempt used the new, correct password, so there is no justified conclusion that Samba behaved inconsistently.

### Phase G — Expose the deepest segment

**On `level3@internal`:**

```bash
ip -br addr
ip -4 route
```

**Observed addresses:**

```text
eth0  10.11.229.130/27
eth1  10.11.229.100/27
```

The new subnet was `10.11.229.128/27`. This proved a fourth segment existed and was directly attached to `internal`.

For a quick discovery pass, `ping` found [OBSERVED]:

```text
10.11.229.129
10.11.229.131
10.11.229.132
```

plus `10.11.229.130` (the current host, excluded from the remote target list). This discovery strategy is efficient for this particular challenge; an ICMP-only sweep is not proof that other addresses lack TCP services.

### Phase H — Find the well-known-port service and Flag 3

The challenge notes directed the search to ports 1–1023 on the **deepest** network. `nmap` was not available on `internal` in the observed command (`command -v nmap && nmap ...` printed nothing), so a threaded Python TCP-connect scan replaced it.

**On `level3@internal`:**

```bash
python3 - <<'PY'
import socket
from concurrent.futures import ThreadPoolExecutor

hosts = ["10.11.229.129", "10.11.229.131", "10.11.229.132"]

def check(target):
    host, port = target
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return host, port
    except OSError:
        return None

for host in hosts:
    print(f"=== {host} ===", flush=True)
    with ThreadPoolExecutor(max_workers=64) as pool:
        for result in pool.map(check, ((host, p) for p in range(1, 1024))):
            if result is not None:
                print(f"OPEN: {result[0]}:{result[1]}", flush=True)

print("SCAN COMPLETE")
PY
```

**Observed (twice):**

```text
=== 10.11.229.129 ===
=== 10.11.229.131 ===
=== 10.11.229.132 ===
OPEN: 10.11.229.132:843
SCAN COMPLETE
```

**Banner-grab command from supplied write-up [REPORTED final step], on `level3@internal`:**

```bash
python3 - <<'PY'
import socket

with socket.create_connection(("10.11.229.132", 843), timeout=4) as s:
    s.settimeout(3)
    print(repr(s.recv(4096)))
PY
```

Reported response:

```text
b'SKY-AJFF-5275\n'
```

**Q3 = `SKY-AJFF-5275`** [REPORTED]. The screenshot independently confirms that the platform accepted Q3.

**Port 843 caution:** TCP 843 is historically associated with a Flash socket-policy service. A port number alone does **not** establish the service's actual application protocol. In this instance, the useful observed behavior in the supplied write-up was a flag banner upon TCP connection; calling it an actual Flash policy daemon would go beyond the evidence.

---

## 6. The investigative detour: exactly what was tried

The failed paths are important because they show where time was lost and how to avoid that pattern in a future event. Each row records *what the test established*, not an exaggerated claim that an entire class of techniques was impossible.

| Investigated surface | Result | What the result does and does not prove | Next-time improvement |
|---|---|---|---|
| Anonymous `public` SMB recursion | `flag1.txt` and `auth.conf` only | Guest-visible contents enumerated for that share | Save files and move on once fully read |
| `auth.conf` byte-level inspection | 65 bytes | No hidden payload within that exact file | Avoid repeated hexdumps |
| Anonymous RPC (`enumdomusers`, `queryuser`, `netshareenumall`, etc.) | `level3-smb` RID 1000 found; no password | Account exists; no credential disclosed anonymously | Keep account in clue ledger, but do not guess |
| `level2`/known-password SMB auth | `NT_STATUS_LOGON_FAILURE` | That SMB identity/password rejected | Do not confuse SSH and SMB identities |
| Guessed Samba home/share names | `NT_STATUS_BAD_NETWORK_NAME` | Specific requested names unavailable in those contexts | Does not disprove all non-browseable or access-controlled shares |
| Known usernames on `.100` with Level 2 password | SSH rejected | No reuse under the tested combinations | Seek credential disclosure |
| TCP scans of intermediate network | `.100:22`, `.101:139,445` | Restricted low-port TCP exposure supported | Obey scope note; no need to full-scan everything |
| High-port scan of `.67` | No discovered TCP service | No positive evidence from that scan | Treat ICMP-responsive hosts cautiously |
| Select UDP checks | Selected ports closed/filtered | Does not eliminate all UDP on segment | Don't generalize “all UDP dead” |
| Keywords across readable host files | No new secret initially | Filter omitted `INTERNAL`, the actual winning string | Profile/config inspection + comparison |
| Private-key-header search in selected directories | No result | No key with those recognizable headers in those readable locations | Close the narrow test, not every key hypothesis |
| `~/.ssh` and `ssh-add -l` on Dev | Only `known_hosts`, no agent socket | No loaded agent key in that session; no default private key | Avoid more key guessing without evidence |
| Foothold hashed known-host entries | Resolved to Dev `.66` in supplied investigation notes | No newly discovered host from those entries | Check provenance/timestamps before pursuing |
| `/opt/alt-man` | Plain helper script | No secret in the bytes inspected | Do not elevate stock helpers into clues |
| `/build/build.sh` | Generic OpenSSH setup/provisioning script | Shows how keys *could* be provisioned; not that they were | Distinguish code capability from runtime evidence |
| Dev `127.0.0.1:9000` | HTTP 404 “Not found” | Our own SSH reverse-forward to local Chisel server | Correlate with `ps` and local port forwards |
| Dev processes, `/proc`, cron, mounts | No credential discovered; some unreadable | Partial visibility only | Record permission failures rather than declaring exhaustion |
| `/var/mail/mail` | 677 bytes, `0600 mail:mail` | Not readable by `level2`; content not established | Do not equate “different file” with “clue” |
| Name/DNS/ARP study of `.67`, `.99` | Docker-style MACs; no PTR for some hosts | Better map; no auth discovery | Stop when marginal information gain falls |
| Full readable-file path inventory diff | Only five Dev-only files | Did **not** detect same-path content changes | Hash shared files too |
| **Readable configuration hash diff** | 12 changed config paths; `/etc/profile` noteworthy | **Directed investigation to actual password** | Repeat in similar-image environments |

### 6.1 The unproductive mailbox lead

`/var/mail/mail` appeared in the five-file Dev-only inventory:

```text
-rw------- 1 mail mail 677 Nov 7 03:47 /var/mail/mail
```

It was not readable by `level2`. Its existence is evidence of a local mail spool, **not** evidence that it held the answer. Permission limitations were respected; no exploitation or permission bypass was needed.

### 6.2 Why the Chisel listener was a false positive

Kali process listing explicitly showed [OBSERVED]:

```text
/root/chisel server -p 9000 --reverse
ssh ... -R 127.0.0.1:9000:127.0.0.1:9000 ... level2@10.11.229.66
```

Dev exposed a loopback listener at `127.0.0.1:9000`, whose HTTP response returned a short `404 Not Found` and `Not found` body. This was forwarded to the operator's own Chisel server, *not* a newly discovered application on Dev. Killing the two identified PIDs removed this temporary infrastructure, and an immediate SSH test verified Dev access remained intact:

```text
level2
dev
```

**Reusable lesson:** Before enumerating a strange open socket, ask whether **you** created it with `ssh -L`, `ssh -R`, `ssh -D`, Chisel, Socat, or a scanning proxy. Maintain a tunnel ledger.

### 6.3 Why process/file “exhaustion” claims were risky

Some earlier commands silently failed because `find` was not installed; others hung because `grep -rl "PRIVATE KEY" /` traversed pseudo-filesystems before filtering filenames in a second `grep`. There were also multiple `Permission denied` results under `/proc`, `/root`, and `/home/player`. None of those commands constituted a conclusive all-files search.

**Correct interpretation:** “No hit in the files this user could read using this method,” not “no key or secret exists anywhere.”

---

## 7. The winning technique in detail: differential host configuration analysis

This was the most reusable new method from the event.

### 7.1 Why a path-only diff was not enough

The first inventory compared paths and showed just five paths present only on Dev:

```text
/home/level2/.bash_history
/home/level2/.ssh/known_hosts
/tmp/ch.log
/tmp/chisel
/var/mail/mail
```

This missed a modified file that existed on *both* systems: `/etc/profile`.

The follow-up compared **hashes**, not paths, of readable files in selected config directories. This produced the 12-file anomaly set shown in Phase D.

### 7.2 Reusable safe hash-diff recipe

The commands below compare **small readable regular files** on two hosts. They neither elevate privileges nor modify the remote targets. Adapt the hostnames, connection paths, and directory list to the engagement.

**On Kali, create the inventory program:**

```bash
cat > /tmp/ncl_compare.py <<'PY'
import os
import hashlib

roots = ["/etc", "/build", "/opt", "/srv", "/mnt"]

for root in roots:
    for directory, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs
                   if not os.path.islink(os.path.join(directory, d))]
        for name in files:
            path = os.path.join(directory, name)
            try:
                if os.path.islink(path):
                    continue
                if os.path.getsize(path) > 262144:
                    continue
                with open(path, "rb") as fh:
                    digest = hashlib.sha256(fh.read()).hexdigest()
                print(path + "\t" + digest)
            except OSError:
                pass
PY
```

**On Kali, collect Foothold and Dev hashes (the command prompts for SSH passwords):**

```bash
ssh level1@foothold 'python3 -' < /tmp/ncl_compare.py \
  > /tmp/ncl_foothold.sha256paths

ssh -J level1@foothold level2@10.11.229.66 'python3 -' \
  < /tmp/ncl_compare.py > /tmp/ncl_dev.sha256paths
```

**On Kali, print changed or newly readable paths:**

```bash
python3 - <<'PY'
def load(path):
    out = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                name, digest = line.rstrip("\n").split("\t", 1)
                out[name] = digest
            except ValueError:
                pass
    return out

a = load("/tmp/ncl_foothold.sha256paths")
b = load("/tmp/ncl_dev.sha256paths")

for path in sorted(b):
    if path not in a:
        print("NEW:", path)
    elif a[path] != b[path]:
        print("CHANGED:", path)
PY
```

**Prioritization heuristic:**
- Expected differences: `/etc/hostname`, `/etc/hosts`, `/etc/passwd`, host public keys, user/group databases.
- Interesting differences: `/etc/profile`, `/etc/profile.d/*.sh`, `/etc/environment`, SSH configs with nonstandard options, application configs, startup scripts, small custom files.
- Read the *unexpected changes* before expanding the search.
- Compare metadata and source of changes so you do not mistake your own working files for challenge artifacts.

### 7.3 Alternative “10-second” checks for future competitions

Instead of waiting until the very end, include this short check when you first gain a new Linux shell:

**On the newly compromised-in-scope host:**

```bash
printf '\n=== Environment variable names ===\n'
env | cut -d= -f1 | sort

printf '\n=== Shell profile tail ===\n'
tail -n 40 /etc/profile 2>/dev/null

printf '\n=== User startup files ===\n'
for f in ~/.profile ~/.bashrc ~/.bash_history; do
  [ -r "$f" ] && { echo "==== $f ===="; tail -n 50 "$f"; }
done

printf '\n=== Profile snippets ===\n'
ls -la /etc/profile.d 2>/dev/null
```

This is **targeted config enumeration**, not a claim that all secrets will be located there. In this instance the actual `INTERNAL` value was exported by `/etc/profile`, and the Samba credential was recorded in `.bash_history`.

---

## 8. Reconnaissance and pivoting mini-playbook for future CTFs

### 8.1 On first access: five-minute host triage

1. Confirm `whoami`, `id`, `hostname`, `pwd`, `ip -br addr`, and `ip route`.
2. Read the challenge engagement notes and mark each statement as **rule**, **hint**, or **hypothesis**.
3. Write a small asset table: IP, interfaces, service ports, hostname, current credential, reachable-from host.
4. Check shell startup files and obvious share/config clues *early*.
5. Start an evidence log before spawning numerous tunnels.

**Linux triage snippet:**

```bash
whoami; id; hostname; pwd
ip -br addr
ip -4 route
ls -la ~ /
tail -n 30 /etc/profile 2>/dev/null
ls -la ~/.ssh 2>/dev/null
```

### 8.2 SMB method: distinguish identity, share, and permission

When an SMB endpoint is found:

```bash
smbclient -L //HOST -N
smbclient //HOST/public -N -c 'ls'
rpcclient -U '' -N HOST -c 'enumdomusers; netshareenumall'
```

Always record which stage failed:
- **`NT_STATUS_LOGON_FAILURE`** — the supplied authentication was not accepted.
- **`NT_STATUS_BAD_NETWORK_NAME`** — that share name was not available in that context; does not prove all other shares are absent.
- **`NT_STATUS_ACCESS_DENIED`** — server denied that operation; authorization may be separate from session setup.
- **Successful listing** — preserve remote pathname, byte size, timestamps, and downloaded file hashes.

Never equate an RPC user home-path attribute with a confirmed accessible SMB share. Conversely, do not assume an anonymous share list is exhaustive of every share available after authentication.

### 8.3 SSH pivoting: keep the route and terminal straight

**Hop through Foothold to Dev:**

```bash
ssh -J level1@foothold level2@10.11.229.66
```

**Hop from Dev to Level 3:**

```bash
ssh -tt -J level1@foothold level2@10.11.229.66 \
  'ssh -tt level3@10.11.229.100'
```

**Local SMB forward on Kali:**

```bash
ssh -fN -L 127.0.0.1:25445:10.11.229.101:445 \
  -J level1@foothold level2@10.11.229.66
```

**SOCKS, if needed for TCP tools:**

```bash
ssh -fN -D 127.0.0.1:1080 \
  -J level1@foothold level2@10.11.229.66
```

Two anti-confusion rules:
- Write **“run on Kali / Foothold / Dev / internal”** beside every command.
- Prefer a small set of named, documented forwards to accumulating overlapping ports (`1445`, `2445`, `3445`, `4445`, `25445`, `25446`, ...).

### 8.4 Know whether a service is your own

Before reacting to a new local listener:

```bash
ps auxww | grep -E '[s]sh|[c]hisel|[s]ocat'
ss -lntp
```

On a non-root account, `ss` may list the socket but not reveal its owning process; correlate it with the operator's own `ps` output and forwarding commands.

### 8.5 Use narrow scans, record limitations

The challenge specifically told participants to seek a well-known TCP port on the deepest segment. Once on Level 3, scanning TCP 1–1023 on the discovered live hosts was appropriate.

When `nmap` is unavailable, Python's `socket.create_connection` is a portable replacement for a small TCP-connect scan. Limit concurrency. Do not launch 1,023 background Bash processes per host; those commands increase noise and can overwhelm a small CTF container.

A **successful TCP connect** shows an open port at that moment. A connection timeout can arise for multiple reasons. ICMP-unresponsive ≠ no TCP service; SOCKS TCP ≠ UDP.

### 8.6 Timebox weak hypotheses

Suggested priority order for a reconnaissance-only pivot challenge:
1. Exploit **known strong evidence** (explicit file, script, username, profile difference, command history).
2. Inspect easily missed local configuration at each newly accessed host.
3. Test one clean hypothesis with a decisive low-cost probe.
4. Record the result, then *close or downgrade* the hypothesis.
5. Reserve exhaustive scans and broad recursive searches for when scope or evidence warrants them.

**Bad pattern seen here:** repeatedly inventing one more service test without revisiting the assumption that credentials had to live in SMB or SSH keys.

---

## 9. Investigation chronology and decision audit

| Sequence | Information gained | Decision / effect |
|---:|---|---|
| 1 | Initial `level1` access to Foothold | Map first internal `/27` |
| 2 | Anonymous Samba `public` contained `flag1.txt` and `auth.conf` | Q1 solved; `level2` credential acquired |
| 3 | SSH to Dev; second `/27` revealed | Locate `.100` SSH and `.101` Samba |
| 4 | RPC found `level3-smb` but no password | Keep as unresolved breadcrumb |
| 5 | Many SMB/SSH auth guesses failed | Incorrectly overemphasized service-centric approach |
| 6 | DNS, MAC, UDP, TCP and key/file searches added little | Several blind alleys; capture precise negative scope |
| 7 | Unusual port `9000` observed on Dev | Traced to own Chisel/SSH reverse forward; false positive |
| 8 | Filesystem path inventory compared two similar hosts | Only 5 Dev-only files; no useful readable candidate |
| 9 | **Hash comparison of same-path config files** | `/etc/profile` singled out |
| 10 | `/etc/profile` exported `INTERNAL` password | SSH as `level3` succeeded |
| 11 | `.bash_history` on Level 3 gave `level3-smb` credentials | `internal` SMB share listed `flag2.txt` |
| 12 | Flag 2 downloaded and read | `SKY-BGHH-7925` |
| 13 | Level 3's `.130/27` interface exposed deepest segment | `.129`, `.131`, `.132` ICMP-responsive |
| 14 | Focused TCP 1–1023 scan found `.132:843` | Final service located |
| 15 | Banner obtained Q3 [REPORTED] and scoreboard marked all accepted [OBSERVED] | 100/100 complete |

**Efficiency improvement:** Had the quick shell/profile/history check been part of the initial Dev triage, the investigation likely would have skipped a large fraction of the unsuccessful scanning and password speculation. This is retrospective guidance, not proof of what would have happened.

---

## 10. Evidence ledger and what is still missing

The attached screenshot and the user-supplied written record support the principal outcome. Some raw artifacts may still be collected to make this a high-quality, independently reviewable submission.

| ID | Artifact | Current status | What it proves or adds |
|---|---|---|---|
| E01 | Completion screenshot | **Included**: `evidence/screenshots/pivots_hard_completed_100of100.png` | All three questions marked complete; terminal shows `.132:843` |
| E02 | Original working write-up | **Included**: `evidence/source_notes/original_user_writeup.txt` | Source narrative, claims, command snippets |
| E03 | `flag1.txt` as downloaded from Samba | To collect | Exact bytes and newline |
| E04 | `auth.conf` as downloaded from Samba | To collect | Level 2 credential origin |
| E05 | Dev `/etc/profile` raw copy | To collect | Level 3 password source |
| E06 | The 12-line changed-config report | To collect | How the anomaly was selected |
| E07 | `internal` `~/.bash_history` raw copy | To collect | Protected SMB credential origin |
| E08 | `flag2.txt` from authenticated SMB | To collect | Exact bytes of Q2 |
| E09 | `ip -br addr` / routes from Dev and internal | To collect | Multihop topology |
| E10 | Raw TCP 1–1023 final-segment scan output | To collect | Discovery of `.132:843` |
| E11 | TCP 843 raw banner output | To collect | Exact Q3 flag and protocol behavior |
| E12 | All significant failed-command outputs | Optional | Evidence for ruled-out specific hypotheses |

**Q3 provenance note:** We have the Q3 value in the supplied completed write-up and a success screenshot, but the raw `recv(4096)` output is not independently available in the conversation. Preserve that terminal output if available. Do not fabricate a replacement transcript.

### 10.1 Suggested evidence folder layout

```text
ncl_pivots_hard_report/
├── NCL_Pivots_Hard_2026_Deep_Report.md
└── evidence/
    ├── screenshots/
    │   └── pivots_hard_completed_100of100.png
    ├── source_notes/
    │   └── original_user_writeup.txt
    ├── raw_commands/          # future terminal transcripts
    ├── downloaded_files/      # flag1.txt, auth.conf, flag2.txt, etc.
    ├── network/               # ip, route, host scan results
    └── manifest.csv           # filenames + SHA-256 + provenance notes
```

### 10.2 How to collect evidence responsibly

When the challenge instance is still reachable and rules allow collecting it, record the **exact command, host identity, current time in UTC, raw output, and file hash**. This example saves local operator output to a timestamped file:

**On Kali:**

```bash
mkdir -p evidence/raw_commands
date -u '+%Y-%m-%dT%H:%M:%SZ' | tee evidence/raw_commands/collection_utc.txt
sha256sum /tmp/flag2.txt 2>/dev/null
```

For output produced by `ssh`, direct it to a local file on Kali (not a remote path) and label the file with the remote host. Beware of logging passwords in cleartext. Avoid capturing interactive password prompts in command transcripts or command-line argument lists.

**Always distinguish:**
- **Source observation:** actual raw bytes/terminal lines.
- **Interpretation:** why the observation matters.
- **Hypothesis:** an explanation still awaiting confirmation.
- **Proof of acceptance:** competition UI/screenshot.

### 10.3 Screenshot collection checklist

Capture:
- Challenge title, point values, category, and engagement note (if rules permit).
- Anonymous SMB `public` listing with `flag1.txt` and `auth.conf`.
- Dev `/etc/profile` with `INTERNAL` clue (redact password if sharing publicly).
- Config comparison showing `/etc/profile` as `CHANGED`.
- Level 3 `whoami`, hostname, and `ip -br addr`.
- `~/.bash_history` breadcrumb (redact the SMB password in public copies).
- Authenticated SMB `internal` listing with `flag2.txt`.
- Deep-segment TCP scan output for `.132:843`.
- Final 100/100 completion screen (already included).

---

## 11. Corrections and confidence boundaries in the original write-up

This section exists to keep the report technically accurate rather than allowing a polished story to overstate the evidence.

1. **Flag 2 placeholder replaced.** Original source text showed `SKY-XXXX-XXXX`; the direct downloaded `flag2.txt` output was `SKY-BGHH-7925` [OBSERVED].
2. **Private `internal` SMB share:** Authentication revealed access to the share; there is **no evidence the share was created at login time**. Avoid saying it “genuinely did not exist until authenticated.”
3. **`.67` and `.99`:** ICMP/ARP replies do not prove whether they are separate Docker containers, network infrastructure, or multi-homed endpoints. No PTR answer is not a host fingerprint.
4. **SSH known_hosts entries:** Prior working notes report HMAC checks matching Dev `.66`, but those calculations are not reproduced in this report's attached raw evidence. Treat them as investigative notes, not a cryptographic proof newly repeated here.
5. **UDP:** Individual closed UDP ports do not rule out all UDP services.
6. **Filesystem searches:** Some searches were keyword-limited or blocked by filesystem permissions; they did not “fully exhaust” the entire host.
7. **SSH private-key generation script:** `/build/build.sh` supports generating `id_rsa` if invoked with the relevant user-provisioning options. That does not prove such a key was created for this challenge.
8. **Port 843 label:** Its historical association is not proof of the actual process/protocol on the CTF server.
9. **Service discovery:** The Python scan was a TCP-connect scan with a 0.5-second timeout; it was not a packet-level proof that all other services were absent.
10. **Q3 final flag raw output:** Available as a value and response in the supplied completed write-up [REPORTED] and indirectly confirmed by UI acceptance, but not visible directly in the screenshot.

The report deliberately retains these limits so it remains useful to future competitors and reviewers.

---

## 12. Practical improvements for the next NCL event

### Before the competition
- Keep a simple notes template with columns: `Host`, `IP`, `Reachable from`, `Ports`, `Account`, `Cred source`, `Next action`, `Evidence`, `Confidence`.
- Have prepared snippets for `ssh -J`, `ssh -L`, `ssh -D`, `smbclient`, `rpcclient`, `ip -br addr`, SHA-256 hashing, and Python TCP-connect scans.
- Practice interpreting `LOGON_FAILURE` vs `BAD_NETWORK_NAME`, plus shell config and history artifacts.
- Keep a tunnel register to avoid mistaking self-created infrastructure for challenge services.

### On every new shell
- Map both interfaces and routes **immediately**.
- Check `/etc/profile`, `/etc/profile.d`, `/etc/environment`, user shell startup/history, and nearby readable configs.
- Keep an eye on *odd variable names and formats*, not just the literal word `password`.
- Preserve the first newly discovered secret's **exact file path** before attempting it.

### When blocked for 10–15 minutes
- List the three strongest hypotheses with a falsifiable test for each.
- Review the last *genuinely new* evidence and which assumptions were made without confirmation.
- Compare near-identical hosts' readable config hashes, not only file names.
- Stop retrying the same SMB authentication with different share paths if authentication fails before tree connection.
- Avoid indiscriminate `grep /` and uncontrolled parallel shells.

### After solving
- Record flags immediately and verify accepted submissions.
- Save exact raw outputs **before** killing tunnels or losing the ephemeral challenge instance.
- Write the clean solve and an *investigation audit*; both are useful.
- Separate reusable methods from challenge-specific IPs, usernames, and passwords.
- Create a sanitized version before public release.

---

## 13. Quick-reference checklist: a clean second solve

```text
[ ] Read engagement notes and scope.
[ ] Kali → SSH foothold as level1.
[ ] Identify 10.11.229.64/27 and Samba .68.
[ ] Kali local forward → .68:445, guest public share.
[ ] Retrieve flag1.txt = SKY-BNED-1567 and auth.conf.
[ ] SSH via foothold → dev .66 as level2 using spoof-front-dusk.
[ ] Identify Dev's interfaces .66/.98 and internal2 subnet.
[ ] Read /etc/profile (or compare host config hashes first).
[ ] Recover INTERNAL=Coherence-Java-Scrooge2.
[ ] SSH from Dev → level3@10.11.229.100.
[ ] Read level3's ~/.bash_history.
[ ] Recover level3-smb / gratify-maximum-graduate.
[ ] SMB authenticated → share internal → flag2.txt = SKY-BGHH-7925.
[ ] On level3: discover 10.11.229.130/27 → deepest .128/27.
[ ] Discover .129/.131/.132; scan TCP 1–1023 on those hosts.
[ ] Find .132:843; connect and read the banner.
[ ] Q3 = SKY-AJFF-5275 (as recorded in completed write-up).
[ ] Verify all 3 submissions accepted — 100/100 screenshot.
[ ] Preserve files, hashes, screenshots, and command transcripts.
```

---

## 14. Ready-to-reuse blank field-note template

Copy this section into the next competition's notes.

```markdown
# Challenge: [Event / Category / Name]
Date/time UTC:
Scope and rules:
Starting access:
Known user / credentials:
Objective:

## Asset inventory
| IP | Host | Segment | Service(s) | Access | Evidence |
|----|------|---------|------------|--------|----------|

## Credential chain
| Identity | Secret source | Target | Auth result | Confidence |
|----------|---------------|--------|-------------|------------|

## Hypothesis register
| Hypothesis | Test | Output | What is ruled out | Next action |
|------------|------|--------|-------------------|-------------|

## Tunnel register
| Created on | Local bind | Target endpoint | SSH process | Purpose |
|------------|------------|-----------------|-------------|---------|

## Evidence inventory
| Filename | Collected UTC | Remote host | Command | SHA-256 |
|----------|---------------|-------------|---------|--------|

## Flags and acceptance
Q1:
Q2:
Q3:
Submitted / accepted:
Screenshot:

## Next decisive test
Specific host:
Exact command:
Expected outputs:
Interpretation:
```

---

## 15. Final assessment

**Verified result:** The NCL platform marked **all three questions complete** [OBSERVED], for **100/100**. Q1 and Q2 flags are present in the actual command outputs preserved in the conversation. The Q3 flag and its passive TCP banner response are documented in the supplied completed write-up, with UI acceptance visible in the included screenshot.

**The most useful transferable technique:** Compare both **path inventories and content hashes** on similar reachable systems, then investigate *unexpected configuration differences*. The decisive clue was neither a conventional password file nor a hidden SSH key. It was an innocuously named environment assignment in a globally readable login profile, followed by a credential-bearing shell history on the next pivot.

**The most useful investigative discipline:** A failed test closes only the thing it actually tested. Negative scans, permission errors, guest SMB results, and keyword-grep misses must never be promoted into universal claims that “nothing is there.” Once a hypothesis stops producing new information, switch models rather than running larger versions of the same scan.

---

*Maintained as a private competition evidence report. Prepared from the submitted complete write-up, supplied terminal transcripts, and completion screenshot. Additional raw evidence files can be appended under `evidence/` without altering the core narrative.*
