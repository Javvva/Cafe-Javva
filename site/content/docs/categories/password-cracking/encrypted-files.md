---
title: "Encrypted files and password extraction"
description: "Identify Ansible Vault, PuTTY, and 7-Zip files and confirm extraction before cracking."
category: "password-cracking"
status: "unsolved"
season: "2026 NCL Individual"
tools: ["john", "7z", "file"]
---
Source: C13, **Password Cracking Guide**. This chat began on October 23 and also contains the later Yescrypt and Collatz work.

### Objective and evidence

The challenge supplied file1.yaml, file2.ppk, and file3 and asked for their passwords using a popular wordlist. Inspection identified:

| File | Identified format | Extraction tool discussed |
|---|---|---|
| file1.yaml | Ansible Vault 1.1 with AES256 | ansible2john |
| file2.ppk | PuTTY Private Key File v2, ssh-rsa | putty2john |
| file3 | 7-Zip archive, format version 0.4 | 7z2john |

We followed the sequence **identify format → extract verification data → inspect extracted data → run candidate search → verify the recovered password with the original file**. These tools test password guesses; they do not break AES directly.

### What went wrong and how it was diagnosed

The command `7z2john.pl file3 > hash3.txt` failed because that name was not on the command path. Searching the installation found `/usr/bin/7z2john` and `/usr/share/john/7z2john.pl`. John then reported no hashes loaded because hash3.txt was empty. Shell output redirection had created or truncated the file before the failed extraction command ran.

Running the extractor without redirection exposed the real dependency failure: `Compress/Raw/Lzma.pm` was missing. The historical fix proposed installing `libcompress-raw-lzma-perl`, checking the module, then repeating extraction. The record does not preserve final recovered passwords for these three files.

```bash
# In the directory containing the supplied files
file file1.yaml file2.ppk file3
7z l file3
7z2john file3                  # Inspect output and errors first
7z2john file3 > hash3.txt
wc -c hash3.txt
head -c 100 hash3.txt
john --format=7z --wordlist=/usr/share/wordlists/rockyou.txt hash3.txt
john --show --format=7z hash3.txt
7z t file3                    # Verify a recovered password
```

The chat also discussed Hashcat mode 11600 for the extracted 7-Zip data. The key operational detail was removing a converter's filename prefix only when the destination tool requires it, while preserving the complete hash payload.

**Team practice:** Given three files with misleading extensions, identify each format, obtain nonempty verification data, and explain the difference between “0 hashes loaded” and “hashes loaded, 0 recovered.” Do not start a second cracking session to compensate for a broken extractor.
