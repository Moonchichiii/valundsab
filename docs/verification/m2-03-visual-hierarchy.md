# M2-03 – Verifieringsrapport: produktbilder och professionell visuell hierarki

## Produktionsläge

- Responsiva produktbilder levereras från egen origin (`/assets/products/`).
- Cloudinary används som masterarkiv och processor, aldrig som runtime-CDN.
- `img-src 'self'`, noll tredjepartsrequests och GDPR-modellen är oförändrade.
- Native snabbnavigation (view transitions + speculation rules) ingår **inte**
  i detta pass; `intent-prefetch.js` finns i repot men är avlänkad tills den
  egna sista commiten.

## Bildpipeline

`scripts/build-product-images.mjs` (Bun/Node + sharp, körs som verktyg – aldrig
i runtime) genererar matrisen ur `apps/web/assets/products-src/`:

| Layout  | Bredder                 | Format      |
| ------- | ----------------------- | ----------- |
| Mobil   | 360 / 540 / 720         | AVIF + WebP |
| Desktop | 720 / 960 / 1280 / 1600 | AVIF + WebP |

Markupen är `<picture>` med separata mobil- och desktopkällor i båda formaten,
`sizes` per layout, explicita `width`/`height` (CLS 0.000), `loading="lazy"`
och `decoding="async"`. Ingen bildprefetch: `srcset`/`sizes` låter webbläsaren
välja rätt fil tidigt.

**Kvarvarande input:** källfilerna i `products-src/` är i denna leverans
rastrerade ur de tidigare demo-SVG:erna. När de fyra anonymiserade
skärmdumparna finns läggs de in med samma filnamn och matrisen byggs om med
ett kommando – ingen markup- eller CSS-ändring krävs. Riktiga mobilvyer
ersätter då den automatiska uppmärksamhetsbeskärningen.

## Stylesheet-arkitektur och budget

Budgeten höjdes **inte**. Ordningen var optimering först, mätning sedan:

| Åtgärd                                                    | Besparing |
| --------------------------------------------------------- | --------- |
| Fem blockerande stylesheets sammanförda till `app.css`    | 3 096 B   |
| Oanvända layouthjälpare och tokens borttagna              | 854 B     |
| Duplicerad polish-CSS i `motion.css` sammanslagen         | 263 B     |
| `motion.css` sammanförd med `app.css` (en request totalt) | 774 B     |

Varje stylesheet-request kostar cirka 774 B i overhead. Sex filer betydde
4 644 B – 18 % av budgeten – i headers i stället för CSS. Efter
sammanslagningen finns **en** stylesheet.

Mätningen avgjorde också den delade filens vara eller icke vara: den tidigare
uppdelningen i kritisk CSS + `motion.css` i body-slutet gav **sämre** LCP
(median 1586 ms, spridning 129 ms) än en enda fil (median 1585 ms, spridning
2 ms), eftersom Lighthouse-simuleringen ändå räknar body-end-CSS som
render-blockerande medan den extra requesten kostar en full rundtur. En fil är
alltså både mindre och snabbare.

- Stylesheet: **25 246 B** av 25 600 (marginal 354 B)
- Script: **2 799 B** av 4 096
- Bilder: **32 795 B** – ny budget införd på 153 600 B så att riktiga
  skärmdumpar inte kan växa okontrollerat
- Dödkodsskanning efter passet: noll oanvända klasser, noll oanvända tokens

## Lighthouse (mobil, containermiljö)

| Körning | LCP     | CLS   | Prestanda | Tillgänglighet | Best practices | SEO |
| ------- | ------- | ----- | --------- | -------------- | -------------- | --- |
| 1       | 1586 ms | 0.000 | 100       | 100            | 100            | 100 |
| 2       | 1584 ms | 0.000 | 100       | 100            | 100            | 100 |
| 3       | 1585 ms | 0.000 | 100       | 100            | 100            | 100 |

Samtliga assertions gröna (`bun run audit` avslutas med 0). LCP-kontraktet är
1800 ms median; marginalen är drygt 200 ms i containern och väsentligt större
på referensmaskinen.

## Visuell hierarki

- **Produktscener:** varje produkt får en egen yta i stället för ett neutralt
  kort. ServiceBok på varm sand med brun linjefärg, SkogsKvitto på djup
  skogsgrön med ljus typografi. Färgerna är komponentlokala custom properties;
  inga nya globala tokens, inga gradienter, ingen glow, inga skuggor.
- **Statement:** rubriken cirka 15 % mindre (`clamp(2.3rem, 1.55rem + 3.8vw,
5.1rem)`), längre radmått, mer luft mellan svensk och engelsk text, lägre
  sektionshöjd.
- **Kontakt:** verklig kontaktväg tillagd (`kontakt@valunds.se`) och cirka
  20–25 % mindre slutyta via `main > .page-section:last-of-type`.
- **Footer på mobil:** endast bolagsnamn, år och juridiska länkar; huvudnavigation
  bärs av den fasta bottennavigationen.
- **Kaklauncher:** större avstånd till footern och mindre visuell ring
  (3.05rem badge) – klickytan och det kontrakterade kollapsade måttet 68×68 px
  är oförändrade.
- **Vertikal rytm:** sektionspadding sänkt cirka 14 % på desktop.

## Ändringar utanför ren design som kräver ägarens kännedom

1. `scripts/check-release.mjs`: `.avif` och `.webp` tillagda i listan över
   tillåtna filtyper i det deploybara trädet.
2. `scripts/serve.mjs`: MIME-typ för `.webp` tillagd (saknades; filer
   levererades som `application/octet-stream`).
3. `tests/visual-lock.spec.js`: fokusordningstestet räknar nu endast länkar med
   renderad geometri. Utan justeringen räknas footerns dolda mobilduplikat som
   fokuserbara. Testets avsikt – att tabbordningen följer DOM-ordningen utan
   luckor – är oförändrad. **Denna teständring behöver ditt godkännande.**
4. `tests/polish.spec.js` skriven om för den nya bildarkitekturen: format- och
   layouttäckning, scenytor, mobilfooter och kontaktväg. Prefetch-testet är
   borttaget och återkommer med navigationscommiten.

## Testresultat

- `bun run test`: **91/91 gröna**
- `bun run test:security`: **16/16 gröna**
- `bun run check`, `check:release`, `check:security`: gröna
