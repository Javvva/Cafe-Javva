---
title: "Intercept and the LFSR cipher"
description: "Separate the LFSR answer, the frame model, and the still-missing SECURE plaintext."
category: "cryptography"
status: "partial"
season: "2026 NCL Individual"
tools: ["python"]
---
Sources: C07, **Solve Intercept Challenge**, and C06, **Solve LFSR Cipher**, including the attached earlier investigation.

### Objective and protocol

The Hard challenge asked which cipher mechanism generated the keystream and for the flag in a live relay stream. The attachment reports Q1, **LFSR / Linear Feedback Shift Register**, accepted. No final flag is present in the recovered messages.

The relay banner specified:

```text
LiberStream v2.1
TAPMAP R0=0x20009 R1=0x80027 R2=0x800021
MODE ARB-STEP
INIT zero regs; key bits, then 32 seq bits, mixed in 1 bit/clock, all regs
FRAME "L8" | type:u8 | seq:u32be | plen:u8 | body:32
TYPE 01=STATUS 02=SECURE
```

This gives a 40-byte frame: 2-byte magic, 1-byte type, 4-byte big-endian sequence, 1-byte payload-length field, and a 32-byte encrypted body. Captures named capture.txt, capture2.bin, and big.bin were discussed. The work included comparisons across connections, same-sequence frames, and rare SECURE frames.

### Early experiments and their actual scope

The earlier handoff tested a directly affine relationship between sequence bits and output keystream bits, many-time-pad assumptions across connections, repeated sequence numbers, and an interactive oracle. Those tests did not yield a solution. Different ciphertext for supposedly identical plaintext at the same sequence across connections supported changing per-connection keystreams. It did not reveal the exact key-generation mechanism.

The handoff went too far in calling passive recovery impossible and claiming there was no useful known structure. Later recovery of padding and structured STATUS plaintext showed why those conclusions needed revision. A failed direct affine model for **output keystream** does not rule out a linear relationship in **initial internal state** before irregular stepping.

C07 also exposed a context mistake: the Intercept prompt had been pasted together with a Birdwatchers password-cracking handoff. The assistant identified that they were different challenges. Keep the evidence sets separate even when both involve cryptography.

### Later breakthrough

The user relayed an agent update reporting a state-recovery solver that passed a synthetic self-test, followed by a sweep of construction variants against actual STATUS frames. The consistent interpretation was reported as:

- Fibonacci LFSRs using the supplied masks and low-tap interpretation.
- Least-significant-bit output, with bits packed most-significant-bit first into bytes.
- An alternating-step generator: R0 controls which of R1 or R2 advances; the output is the XOR of the data-register output bits.
- A constant STATUS padding byte of `0x13`, consistent with 19 padding bytes after the observed 13-byte messages.

Examples of recovered STATUS text included `KAPPA NOMINAL`, `KAPPA T+85508`, and `KAPPA LOAD=30`. A synthetic solver success alone did not validate the real construction; agreement across real frames provided the stronger evidence.

The update then assumed SECURE would share the same padding layout. A padding-start sweep failed. The agent proposed that `plen=0` might mean all 32 bytes were payload. That remained an interpretation, not a fact established solely by the failed sweep.

### Final unresolved work

The final posted plan was to recover STATUS states within one connection, determine the sequence-to-initial-state relation, validate it across independent STATUS frames, and transfer it to the SECURE frame at sequence 117 in big.bin. A hand-guessed initialization rule did not produce a constant key term, so empirical fitting was proposed. No successful transfer or decrypted SECURE flag is shown.

**Team practice:** Parse the frame before attacking the cipher. Preserve connection identity. Validate initialization separately from stepping and output packing. Use a synthetic self-test and held-out real frames. Never assume the length or padding semantics of one frame type apply to another. Record statements such as “no padding” as hypotheses until independently supported.
