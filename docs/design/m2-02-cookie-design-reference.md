# M2-02 – Designfacit: kakkomponenten (v3)

Den granskade v3-prototypen är visuellt facit för hela consent-komponenten:
seriös Valunds-typografi och sober struktur i banner, panel och juridisk copy –
all lekfullhet koncentrerad till kakan och dess rörelse.

## Låsta designbeslut

- Launcher nere till vänster: expanderad pill 12.5rem, kollapsad exakt 68×68 px,
  minst 44×44 px interaktiv yta, full clearance över mobilnavigationen,
  `safe-area-inset-left`/`safe-area-inset-bottom`.
- Biten SVG-kaka med komponentlokala färger `#d99852` (yta) och `#8d572f`
  (kant), roterad −7°, i cirkulär badge.
- Varierade oregelbundna smulor (`data-crumb="one|two|three|four"`; alla fyra formerna i bannern, tre på launcherbadgen) med olika form och
  rotation; fallanimationen startar först när kollapsen är klar, sprider åt
  båda håll och accelererar (staggade delays 200/420 ms).
- Kollaps styrs av verklig scrollriktning med positionen efter valet som
  baslinje – aldrig sidans absoluta scrollposition.
- Banner: yttre klippram, likvärdiga fyllda "Acceptera alla"/"Avvisa valfria",
  intern scrollcontainer på små höjder.
- Inga gradients, ingen glow, ingen generisk AI-estetik.

## SVG-attribution

- Källa: Uiverse.io – cookie-/kak-element av **vinodjangid07**
  (uiverse.io/vinodjangid07), varifrån kak-SVG:ns pathdata hämtades.
- Licens: Uiverse.io publicerar sina element under **MIT-licensen** enligt
  plattformens användarvillkor.
- Lokala modifieringar: pathdata extraherad till fristående fil
  `apps/web/assets/brand/cookie.svg` med inbakad färgsättning
  (`fill="#d99852"`, `stroke="#8d572f"`, `stroke-width="1.15"`); rotation
  −7° appliceras via CSS; egna smulelement (fyra former) komponerade runt
  kakan; övrig originalstyling från källan används inte.

## Status

Komponentens consent-required-läge (banner + valmaskineri) är godkänt,
implementerat och **vilande**: `consent-banner.css` och `consent-choices.js`
länkas inte i produktion utan aktiveras när ett verkligt valfritt ändamål
konfigureras – vilket kräver ny inventering före aktivering. Kakan och
smulorna är designfacit och aktiva i produktionens necessary-only-läge som
informationskontroll.
