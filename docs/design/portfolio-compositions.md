# Portfolio compositions

Status: Locked for M2 implementation
Issue: M1-06
Scope: Homepage product compositions only

## Purpose

This document locks the responsive composition for the two defining homepage product chapters:

1. Valunds ServiceBok — light product section.
2. SkogsKvitto — inverse product section.

The document defines layout, hierarchy, responsive order and visual constraints. It does not define final production copy, imagery or implementation details.

Production HTML and CSS are delivered together in M2.

## Existing system

The compositions use the existing layout vocabulary only:

- `full`
- `wide`
- `content`
- `text`
- `narrow`

The existing grid remains authoritative:

```text
full-start
  wide-start
    content-start
    content-end
  wide-end
full-end
```

Default children sit on `content`.

Available layout placements:

```text
.full-bleed → full
.wide       → wide
.text       → content with text measure
.narrow     → content with narrow measure
```

No new global grid, theme system or layout primitive is introduced.

## Existing tokens

Only existing tokens may be used.

### Surfaces

```text
--surface-page
--surface-raised
--surface-subtle
--surface-inverse
```

### Text

```text
--text-primary
--text-secondary
--text-inverse
--text-secondary-inverse
```

### Accent

```text
--accent
--accent-text
--accent-inverse
```

### Lines

```text
--line-subtle
--line-inverse
```

### Spacing

```text
--space-2xs
--space-xs
--space-s
--space-m
--space-l
--space-xl
--space-section
--space-hero
```

### Measures and widths

```text
--measure-text
--measure-read
--measure-narrow
--width-content
--width-wide
--gutter
```

The existing token system defines the approved surfaces, typography, spacing, widths and restrained teal accents. No new design tokens are required for these sections.

---

# 1. Valunds ServiceBok

## Role

Valunds ServiceBok is the first full product chapter after the homepage introduction.

Its purpose is to establish:

- the product name;
- the product category;
- its current status;
- the problem it solves;
- Valunds ownership;
- a clear route to the product detail page.

The visual direction is light, precise and product-led.

## Surface

```text
Surface: --surface-page or --surface-raised
Text: --text-primary
Secondary text: --text-secondary
Lines: --line-subtle
Accent: --accent-text
```

The section must not use:

- gradients;
- glow;
- large teal surfaces;
- generic product cards;
- dark-mode abstractions;
- decorative background graphics.

## Wide composition

Target width:

```text
1440px and above
```

Grid placement:

```text
Section background: full
Section inner composition: wide
Text group: content-start
Visual group: extends toward wide-end
```

Proportion:

```text
Text:   approximately 40%
Visual: approximately 60%
```

Composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ FULL SECTION                                                 │
│                                                              │
│   WIDE START                                      WIDE END   │
│   ┌──────────────────┬─────────────────────────────────────┐  │
│   │ PRODUCT TEXT     │                                     │  │
│   │                  │           PRODUCT VISUAL            │  │
│   │ Metadata         │                                     │  │
│   │ Title            │                                     │  │
│   │ Description      │                                     │  │
│   │ Link             │                                     │  │
│   └──────────────────┴─────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Element placement:

| Element                     | Boundary                  | Notes                               |
| --------------------------- | ------------------------- | ----------------------------------- |
| Section surface             | `full`                    | Light surface                       |
| Inner composition           | `wide`                    | Maximum visual reach                |
| Product text                | starts at `content-start` | Approximately 40%                   |
| Product visual              | reaches toward `wide-end` | Approximately 60%                   |
| Description                 | `text` measure            | Never full visual-column width      |
| Action                      | follows description       | Text-link treatment                 |
| Supporting rule or metadata | text column               | Uses existing line and label tokens |

Vertical spacing:

```text
Section padding: --space-section
Metadata → title: --space-s
Title → description: --space-m
Description → action: --space-m
```

The visual may be vertically larger than the text block. The section should not force equal-height content merely for symmetry.

## Intermediate composition

Target width:

```text
768px–1439px
```

The section remains two-column while the available composition supports useful text and visual widths.

Preferred structure:

```text
Text:   5 fractional units
Visual: 7 fractional units
```

The text remains anchored to the content grid. The visual may use the remaining wide area.

When the visual becomes too narrow to communicate clearly, the composition stacks. The stack decision is based on container space, not a device name.

## Compact composition

Target reference widths:

```text
320px
390px
412px
```

Order is locked:

```text
1. Product metadata
2. Product title
3. Product description
4. Product link
5. Product visual
```

Composition:

```text
┌────────────────────────────┐
│ 20px gutter                │
│                            │
│ PRODUCT METADATA           │
│                            │
│ Valunds ServiceBok         │
│                            │
│ Product description        │
│ within readable measure.   │
│                            │
│ Explore product            │
│                            │
│       PRODUCT VISUAL ──────┼── may reach one viewport edge
│                            │
└────────────────────────────┘
```

Compact rules:

- Text remains fully inside the existing gutter.
- The visual follows the text.
- The visual may extend toward one viewport edge.
- The visual must not create horizontal document overflow.
- The visual must not appear before the product identity.
- The product link remains visible before the visual.
- No horizontal text-and-visual squeeze is allowed.

## Visual placeholder

Until a dedicated asset issue delivers the final product visual, use a neutral composition placeholder.

The placeholder represents:

- visual footprint;
- aspect ratio;
- alignment;
- cropping behavior;
- edge treatment.

It does not represent final product UI.

Placeholder rules:

```text
Surface: --surface-subtle
Border/rule: --line-subtle
Radius: --radius-visual
No iconography
No fake dashboard
No gradients
No decorative copy
```

## Accessibility and semantics

Recommended semantic structure:

```html
<section aria-labelledby="servicebok-title">
  <div>
    <p>Product metadata</p>
    <h2 id="servicebok-title">Valunds ServiceBok</h2>
    <p>Product description</p>
    <a href="/portfolj/valunds-servicebok/">Explore product</a>
  </div>

  <figure>
    <!-- Future product visual -->
  </figure>
</section>
```

The visual must not contain information that is unavailable in text.

---

# 2. SkogsKvitto

## Role

SkogsKvitto is the contrasting product chapter.

Its purpose is to communicate:

- document-heavy workflows;
- validation and extraction;
- transformation from unstructured source material to reviewed structured data;
- a more technical and operational product character.

The section creates a controlled chapter break without introducing site-wide dark mode.

## Surface

```text
Surface: --surface-inverse
Primary text: --text-inverse
Secondary text: --text-secondary-inverse
Lines: --line-inverse
Restrained accent: --accent-inverse
```

This is an explicit inverse section.

It must not introduce:

```text
color-scheme: dark
theme classes
theme switching
dark-mode variables
automatic system theme behavior
```

The rest of the site remains light.

## Wide composition

Grid placement:

```text
Section background: full
Introductory content: content or wide
Process flow: wide
Supporting copy: text
```

Composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ FULL INVERSE SECTION                                         │
│                                                              │
│   PRODUCT METADATA                                           │
│                                                              │
│   SkogsKvitto                                                │
│   Product lead and technical context                         │
│                                                              │
│   DOKUMENT → VALIDERING → EXTRAKTION → STRUKTUR → GRANSKNING │
│                                                              │
│   Supporting description / product action                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Element boundaries:

| Element         | Boundary            | Notes                        |
| --------------- | ------------------- | ---------------------------- |
| Section surface | `full`              | `--surface-inverse`          |
| Intro           | `content`           | Strong editorial opening     |
| Title           | `content`           | Product-title scale          |
| Lead            | `text`              | Inverse secondary text       |
| Process flow    | `wide`              | Horizontal when space allows |
| Supporting copy | `text`              | Readable measure             |
| Action          | `content` or `text` | Inverse link treatment       |

## Process flow

The semantic node order is locked:

```text
DOKUMENT
VALIDERING
EXTRAKTION
STRUKTUR
GRANSKNING
```

Meaning:

| Node       | Role                                     |
| ---------- | ---------------------------------------- |
| Dokument   | Source material enters the system        |
| Validering | File and source validity are checked     |
| Extraktion | Relevant information is extracted        |
| Struktur   | Extracted data is normalised             |
| Granskning | The result is presented for human review |

The semantic markup must remain unchanged between horizontal and vertical layouts.

Recommended structure:

```html
<ol aria-label="SkogsKvitto process">
  <li>Dokument</li>
  <li>Validering</li>
  <li>Extraktion</li>
  <li>Struktur</li>
  <li>Granskning</li>
</ol>
```

No duplicate desktop and mobile markup.

## Horizontal process layout

When the process container has sufficient inline space:

```text
DOKUMENT ─ VALIDERING ─ EXTRAKTION ─ STRUKTUR ─ GRANSKNING
```

Rules:

- Nodes use equal conceptual importance.
- Connectors are quiet lines, not arrows with decorative heads.
- Labels remain legible without forced abbreviation.
- The final node may carry the sole prominent teal treatment.
- Intermediate nodes remain neutral inverse elements.

## Vertical process layout

When the process container is narrower than the locked trigger:

```text
DOKUMENT
   │
VALIDERING
   │
EXTRAKTION
   │
STRUKTUR
   │
GRANSKNING
```

The orientation changes through a container query.

Locked trigger:

```text
48rem
```

Behavior:

```css
.process {
  container-type: inline-size;
}

@container (width < 48rem) {
  /* vertical process arrangement */
}
```

The document locks the behavior, not the final selector names.

The production implementation may use equivalent semantic class names, but the trigger remains `48rem` unless measured implementation evidence requires the issue to be amended.

## Teal constraint

Teal is deliberately scarce.

The final process node, `GRANSKNING`, is the only prominent teal element in the inverse section.

Allowed:

```text
Final node text, rule or compact surface using --accent-inverse
```

Not allowed:

```text
Teal section backgrounds
Multiple teal process nodes
Teal gradients
Glows
Large teal illustrations
Decorative teal lines unrelated to state
Teal applied to every link, label and border simultaneously
```

Supporting links may retain accessible inverse-link behavior, but they must not compete visually with the final process node.

## Compact composition

Order is locked:

```text
1. Product metadata
2. Product title
3. Product lead
4. Vertical process flow
5. Supporting description
6. Product action
```

Compact rules:

- The process becomes vertical.
- The semantic order stays unchanged.
- Every label remains fully visible.
- Connectors remain visually secondary.
- The final node remains the sole prominent teal process element.
- Text stays within the existing gutter.
- The inverse surface spans the full viewport width.
- No horizontal overflow is allowed.

## Visual placeholder

SkogsKvitto does not receive a fake interface placeholder in this composition.

The process flow itself is the defining product visual until a dedicated asset issue introduces additional imagery.

Any later imagery must support, not replace, the semantic explanation.

## Accessibility and semantics

Recommended section structure:

```html
<section aria-labelledby="skogskvitto-title">
  <div>
    <p>Product metadata</p>
    <h2 id="skogskvitto-title">SkogsKvitto</h2>
    <p>Product lead</p>
  </div>

  <ol aria-label="SkogsKvitto process">
    <li>Dokument</li>
    <li>Validering</li>
    <li>Extraktion</li>
    <li>Struktur</li>
    <li>Granskning</li>
  </ol>

  <div>
    <p>Supporting description</p>
    <a href="/portfolj/skogskvitto/">Explore product</a>
  </div>
</section>
```

The ordered list must remain meaningful without CSS.

---

# 3. Relationship between the sections

The two product chapters deliberately contrast.

| Valunds ServiceBok                        | SkogsKvitto                              |
| ----------------------------------------- | ---------------------------------------- |
| Light                                     | Inverse                                  |
| Product interface emphasis                | Data-process emphasis                    |
| Asymmetric text/visual split              | Editorial introduction plus process flow |
| Visual follows content on compact layouts | Process flow remains central             |
| Teal used as link-level accent            | Teal reserved for final process state    |

They must still feel like one system through:

- identical typography;
- shared grid;
- shared spacing scale;
- consistent metadata labels;
- consistent link behavior;
- identical focus treatment;
- shared radius and line language;
- restrained motion.

---

# 4. Responsive verification matrix

The composition must be prototyped temporarily at these widths:

|  Width | ServiceBok                       | SkogsKvitto                        |
| -----: | -------------------------------- | ---------------------------------- |
|  320px | Compact stack                    | Vertical process                   |
|  390px | Compact stack                    | Vertical process                   |
|  768px | Intermediate composition         | Container-dependent process        |
| 1440px | 40/60 wide composition           | Horizontal process                 |
| 1920px | Wide composition remains bounded | Horizontal process remains bounded |

Temporary prototypes and screenshots are review evidence only.

They must not be committed.

Required screenshots:

```text
servicebok-compact
servicebok-intermediate
servicebok-wide
skogskvitto-compact
skogskvitto-intermediate
skogskvitto-wide
```

Each screenshot must record:

- viewport width;
- viewport height;
- browser;
- whether the process is horizontal or vertical;
- whether any overflow occurred.

---

# 5. Implementation contract for M2

M2 implementation must preserve:

- the existing grid vocabulary;
- the existing token system;
- ServiceBok’s 40/60 wide composition;
- compact ServiceBok content order;
- SkogsKvitto’s explicit inverse section;
- unchanged semantic process markup;
- the `48rem` process-container trigger;
- the final process node as the only prominent teal element;
- no committed placeholder asset beyond neutral structural presentation;
- no theme architecture;
- no gradients, glows or generic card treatment.

Any implementation discovery that requires changing these decisions must stop and amend the owning issue before code continues.

---

# Approval checklist

## Valunds ServiceBok

- [ ] Wide composition uses approximately 40% text and 60% visual.
- [ ] Text starts at `content-start`.
- [ ] Visual reaches toward `wide-end`.
- [ ] Compact order is metadata, title, description, link, visual.
- [ ] Compact text remains inside the gutter.
- [ ] Compact visual may reach one edge without causing overflow.
- [ ] Placeholder remains neutral and non-decorative.

## SkogsKvitto

- [ ] Section uses explicit inverse tokens.
- [ ] No theme infrastructure or `color-scheme: dark` is introduced.
- [ ] Process markup is one ordered semantic structure.
- [ ] Process is horizontal when its container is at least `48rem`.
- [ ] Process is vertical below `48rem`.
- [ ] Final node is the only prominent teal process element.
- [ ] No additional prominent teal treatment is introduced.

## General

- [ ] Existing grid vocabulary is unchanged.
- [ ] Existing token scale is unchanged.
- [ ] Compact, intermediate and wide prototypes are verified.
- [ ] No production HTML or CSS is committed.
- [ ] No temporary prototype or screenshot is committed.
- [ ] `bun run check` passes.
