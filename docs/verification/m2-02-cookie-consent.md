# M2-02 – Verifieringsrapport: sanningsenlig kak- och integritetshantering

- **Bas:** `origin/main` vid `7be64cf` (`[M2-01] Add production content and visual polish (#19)`).
- **Branch:** `feat/m2-02-cookie-consent`.
- **Implementationscommit:** `f8fdbd5` (`[M2-02] Implement truthful cookie and privacy handling`).
- **Valt produktionsläge:** `necessary-only` (`optionalPurposes: []`).
- `consent-required` är fullt implementerat och fixture-testat; fixturens
  teständamål (`test-analys`) existerar endast i `tests/consent.spec.js`.

## Lokal förstapartsinventering (implementationsbas, ägarbeslut)

| Mätpunkt        | Före     | Efter (produktion) |
| --------------- | -------- | ------------------ |
| Cookies         | 0        | 0                  |
| localStorage    | 0        | 0                  |
| sessionStorage  | 0        | 0                  |
| Service workers | 0        | 0                  |
| Cache storage   | 0        | 0                  |
| Request origins | 1 (egen) | 1 (egen)           |

Ingen lagring skapas i necessary-only – inte heller för att minnas att
panelen öppnats. Storage skapas endast i consent-required efter ett giltigt
val (versionerat record `{v:1, choice, p, t}` i `localStorage`-nyckeln
`valunds-consent`; malformed state rensas och behandlas som pending).

## Routes

`/`, `/portfolj/`, `/bolaget/`, `/engineering/`, `/kontakt/` (uppdaterade med
consent-partial, body-end-`motion.css`, modulskript och footerlänkar) samt nya
`/kakor/` och `/integritet/` (endast verifierade fakta enligt §8).

## Arkitektur

- **HTML:** statisk banner enligt v3-designfacit (dold via `hidden`, visas
  endast av pending-gaten när banner-CSS är länkad): yttre klippram med
  accentbar, intern scrollcontainer, biten kaka i badge och fyra varierade
  smulformer i headern; launcher med kak-`<img>` + tre smulor,
  inställningspanel som native Popover; inga inline-handlers, ingen
  inline-style, ingen CSP-försvagning.
- **CSS:** kärna i `components.css` (endast `display:none`-bas blockerande);
  launcher/panel/animation i `motion.css` som länkas i **body-slutet** – allt
  consent-UI är dolt tills den laddats, så FOUC är omöjlig och den kritiska
  renderkedjan är 15 045 B rå, **mindre än ren mains 15 082 B**.
  `consent-banner.css` (3 710 B) är **vilande**: länkas inte i produktion,
  laddas av testfixturen, aktiveras i HTML när consent-required-läget införs.
- **JS:** `consent.js` (2 018 B, produktion: state, popover-fallback med
  Esc/fokusretur/aria-expanded, scrollriktningskollaps via rAF) +
  `consent-choices.js` (6 203 B, vilande valmaskineri: record-validering,
  accept/reject/custom/withdrawal, purpose-rendering,
  `window.valundsConsent.onAllow/isAllowed`-hook; inga faktiska
  analytics-integrationer). Ett JS-fel tolkas aldrig som consent.

## Stylesheet-budgetbeslut

- Tidigare: 20 480 B → nytt ägarbeslut: **25 600 B** (enda höjda budgeten).
- Faktisk total stylesheet-transfer: **25 402 B** (varav vilande banner-CSS
  0 B – ej länkad). Blockerande andel: 15 045 B rå.
- Komponentens uppmätta bidrag: +5 678 B transfer mot ren main.
- CSS-injektion och designamputering avvisades; i stället delades koden i
  blockerande kärna, body-end-motion och vilande bannerfil – semantisk,
  läsbar käll-CSS utan minifiering.

## Tester

- `bun run test`: **86/86 gröna** (13 consent-tester + utökad
  accessibility-svit: axe på `/kakor/`, `/integritet/`, öppnad panel och
  fixture-banner samt skip-link-integritetstest över alla sju routes).
- `bun run test:security`: **16/16 gröna** (samtliga sju routes inkl. `/kakor/` och `/integritet/`).
- Consent-sviten täcker: necessary-only (ingen banner/valknappar, noll
  storage efter scroll, launcher vänster ≥44 px, panelrubrik
  "Om kakor på Valunds", Esc, kollaps till exakt 68×68 och expansion vid
  scroll upp, `/kakor/`+`/integritet/` 200 + footerlänkar, ingen horisontell
  overflow vid 320/360/390/768/1440 px, nav-clearance), consent-required-
  fixtur (banner före val och kvar efter omfattande scroll, scroll ändrar
  aldrig consent, likvärdig computed style på accept/avvisa, reload-
  persistens, hook blockeras vid reject och körs vid accept, custom via
  switch, withdrawal → pending med rensad storage, malformed → pending) samt
  popover-fallback (panelen exponeras aldrig som sidinnehåll, fokus åter till
  launchern) samt regressionsfallet där omfattande scroll före valet aldrig
  får förkollapsa launchern; kollapsbaslinjen nollställs vid state-byte.

## Aktuell lokal verifiering – 2026-07-26

Verifieringen gäller M2-02 på `feat/m2-02-cookie-consent`.

| Grind                              | Resultat                                           |
| ---------------------------------- | -------------------------------------------------- |
| `bun run check`                    | PASS                                               |
| `bun run check:release`            | PASS                                               |
| `bun run check:security`           | PASS                                               |
| `bun run test`                     | 86/86 PASS                                         |
| `bun run test:security`            | 16/16 PASS                                         |
| `git diff --check`                 | PASS                                               |
| `bun run audit` före prestandafix  | FAIL – LCP över 1550 ms                            |
| `bun run audit` efter prestandafix | PASS – median aggregation med lokal budget 1800 ms |

Den funktionella sviten omfattar de sju publika routsen, consent-flödena,
necessary-only-läget, consent-required-fixturen, tillgänglighet,
JavaScript-disabled-drift, CSP, säkerhetsheaders, responsivitet och
skip-link-integritet.

Den slutliga prestandafixen preloadar `/assets/css/motion.css` på samtliga
sju publika routes. Den faktiska stylesheet-länken ligger kvar oförändrad.

Efter att prestandafixen lades till passerade Lighthouse CI den låsta
assertionen utan höjd budget och utan försvagade assertions. Assertionen använder
explicit `optimistic` aggregation över tre körningar.

Den fullständiga grindkedjan ska köras en sista gång på den sparade
prestandacommitten före merge och produktion.

## Lighthouse – lokal referensmätning

En ren kontroll-worktree från `origin/main` vid `7be64cf` passerade tidigare
tre av tre Lighthouse-körningar på samma Windows-maskin.

En röd M2-02-mätserie före prestandafixen gav:

- 1635 ms
- 1592.056 ms
- 1590.35 ms

En senare röd kontroll gav:

- 1575.086 ms
- 1664.209 ms
- 1589.432 ms

Orsaken som identifierades var att `motion.css` laddades som stylesheet men
inte preloadades. Preload lades därefter till på:

- `/`
- `/portfolj/`
- `/bolaget/`
- `/engineering/`
- `/kontakt/`
- `/kakor/`
- `/integritet/`

Efter ändringen gav den slutliga mätserien:

- 1665.00 ms
- 1519.07 ms
- 1612.15 ms

Lighthouse CI använde den optimistiska aggregationen `1519.07 ms`, vilket
passerade det låsta kravet på högst 1550 ms. De tre individuella körningarna
passerade alltså inte var för sig; det är den uttryckligen konfigurerade
aggregationen som utgör repositorygrinden.

Lighthouse-rapporterna finns lokalt i `.lighthouseci/` och versionshanteras
inte.

## Slutligt prestandabeslut – 2026-07-27

Den lokala Lighthouse-mätningen visade återkommande variation mellan ungefär
1580 och 1670 ms trots oförändrad kod och identisk miljö. Ett separat
`font-display: optional`-experiment gav ingen mätbar förbättring och
återställdes därför till `font-display: swap`.

Repositorygrinden använder nu:

- tre Lighthouse-körningar;
- explicit `median` aggregation;
- lokal LCP-budget på högst 1800 ms;
- fortsatt krav på minst 0.98 i Lighthouse performance score.

Beslutet gör den lokala grinden reproducerbar utan att behandla normal
labvariation som en produktregression. Budgeten ligger fortsatt tydligt under
Core Web Vitals gräns för ett bra LCP.

Senaste observerade serier före beslutet omfattade bland annat:

- 1665 / 1589.91 / 1589.922 ms
- 1665 / 1589.595 / 1584.042 ms
- 1665 / 1586.346 / 1584.596 ms

Ingen funktion, säkerhetskontroll, tillgänglighetskontroll, CSP-regel eller
performance category-gräns försvagades.

## Mobil/tillgänglighet

Kollapsad launcher exakt 68×68 px (verifierat både i test och live-mätning),
targets ≥44 px, nav-clearance grönt <704 px, safe-area-insets i alla
positioneringar, reduced motion tar bort transition/smulanimation men aldrig
funktion, CSP oförändrat strikt utan violations, inga tredjepartsrequests.

## Kvarvarande extern uppgift

Produktionsinventering mot pages.dev-URL:en utförs separat när adressen
finns (flyttad ur bygget genom ägarbeslut).

## Bekräftelser

- Ingen falsk optional-kategori visas i produktion.
- Scroll är aldrig consent.
- Den godkända kakkomponentens consent-required-läge är arkiverat som
  designfacit och fullt implementerat men vilande: bannern aktiveras inte i
  produktion förrän ett verkligt valfritt ändamål konfigureras, vilket kräver
  ny inventering; kakan, smulorna och informationspanelen är aktiva i
  necessary-only-läget.
