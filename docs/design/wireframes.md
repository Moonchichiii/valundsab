# Internal page wireframes

Status: Locked for M3 implementation
Issue: M1-07
Scope: Internal page structure only

## Purpose

This document locks the desktop and mobile information architecture for:

1. Portfölj.
2. Valunds ServiceBok.
3. SkogsKvitto.
4. Bolaget.
5. Engineering.
6. Kontakt.
7. 404.

The wireframes define page purpose, section order, grid placement, heading hierarchy and the placement of facts, status labels, visuals and actions.

They do not define final copy, final imagery or production CSS.

## Shared structural rules

All pages use the existing page grid vocabulary:

- `full`
- `wide`
- `content`
- `text`
- `narrow`

The existing global header and navigation remain unchanged.

Every page must:

- have exactly one `h1`;
- preserve logical heading order;
- remain understandable without CSS;
- avoid filler sections;
- use descriptive links;
- avoid duplicated desktop and mobile markup;
- keep actions close to the content they act on;
- remain usable at 320px;
- preserve the existing bottom navigation behavior on compact layouts.

## Shared page rhythm

Recommended order:

```text
Header
Page masthead
Primary content
Supporting content
Closing action where required
Global navigation
```

Spacing uses the existing token scale only.

---

# 1. Portfölj

## Purpose

Present Valunds-owned products as a deliberate portfolio, showing:

- product name;
- current status;
- product domain;
- Valunds ownership;
- concise product purpose;
- link to the dedicated product page.

The page is not a gallery and must not resemble a generic project-card portfolio.

## Heading hierarchy

```text
h1 Portfölj
  h2 Valunds ServiceBok
  h2 SkogsKvitto
```

Status and domain are metadata, not headings.

## Section order

| Order | Section                  | Boundary                         |
| ----: | ------------------------ | -------------------------------- |
|     1 | Page masthead            | `content`                        |
|     2 | Portfolio introduction   | `text`                           |
|     3 | Valunds ServiceBok entry | `wide`                           |
|     4 | SkogsKvitto entry        | `full` inverse with `wide` inner |
|     5 | Ownership statement      | `text`                           |

## Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ CONTENT                                                      │
│                                                              │
│ PORTFÖLJ                                                     │
│ H1 Portfölj                                                  │
│ Introductory lead                                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ WIDE                                                         │
│                                                              │
│ STATUS / DOMAIN / OWNERSHIP            PRODUCT REFERENCE      │
│ H2 Valunds ServiceBok                   neutral visual area   │
│ Concise purpose                                              │
│ Product action                                               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ FULL INVERSE                                                 │
│   WIDE INNER                                                 │
│                                                              │
│   STATUS / DOMAIN / OWNERSHIP         PROCESS REFERENCE       │
│   H2 SkogsKvitto                    document → review         │
│   Concise purpose                                            │
│   Product action                                             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ TEXT                                                         │
│ Ownership and long-term product statement                    │
└──────────────────────────────────────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ WORDMARK                   │
│                            │
│ PORTFÖLJ                   │
│ H1 Portfölj                │
│ Introductory lead          │
│                            │
│ STATUS / DOMAIN            │
│ H2 Valunds ServiceBok      │
│ Purpose                    │
│ Product action             │
│ Neutral visual             │
│                            │
│ INVERSE SECTION            │
│ STATUS / DOMAIN            │
│ H2 SkogsKvitto             │
│ Purpose                    │
│ Process reference          │
│ Product action             │
│                            │
│ Ownership statement        │
│                            │
├────────────────────────────┤
│ BOTTOM NAVIGATION          │
└────────────────────────────┘
```

## Placement rules

- Product entries are editorial sections, not cards.
- Status, domain and ownership use label/meta treatment.
- ServiceBok uses the locked light composition direction from M1-06.
- SkogsKvitto uses the locked inverse composition direction from M1-06.
- Each product has one primary action.
- The ownership statement closes the page without adding a generic CTA panel.

---

# 2. Valunds ServiceBok

## Purpose

Explain the product as a long-term digital vehicle service record owned and developed by Valunds.

The page must establish:

- product identity;
- current status;
- problem and value;
- core product capabilities;
- ownership and development approach;
- route to the live product when available.

## Heading hierarchy

```text
h1 Valunds ServiceBok
  h2 En samlad historik
  h2 Produktens struktur
    h3 Fordon
    h3 Servicehistorik
    h3 Underlag
  h2 Utvecklad och förvaltad av Valunds
```

## Section order

| Order | Section                   | Boundary  |
| ----: | ------------------------- | --------- |
|     1 | Light product masthead    | `wide`    |
|     2 | Product problem and value | `text`    |
|     3 | Product structure         | `wide`    |
|     4 | Ownership and lifecycle   | `content` |
|     5 | Product action            | `text`    |

## Desktop wireframe

Locked masthead ratio:

```text
Text: 5 columns
Visual: 7 columns
```

```text
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ WIDE LIGHT MASTHEAD                                          │
│                                                              │
│ ┌──────────────────────┬───────────────────────────────────┐ │
│ │ STATUS / DOMAIN      │                                   │ │
│ │ H1 Valunds           │       PRODUCT VISUAL             │ │
│ │ ServiceBok           │                                   │ │
│ │ Lead                 │                                   │ │
│ │ Product action       │                                   │ │
│ └──────────────────────┴───────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ TEXT                                                         │
│ H2 En samlad historik                                       │
│ Problem, context and value                                  │
├──────────────────────────────────────────────────────────────┤
│ WIDE                                                         │
│ H2 Produktens struktur                                      │
│                                                              │
│ H3 Fordon          H3 Servicehistorik       H3 Underlag     │
│ Facts/description  Facts/description        Facts/description│
├──────────────────────────────────────────────────────────────┤
│ CONTENT                                                      │
│ H2 Utvecklad och förvaltad av Valunds                       │
│ Ownership, privacy, maintenance and long-term direction      │
├──────────────────────────────────────────────────────────────┤
│ TEXT                                                         │
│ Product availability/status action                           │
└──────────────────────────────────────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ WORDMARK                   │
│                            │
│ STATUS / DOMAIN            │
│ H1 Valunds ServiceBok      │
│ Lead                       │
│ Product action             │
│                            │
│ PRODUCT VISUAL             │
│ may reach one edge         │
│                            │
│ H2 En samlad historik      │
│ Problem and value          │
│                            │
│ H2 Produktens struktur     │
│                            │
│ H3 Fordon                  │
│ Facts                      │
│ ────────────────────────── │
│ H3 Servicehistorik         │
│ Facts                      │
│ ────────────────────────── │
│ H3 Underlag                │
│ Facts                      │
│                            │
│ H2 Utvecklad och           │
│ förvaltad av Valunds       │
│ Ownership and lifecycle    │
│                            │
│ Final product action       │
│                            │
├────────────────────────────┤
│ BOTTOM NAVIGATION          │
└────────────────────────────┘
```

## Placement rules

- Masthead remains light.
- Desktop masthead uses 5/7 asymmetry.
- Mobile order is metadata, title, lead, action, visual.
- Product structure is not rendered as generic cards.
- On compact layouts, capability groups become lined rows.
- No invented customer logos, testimonials or metrics.

---

# 3. SkogsKvitto

## Purpose

Explain how SkogsKvitto transforms document-heavy forestry material into validated, structured information ready for review.

The page must establish:

- product identity;
- technical context;
- semantic process;
- source material and outputs;
- validation and human review;
- Valunds ownership.

## Heading hierarchy

```text
h1 SkogsKvitto
  h2 Från dokument till struktur
  h2 Processen
  h2 Underlag och resultat
    h3 Källmaterial
    h3 Strukturerad information
  h2 Mänsklig granskning
  h2 Utvecklad av Valunds
```

## Section order

| Order | Section                 | Boundary                         |
| ----: | ----------------------- | -------------------------------- |
|     1 | Inverse masthead        | `full` with `wide` inner         |
|     2 | Semantic process flow   | `full` inverse with `wide` inner |
|     3 | Product context         | `text` light                     |
|     4 | Input/output comparison | `wide` light                     |
|     5 | Human review            | `content` light                  |
|     6 | Ownership               | `text` light                     |

## Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ FULL INVERSE                                                 │
│   WIDE INNER                                                 │
│                                                              │
│   STATUS / DOMAIN                                            │
│   H1 SkogsKvitto                                             │
│   Product lead                                               │
│                                                              │
│   H2 Processen                                               │
│   DOKUMENT — VALIDERING — EXTRAKTION — STRUKTUR — GRANSKNING │
│                                                              │
│   Product action                                             │
├──────────────────────────────────────────────────────────────┤
│ TEXT LIGHT                                                   │
│ H2 Från dokument till struktur                              │
│ Product context                                              │
├──────────────────────────────────────────────────────────────┤
│ WIDE LIGHT                                                   │
│ H2 Underlag och resultat                                    │
│                                                              │
│ H3 Källmaterial                  H3 Strukturerad information │
│ Source facts and examples        Output facts and examples   │
├──────────────────────────────────────────────────────────────┤
│ CONTENT LIGHT                                                │
│ H2 Mänsklig granskning                                      │
│ Review role, validation boundary and responsibility          │
├──────────────────────────────────────────────────────────────┤
│ TEXT LIGHT                                                   │
│ H2 Utvecklad av Valunds                                     │
│ Ownership and direction                                      │
└──────────────────────────────────────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ WORDMARK                   │
│                            │
│ FULL INVERSE               │
│ STATUS / DOMAIN            │
│ H1 SkogsKvitto             │
│ Product lead               │
│                            │
│ H2 Processen               │
│ DOKUMENT                   │
│    │                       │
│ VALIDERING                 │
│    │                       │
│ EXTRAKTION                 │
│    │                       │
│ STRUKTUR                   │
│    │                       │
│ GRANSKNING                 │
│ Product action             │
│                            │
│ LIGHT SECTION              │
│ H2 Från dokument till      │
│ struktur                   │
│ Context                    │
│                            │
│ H2 Underlag och resultat   │
│ H3 Källmaterial            │
│ Facts                      │
│ ────────────────────────── │
│ H3 Strukturerad info       │
│ Facts                      │
│                            │
│ H2 Mänsklig granskning     │
│ Review explanation         │
│                            │
│ H2 Utvecklad av Valunds    │
│ Ownership                  │
│                            │
├────────────────────────────┤
│ BOTTOM NAVIGATION          │
└────────────────────────────┘
```

## Placement rules

- Masthead and process are one controlled inverse chapter.
- Remaining sections return to light surfaces.
- The process uses one unchanged ordered list.
- `Granskning` remains the only prominent teal process node.
- Input and output groups become lined rows on compact layouts.
- No fake OCR screenshots or fabricated accuracy metrics.

---

# 4. Bolaget

## Purpose

Explain what Valunds Digitala Tjänster is, how the company is structured and how products are owned and developed over time.

The page must communicate credibility without inflated corporate language.

## Heading hierarchy

```text
h1 Bolaget
  h2 Vi bygger för långsiktigt värde
  h2 Bolagsstruktur
  h2 Så arbetar vi
  h2 Personer
```

Individual names are not headings above `h3`.

## Section order

| Order | Section            | Boundary  |
| ----: | ------------------ | --------- |
|     1 | Editorial masthead | `wide`    |
|     2 | Company purpose    | `text`    |
|     3 | Company structure  | `wide`    |
|     4 | Working model      | `content` |
|     5 | People             | `wide`    |

## Desktop wireframe

Locked editorial ratio:

```text
Lead column: 5
Supporting column: 7
```

```text
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ WIDE EDITORIAL MASTHEAD                                      │
│                                                              │
│ ┌──────────────────────┬───────────────────────────────────┐ │
│ │ LABEL                │ Supporting company statement      │ │
│ │ H1 Bolaget           │ Key facts / registered context    │ │
│ │ Lead                 │                                   │ │
│ └──────────────────────┴───────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ TEXT                                                         │
│ H2 Vi bygger för långsiktigt värde                          │
│ Company purpose                                              │
├──────────────────────────────────────────────────────────────┤
│ WIDE                                                         │
│ H2 Bolagsstruktur                                           │
│                                                              │
│ Company entity facts             Product ownership facts     │
│ lined facts                      lined facts                 │
├──────────────────────────────────────────────────────────────┤
│ CONTENT                                                      │
│ H2 Så arbetar vi                                            │
│ Principle rows: build / own / maintain / improve             │
├──────────────────────────────────────────────────────────────┤
│ WIDE                                                         │
│ H2 Personer                                                 │
│                                                              │
│ Person entry                     Person entry                │
│ Role / responsibility            Role / responsibility       │
└──────────────────────────────────────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ WORDMARK                   │
│                            │
│ LABEL                      │
│ H1 Bolaget                 │
│ Lead                       │
│ Supporting statement       │
│ Key facts                  │
│                            │
│ H2 Vi bygger för           │
│ långsiktigt värde          │
│ Purpose                    │
│                            │
│ H2 Bolagsstruktur          │
│ Company facts              │
│ ────────────────────────── │
│ Product ownership facts    │
│                            │
│ H2 Så arbetar vi           │
│ Build                      │
│ ────────────────────────── │
│ Own                        │
│ ────────────────────────── │
│ Maintain                   │
│ ────────────────────────── │
│ Improve                    │
│                            │
│ H2 Personer                │
│ Person / role              │
│ ────────────────────────── │
│ Person / role              │
│                            │
├────────────────────────────┤
│ BOTTOM NAVIGATION          │
└────────────────────────────┘
```

## Placement rules

- Masthead uses a 5/7 editorial composition.
- Company facts use lined data, not cards.
- People entries remain factual and restrained.
- Photography is not required by this wireframe.
- No invented team size, client list or market claims.

---

# 5. Engineering

## Purpose

Describe the technical principles used to build, verify and operate Valunds products.

The page must show engineering maturity without becoming a tool badge wall.

## Heading hierarchy

```text
h1 Engineering
  h2 Principer
    h3 Direkt publicerbar källa
    h3 Semantisk och tillgänglig
    h3 Mätbar kvalitet
    h3 Långsiktig förvaltning
  h2 Leveransmodell
  h2 Tekniska fakta
```

## Section order

| Order | Section              | Boundary  |
| ----: | -------------------- | --------- |
|     1 | Engineering masthead | `content` |
|     2 | Lead and philosophy  | `text`    |
|     3 | Principle rows       | `wide`    |
|     4 | Delivery model       | `content` |
|     5 | Technical facts      | `wide`    |

## Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ CONTENT                                                      │
│ LABEL                                                        │
│ H1 Engineering                                               │
│ Large lead                                                   │
├──────────────────────────────────────────────────────────────┤
│ WIDE                                                         │
│ H2 Principer                                                 │
│                                                              │
│ 01  H3 Direkt publicerbar källa        explanation           │
│ ──────────────────────────────────────────────────────────── │
│ 02  H3 Semantisk och tillgänglig       explanation           │
│ ──────────────────────────────────────────────────────────── │
│ 03  H3 Mätbar kvalitet                 explanation           │
│ ──────────────────────────────────────────────────────────── │
│ 04  H3 Långsiktig förvaltning          explanation           │
├──────────────────────────────────────────────────────────────┤
│ CONTENT                                                      │
│ H2 Leveransmodell                                            │
│ Source → verification → release                              │
├──────────────────────────────────────────────────────────────┤
│ WIDE                                                         │
│ H2 Tekniska fakta                                            │
│                                                              │
│ Architecture fact                Quality fact                │
│ Performance fact                 Accessibility fact          │
│ Deployment fact                  Security fact               │
└──────────────────────────────────────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ WORDMARK                   │
│                            │
│ LABEL                      │
│ H1 Engineering            │
│ Large lead                 │
│                            │
│ H2 Principer               │
│ 01                         │
│ H3 Direkt publicerbar      │
│ Explanation                │
│ ────────────────────────── │
│ 02                         │
│ H3 Semantisk och           │
│ tillgänglig                │
│ Explanation                │
│ ────────────────────────── │
│ 03                         │
│ H3 Mätbar kvalitet         │
│ Explanation                │
│ ────────────────────────── │
│ 04                         │
│ H3 Långsiktig förvaltning  │
│ Explanation                │
│                            │
│ H2 Leveransmodell          │
│ Source                     │
│ ↓                          │
│ Verification               │
│ ↓                          │
│ Release                    │
│                            │
│ H2 Tekniska fakta          │
│ Fact row                   │
│ ────────────────────────── │
│ Fact row                   │
│ ────────────────────────── │
│ Fact row                   │
│                            │
├────────────────────────────┤
│ BOTTOM NAVIGATION          │
└────────────────────────────┘
```

## Placement rules

- Principles are lined editorial rows.
- Numbering supports scanning but does not replace headings.
- Technical facts use definition-list or table semantics where appropriate.
- Tool names appear only when relevant to a factual statement.
- No badge wall, decorative terminal or fake code sample.

---

# 6. Kontakt

## Purpose

Provide a direct, credible contact route for company and product enquiries.

The page must remain useful without a form.

## Heading hierarchy

```text
h1 Kontakt
  h2 Kontakta Valunds
  h2 Bolagsuppgifter
```

Individual contact methods use labels or definition terms, not unnecessary headings.

## Section order

| Order | Section                               | Boundary        |
| ----: | ------------------------------------- | --------------- |
|     1 | Contact masthead                      | `wide`          |
|     2 | Contact methods                       | within masthead |
|     3 | Company facts                         | within masthead |
|     4 | Response expectation or enquiry scope | `text`          |

## Desktop wireframe

Locked ratio:

```text
Contact lead: 40%
Contact details: 60%
```

```text
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ WIDE 40/60                                                   │
│                                                              │
│ ┌──────────────────────┬───────────────────────────────────┐ │
│ │ LABEL                │ H2 Kontakta Valunds               │ │
│ │ H1 Kontakt           │ Email                             │ │
│ │ Lead                 │ Product enquiries                 │ │
│ │                      │ Company enquiries                 │ │
│ │                      │                                   │ │
│ │                      │ H2 Bolagsuppgifter                │ │
│ │                      │ Legal name / registration / place │ │
│ └──────────────────────┴───────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ TEXT                                                         │
│ Scope and response expectation                               │
└──────────────────────────────────────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ WORDMARK                   │
│                            │
│ LABEL                      │
│ H1 Kontakt                 │
│ Lead                       │
│                            │
│ H2 Kontakta Valunds        │
│ EMAIL LABEL                │
│ email address              │
│ PRODUCT LABEL              │
│ enquiry scope              │
│ COMPANY LABEL              │
│ enquiry scope              │
│                            │
│ H2 Bolagsuppgifter         │
│ Legal name                 │
│ Registration               │
│ Location                   │
│                            │
│ Response expectation       │
│                            │
├────────────────────────────┤
│ BOTTOM NAVIGATION          │
└────────────────────────────┘
```

## Placement rules

- Desktop uses 40/60 composition.
- Email address is a real `mailto:` link.
- Company information uses semantic facts.
- A contact form is not required.
- No fake office address, phone number or response-time promise.

---

# 7. 404

## Purpose

Help the visitor recover quickly from an unavailable route while preserving the Valunds identity.

## Heading hierarchy

```text
h1 Sidan kunde inte hittas
```

No additional heading is required.

## Section order

| Order | Section                     | Boundary  |
| ----: | --------------------------- | --------- |
|     1 | Typographic error treatment | `content` |
|     2 | Explanation                 | `text`    |
|     3 | Recovery actions            | `content` |

## Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ CONTENT                                                      │
│                                                              │
│ 404                                                          │
│ H1 Sidan kunde inte hittas                                  │
│ Explanation                                                  │
│                                                              │
│ Till startsidan      Utforska portföljen                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Mobile wireframe

```text
┌────────────────────────────┐
│ WORDMARK                   │
│                            │
│ 404                        │
│ H1 Sidan kunde inte        │
│ hittas                     │
│ Explanation                │
│                            │
│ Till startsidan            │
│ Utforska portföljen        │
│                            │
├────────────────────────────┤
│ BOTTOM NAVIGATION          │
└────────────────────────────┘
```

## Placement rules

- `404` is a typographic marker, not the page heading.
- Recovery actions are ordinary links.
- No illustration, joke copy or animation is required.
- The page remains visually consistent with the main system.
- The page must not trap focus or remove navigation.

---

# Cross-page heading matrix

| Page               | `h1`                    | Primary `h2` groups                               |
| ------------------ | ----------------------- | ------------------------------------------------- |
| Portfölj           | Portfölj                | One per product                                   |
| Valunds ServiceBok | Valunds ServiceBok      | Value, structure, ownership                       |
| SkogsKvitto        | SkogsKvitto             | Context, process, input/output, review, ownership |
| Bolaget            | Bolaget                 | Purpose, structure, working model, people         |
| Engineering        | Engineering             | Principles, delivery model, technical facts       |
| Kontakt            | Kontakt                 | Contact methods, company facts                    |
| 404                | Sidan kunde inte hittas | None required                                     |

No page skips directly from `h1` to `h3`.

# Cross-page grid matrix

| Page               | Masthead        | Primary wide content | Reading content    | Inverse content             |
| ------------------ | --------------- | -------------------- | ------------------ | --------------------------- |
| Portfölj           | `content`       | `wide`               | `text`             | SkogsKvitto `full` + `wide` |
| Valunds ServiceBok | `wide`          | `wide`               | `text` / `content` | None                        |
| SkogsKvitto        | `full` + `wide` | `wide`               | `text` / `content` | Masthead and process        |
| Bolaget            | `wide`          | `wide`               | `text` / `content` | None                        |
| Engineering        | `content`       | `wide`               | `text` / `content` | None                        |
| Kontakt            | `wide`          | within masthead      | `text`             | None                        |
| 404                | `content`       | None                 | `text`             | None                        |

# Implementation contract for M3

M3 must preserve:

- the page purposes;
- the section order;
- the named grid boundary for every section;
- the heading hierarchy;
- the locked masthead ratios;
- the distinction between editorial sections and generic cards;
- the ServiceBok and SkogsKvitto directions locked in M1-06;
- semantic facts, lists and tables where appropriate;
- compact bottom navigation;
- no filler sections;
- no invented business claims, metrics, clients, addresses or people.

Any implementation discovery that changes page hierarchy or adds a section must stop and amend the owning issue before production code continues.

# Approval checklist

## Coverage

- [ ] Portfölj has desktop and mobile wireframes.
- [ ] Valunds ServiceBok has desktop and mobile wireframes.
- [ ] SkogsKvitto has desktop and mobile wireframes.
- [ ] Bolaget has desktop and mobile wireframes.
- [ ] Engineering has desktop and mobile wireframes.
- [ ] Kontakt has desktop and mobile wireframes.
- [ ] 404 has desktop and mobile wireframes.

## Structure

- [ ] Every section names a grid boundary.
- [ ] Every page has exactly one `h1`.
- [ ] No page skips heading levels.
- [ ] Status, domain and ownership remain metadata.
- [ ] Every page has a clear purpose.
- [ ] No filler section is included.

## Scope

- [ ] No production HTML, CSS or JavaScript changed.
- [ ] No final copywriting is claimed.
- [ ] No final imagery decision is introduced.
- [ ] No new route or page is introduced.
- [ ] `bun run check` passes.
- [ ] `git diff --check` passes.
