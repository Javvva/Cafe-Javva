# [WIP] Cafe-Javva
Compilation of Cyber Tools &amp; Resources for CTF's

## Learning/Practice Platforms
I feel like general university courses are one of the best way to learn these general topics but can get hard to put these concepts into practice so having these resources to flex those cyber skills are very helpful.
- [HackTricks:](https://hacktricks.wiki/en/index.html) Huge **wiki** for a lot of specific **tool research** and **methods**
- [TryHackMe:](https://tryhackme.com) My **go-to website** for learning general skills and fun boxes
- [HackTheBox:](https://academy.hackthebox.com) Has **general** courses and information about cybersecurity but is known for their **remote CTF boxes**
- [CyLab Security Academy:](https://learn.cylabacademy.org) **General** course style learning for CTF skills and categories
- [Port Swigger:](https://portswigger.net/web-security) Great website for learning **web security**
- [CryptoHack:](https://cryptohack.org/) One of the best resource for study/learn **cryptography** different ciphers and learn to write python code.
- [NCL Resources:](https://nationalcyberleague.org/competition/resources) Tons of good resources to find tools and stuff by Cyber Skyline.  
- [OverTheWire-Wargames:](https://overthewire.org/wargames/) Community made challenges to test security concepts through rooms.\
`Personally had fun going through the web security.`

## Open Source Intelligence (OSINT)
A lot of OSINT is just looking information up on the public-facing internet, however I have found some useful tools for challenges I see often (NCL, CyberSeed, Cyebrfusion, etc.).
- [Shodan:](https://www.shodan.io/) Can view various IoT devices around the world.\
`Usually used in industry OSINT but might as well show.`
- [theHarvest:](https://github.com/laramies/theharvester) This comes with your Kali Linux and it helps find  subdomain names, e-mail addresses, etc.
- [who.is:](https://who.is/) The website tool can look for more information (DNS records, contact info, etc.) through a **domain name or ip address**.
- [Maltego:](https://www.maltego.com/) Has different pricing informaiton but the free option has a graph that allows for seeing **identify data connections**.
- [ZBar:](https://zbar.sourceforge.net/) There was one challenge where I had to manipulate or scan **QR/Barcodes** so having this in your Kali Linux VM would be convienent.
- [WayBackMachine:](https://web.archive.org/) Internet archive for looking at websites which might be handy.

## Cryptography
Lots of cipher, encoding, and hashing stuff so make sure you are familiar with the various formats/signs.  
- [CyberChef:](https://gchq.github.io/CyberChef/) The "Cyber Swiss Army Knife" of encoding and probably one of my most used tool for CTF's.\
`I prefer to use the website but if your have trouble loading it, just download it.`
- [dCode:](https://www.dcode.fr/en) **DCODE IS THE BEST!!!** Has so many ciphers and has an 'Cipher-Identifier' that helps figure out encoding/base formats.
- [CryptoCrack:](https://github.com/GHUploader/CryptoCrack) Use for brute forcing classical/historical ciphers.
- [Hash-Identifier:](https://hashes.com/en/tools/hash_identifier) Good for detecting known hashes.
- [quipqiup:](https://quipqiup.com/) "Fast and automated cryptogram solver" have **not tested in-depth, but will try in the future**.
- [Rumkin:](https://rumkin.com/tools/) Web-based tools and ciphers that runs in the browser.

## Password Cracking
Password cracking is a lot of the same things from cryptography but harder challenges is more researching and wordlist building.
- [Cewl:](https://www.kali.org/tools/cewl/) Wordlist builder but has no GUI.
- [John the Ripper:](https://www.kali.org/tools/john/) Tool for cracking password hashes.
- [Hashcat:](https://www.kali.org/tools/hashcat/) Tool for cracking password hashes.
- [Hydra:](https://www.kali.org/tools/hydra/) Tool for cracking login passwords on networks.
- [Fcrackzip:](https://www.kali.org/tools/fcrackzip/) Crack passwords on zip folders.


## Network Traffic Analysis
A lot of network traffic analysis is understanding Wireshark and aircrack-ng. Recommend watching tutorials or reading documentation.
- [Wireshark:](https://www.wireshark.org/) All-in-one tool for network analysis and debugging. Has GUI
- [Aircrack-ng:](https://www.aircrack-ng.org/) Wi-Fi and wireless hacking tool, not too familiar about this tool.

## Log Analysis
This category is knowing how to read and find information. Make sure to know how to use the linux commands listed, or use an AI agent to pull the information.
- [SQLite Viewer:](https://inloop.github.io/sqlite-viewer/) Viewing sql based files.
- [Cut:](https://man7.org/linux/man-pages/man1/cut.1.html) Removing sections from each line of files. Good for cutting out undeeded info.
- [Sort:](https://man7.org/linux/man-pages/man1/sort.1.html) Sort lines of a text files.
- [Uniq:](https://man7.org/linux/man-pages/man1/uniq.1.html) Showing repeated or unique lines.
- [Grep:](https://man7.org/linux/man-pages/man1/grep.1.html) Grabbing/searching for whats in the quoted command.
- [Wc:](https://man7.org/linux/man-pages/man1/wc.1.html) Used to count lines, words, characters, and bytes in a file.

## Forensics 
Forensics is a very broad category so make sure you know what type of challenge you're dealing with to use the correct tools.
- [Aperi'Solve:](https://www.aperisolve.com/) My go-to online image steganography analyzer that has many forensics tools embeded like binwalk, exiftool, etc.
- [Volatility Command List:](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference) Extracting digital artifacts from volatile memory, not too familiar with this.
- [Binwalk:](https://github.com/ReFirmLabs/binwalk) Tool searching a given binary image for embedded files and executable code.
- [Autopsy:](https://www.autopsy.com/) Forensic analysis on disk images/file systems. Make sure you watch a tutorial because it is very hard to get started.
- [HxD:](https://download.cnet.com/HxD-Hex-Editor/3000-2352_4-10891068.html) Inspect and manipulate a file's raw bytes directly, you can also use an online tool for this if your lazy.

## Scanning &amp; Reconnaissance
This category is about scanning and exploring the environment so get to know many of the commands within the environment.
- [Dirbuster:](https://www.kali.org/tools/dirbuster/) Web server directory discovery, used on websites.
- [Nmap:](https://nmap.org/) Network discovery which is used for seeing ports, live hosts, and map exposed services.

## Web Application Exploitation
You are given a website and often times you want to read the challenge header to have an idea where to look. Look in Portswigger Web Academy for learning.
- [Firefox:](https://firefox-source-docs.mozilla.org/devtools-user/) I always use Firefox to do this category because it is a lot easier to see the DevTools info.
- [Burp Suite:](https://www.google.com/url?sa=D&q=https://portswigger.net/burp/releases/professional-community-2023-6-2%3Frequestededition%3Dcommunity%26requestedplatform%3D&ust=1793911200000000&usg=AOvVaw1KPwElImGQBi8WSQ1-6QDh&hl=en) Used for intercept, inspect, modify, and replay HTTP/HTTPS traffic for the webpage.
- Look into **robots.txt**
- Look into dirbuster or fuzz for looking for more web discovery.

## Enumeration &amp; Exploitation &amp; Reverse Engineering
- [Metasploit:](https://www.metasploit.com/) Automated exploitation C2 used to gain initial access, elevate privileges, and manage compromised targets.
- [Uncompyle6:](https://pypi.org/project/uncompyle6/) A native Python cross-version decompiler and fragment decompiler.
- [Ghidra:](https://github.com/NationalSecurityAgency/ghidra) Reverse engineering and decompilation tool to analyze compiled binaries and extract hidden flags, passwords, or logic flaws.
