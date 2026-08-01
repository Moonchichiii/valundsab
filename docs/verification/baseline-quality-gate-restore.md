# BASELINE – Återställda deterministiska kvalitetsgrindar

## Defekten

`bun run check` var röd på den orörda baslinjen. Orsaken var deterministisk och
enbart formateringsrelaterad: `components.css`, `motion.css` och `pages.css`
följde inte formateringsregeln. Filerna var samtidigt **döda** – noll
HTML-dokument refererade dem, eftersom hela CSS-innehållet fanns inlagt direkt
i en manuellt sammanslagen `app.css`. Repot hade därmed två källor till
sanning för samma CSS.

## Åtgärd

Den sammanslagna `app.css` delades tillbaka till modulära källor enligt den
låsta lagerordningen. Källorna är nu enda sanningen och `app.css` är den
artefakt de bildar:

| Källfil          | Lager                                             | Storlek  |
| ---------------- | ------------------------------------------------- | -------- |
| `reset.css`      | reset                                             | 569 B    |
| `foundation.css` | @font-face + tokens                               | 3 401 B  |
| `base.css`       | base                                              | 1 737 B  |
| `layout.css`     | layout                                            | 627 B    |
| `components.css` | components (fyra block, inbördes ordning bevarad) | 10 147 B |
| `pages.css`      | pages                                             | 7 719 B  |
| `motion.css`     | enhancements                                      | 184 B    |

Inga döda dubbletter återstår. `consent-banner.css` behölls – den är inte död
utan laddas avsiktligt av testfixturen för consent-required-läget.

## Bevis för att beteendet är oförändrat

Sammanfogningen av källorna i lagerordning gav en fil med **identisk
bytelängd** (24 467 B) och **identisk regelmängd** (122 regler, noll saknade,
noll extra) jämfört med den tidigare `app.css`. Enda skillnaden är i vilken
ordning `@layer`-blocken står i filen, vilket kaskaden inte påverkas av
eftersom lagerordningen deklareras explicit. Den uppmätta
produktionsöverföringen är oförändrad: 25 246 B före och efter.

## Validering

| Kommando                 | Resultat                      |
| ------------------------ | ----------------------------- |
| `bun run check`          | 0                             |
| `bun run check:release`  | 0                             |
| `bun run check:security` | 0                             |
| `bun run test`           | 91/91                         |
| `bun run test:security`  | 16/16                         |
| `bun run audit`          | **0 – tre giltiga körningar** |

| Lighthouse                                        | Körning 1       | Körning 2       | Körning 3       |
| ------------------------------------------------- | --------------- | --------------- | --------------- |
| Stylesheet                                        | 25 246 B        | 25 246 B        | 25 246 B        |
| Script                                            | 2 799 B         | 2 799 B         | 2 799 B         |
| LCP                                               | 1 598 ms        | 1 589 ms        | 1 507 ms        |
| CLS                                               | 0.000           | 0.000           | 0.000           |
| Prestanda / Tillgänglighet / Best practices / SEO | 100/100/100/100 | 100/100/100/100 | 100/100/100/100 |

Ingen körning avbröts av `NO_NAVSTART`. Auditen räknas därmed som godkänd.

## Kvarstående

`app.css` är fortfarande handredigerbar. Kontraktet att filen genereras och
aldrig redigeras manuellt införs med byggsteget i nästa commit, tillsammans med
en driftkontroll som fäller grinden om artefakten avviker från källorna.
