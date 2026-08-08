# 0007 — Raised stylesheet budget for the motion layer

## Status

Accepted (2026-08-05).

## Context

The visual system is complete and approved. A finishing pass adds a native
motion layer: cross-document view transitions, scroll-driven reveals for
chapter headings, hover refinements, and a scroll-revealed home shortcut in
the compact bottom navigation. The layer is pure CSS behind progressive
enhancement guards and respects reduced-motion preferences. The generated
stylesheet budget of 25600 bytes was already near its ceiling after the
editorial recovery work, leaving no room for the motion rules.

## Decision

The Lighthouse stylesheet transfer budget is raised from 25600 to 26624
bytes. The JavaScript budget, the third-party budget and all other gates are
unchanged. The motion layer must not add any JavaScript.

## Consequences

The stylesheet keeps a working margin for the motion rules while remaining
far below the compressed budget. Any future increase requires a new decision
record.
