# M2-03 – Redaktionell kontaktsida och företagsstruktur

## Kontaktsidan

`/kontakt/` är byggd i det låsta 40/60-förhållandet: vänsterkolumnen bär
ärendetyperna, svarslöftet och den direkta e-postadressen, högerkolumnen bär
formuläret. På mobil faller kolumnerna till en sekvens.

Formuläret är native och fungerar utan JavaScript:

```
<form action="/api/contact" method="post">
```

| Fält      | Typ                                 | Krav                                              |
| --------- | ----------------------------------- | ------------------------------------------------- |
| `name`    | text, `autocomplete="name"`         | obligatoriskt, max 120 tecken                     |
| `email`   | email, `autocomplete="email"`       | obligatoriskt, max 200 tecken                     |
| `company` | text, `autocomplete="organization"` | valfritt, max 120 tecken                          |
| `subject` | select                              | obligatoriskt, tre låsta värden                   |
| `message` | textarea                            | obligatoriskt, max 4 000 tecken                   |
| `website` | text                                | dold fälla, `tabindex="-1"`, `autocomplete="off"` |

Validering sker med webbläsarens egen constraint validation före all
skriptvalidering, enligt engineering-standarden. Ingen inline-JavaScript,
inga inline-stilar, ingen ARIA som dubblerar inbyggd semantik.

`/kontakt/tack/` är skapad som mål för den `303 See Other` som funktionen
skickar efter en lyckad postning. Sidan är en riktig route med eget innehåll,
inte en platshållare.

**Formuläret är inte live än.** `/api/contact` implementeras i nästa commit.
Fram till dess är e-postadressen den fungerande kontaktvägen, och den finns
både i vänsterkolumnen och i footern.

## Företagsstruktur

`/bolaget/` har en redaktionell strukturssektion i två kolumner på desktop och
en rak sekvens på mobil:

```
MODERBOLAG                     PORTFÖLJ
Valunds Digitala Tjänster      Valunds ServiceBok
Produktutveckling · Drift      Digital servicehistorik för fordon
· Förvaltning
                               SkogsKvitto
                               Ekonomiskt underlag för skogs- och lantbruk
```

Uppbyggd som definitionslistor med 1px-linjer mellan portföljposterna. Inga
kort, inga ikoner, inga skuggor, inget illustrerat organisationsschema. Inga
juridiska uppgifter renderas eftersom de ännu inte är verifierade.

## Kakknappen

Knappen lade sig ovanpå brödtexten på kontaktsidan. Den parkeras nu i
yttermarginalen när det finns plats:

```css
inset-inline-start: max(
  var(--gutter),
  env(safe-area-inset-left),
  calc((100vw - var(--width-content)) / 2 - 4.25rem - var(--space-s))
);
```

Ett test mäter överlapp mot all text i `main` vid 1440 px och fäller bygget om
knappen täcker innehåll. Klickytan och det kontrakterade kollapsade måttet
68×68 px är oförändrade.

## Validering

| Kommando                 | Resultat                      |
| ------------------------ | ----------------------------- |
| `bun run check`          | 0                             |
| `bun run check:release`  | 0                             |
| `bun run check:security` | 0                             |
| `bun run test`           | **95/95**                     |
| `bun run test:security`  | **16/16**                     |
| `bun run audit`          | **0 – tre giltiga körningar** |

| Lighthouse                                        | Körning 1      | Körning 2       | Körning 3       |
| ------------------------------------------------- | -------------- | --------------- | --------------- |
| Stylesheet                                        | 21 590 B       | 21 590 B        | 21 590 B        |
| Script                                            | 2 799 B        | 2 799 B         | 2 799 B         |
| LCP                                               | 1 588 ms       | 1 540 ms        | 1 529 ms        |
| CLS                                               | 0.000          | 0.000           | 0.000           |
| Prestanda / Tillgänglighet / Best practices / SEO | 94/100/100/100 | 100/100/100/100 | 100/100/100/100 |

Stylesheet 21 590 B mot budgeten 25 600 B lämnar 4 010 B marginal. Nya tester:
native formulär med samtliga fältkrav, formuläret utan JavaScript,
bekräftelsevyn, företagsstrukturen som två jämnhöga kolumner, och att
kakknappen inte täcker brödtext.
