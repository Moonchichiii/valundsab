# 0008 — Real product screenshots and the total transfer budget

## Status

Accepted (2026-08-11).

## Context

The portfolio scenes replace their illustrated mockups with real screenshots
of the two product sites. Photographic and richly typeset content compresses
far heavier than flat mockups: the two mobile scene images now weigh about
55 KB together at display-correct resolution. The fixed page resources
(variable font, stylesheet, document, brand assets) already total about
110 KB, so the original 150 KiB total transfer budget from the mockup era
leaves no honest room for real imagery without degrading it below the
sharpness the scenes exist to provide.

## Decision

The Lighthouse total transfer budget is raised from 153600 to 184320 bytes
(180 KiB). The image budget stays at 153600 bytes and all other budgets and
assertions are unchanged. Scene images remain local, lazy, dimensioned and
served as AVIF/WebP in the generated size matrix.

## Consequences

The gate keeps a working margin for the real screenshots while still
enforcing a hard ceiling well below one typical hero image on comparable
sites. Any future increase requires a new decision record.
