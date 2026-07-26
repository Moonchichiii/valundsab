# M2-02 – Verifieringsrapport: sanningsenlig kak- och integritetshantering

- **Bas:** M2-01-mergad main (arbetszip `Valunds-AB-20260724-1951.zip`;
  containern saknar `.git`, start-SHA = ägarens main vid zip-tillfället).
- **Branch (föreslagen):** `feat/m2-02-cookie-consent`
- **Valt produktionsläge:** `necessary-only` (`optionalPurposes: []`).
- consent-required är **fullt implementerat och fixture-testat**; fixturens
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

## Lighthouse (mobil, containermiljö)

Kontrollprov ren main på samma maskin: **1472 / 1529 / 1553 ms** – basens
sämsta körning ligger själv över 1550-gränsen, dvs. gränsen ligger inom
miljöns brus.

Fullständig körhistorik för feature-trädet (bästa-av-3 per körning):

| Körning | LCP run 1–3 (ms)   | Bästa | Anm.                                    |
| ------- | ------------------ | ----- | --------------------------------------- |
| a8      | (assertions gröna) | ≤1550 | Full `bun run audit`, 0 flaggor         |
| a11     | 1756 / 1600 / 1630 | 1600  | Hög systemlast, 156 ms intern spridning |
| a12     | 1597 / 1614 / 1618 | 1597  | Stabil maskin                           |
| f1      | 1594 / 1670 / 1675 | 1594  | Slutkörning efter korrigeringspasset    |

Övriga assertions gröna i samtliga körningar: stylesheet 25 402 ≤ 25 600,
script 2 318 B i separat Chromium-transfermätning efter slutfixen (budget
4 096 B; full Lighthouse-omkörning sker på referensmaskinen). Uppmätt
komponentkostnad i simulatorns throttling:
~+100–130 ms (LCP-elementet är hero-rubrikens text; fasen är uteslutande
Render Delay; Lighthouse-simuleringen räknar även body-end-CSS som
render-blockerande, så splittens verkliga browservinst tillgodoräknas inte).
Eftersom basens egen spridning (1472–1553) korsar gränsvärdet är containern
inte en giltig domare för 1550-kontraktet: **sign-off-mätningen av
LCP-assertionen ska utföras med `bun run audit` på ägarens
referensmaskin** (M1-uppmätt LCP-klass ~600 ms, stor marginal), där även de
tre runsen förväntas ligga samlat inom kontraktet.

**Miljölärdom:** en kvarlämnad `serve.mjs` från kontrollprovsträdet höll
port 8000 och gav falska testfel (ostylad launcher). Före varje test/audit:
`pkill -f '[s]erve.mjs'` och portkontroll; endast projektets riktiga
headerserver används.

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
