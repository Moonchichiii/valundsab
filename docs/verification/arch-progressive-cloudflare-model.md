# ARCH – Progressiv Cloudflare-modell

## Vad commiten etablerar

| Katalog          | Roll                                                              |
| ---------------- | ----------------------------------------------------------------- |
| `apps/web/`      | redigerbar webbkälla                                              |
| `functions/`     | Cloudflare Pages Functions (tom tills kontaktfunktionen byggs)    |
| `dist/`          | byggd, deploybar output – versionsignorerad, aldrig handredigerad |
| `wrangler.jsonc` | Cloudflare-konfiguration, `pages_build_output_dir: ./dist`        |

Pinnade verktyg, exakt utan `^` eller `~`: `lightningcss@1.33.0`,
`wrangler@4.114.0`. Sharp och kontaktfunktionen ingår inte i denna commit.

## CSS-kedjan

`apps/web/assets/css/app.css` är en entrypoint på nio rader: lagerdeklarationen
plus sju lagrade importer. Lightning CSS löser importerna, bundlar och
minifierar till `dist/assets/css/app.css`. Källfilerna bär inte längre egna
`@layer`-block – lagret sätts av importsatsen, vilket tar bort dubbleringen.

Tillåtet i byggsteget: importupplösning, CSS-bundling, CSS-minifiering.
Otillåtet och inte implementerat: inline critical CSS, HTML-minifiering,
JavaScript-bundling, asset-hashing, fingerprintade filnamn, framework-build.

Verifierat i den byggda filen: tre `@font-face`-block och lagerordningen
`reset → tokens → base → layout → components → pages → enhancements`.

## Runtime

`bun run dev` = `bun run build` följt av `wrangler pages dev dist`. Playwright
och Lighthouse startar samma runtime mot samma output. Den statiska
felsökningsservern togs bort; repot har en källa, en build, en runtime och en
deploybar output.

`dist/_routes.json` skrivs explicit av bygget:

```json
{ "version": 1, "include": ["/api/*"], "exclude": [] }
```

Allt utom `/api/*` levereras därmed av det statiska lagret.

## Fynd som runtime-bytet avslöjade

1. **Soft-404.** Utan `404.html` svarade Pages statiska lager på okända
   adresser med startsidans innehåll och status 200. En riktig `404.html` lades
   till och okända adresser ger nu 404. Sidan använder befintliga komponenter
   och identisk brand-markup; den typografiska 404-designen hör fortfarande
   till sitt egna issue.
2. **`_headers` i lokal runtime.** Filen exponeras inte, men wrangler svarar
   502 i stället för 404 när den efterfrågas. Testet kontrollerar nu att
   svaret inte är läsbart innehåll (status ≥ 400 och inga direktiv i kroppen)
   i stället för en exakt statuskod som skiljer sig mellan lokal runtime och
   produktion.
3. **ICO-mediatyp.** Cloudflare-runtimen levererar `image/vnd.microsoft.icon`
   där den tidigare statiska servern använde `image/x-icon`. Båda är korrekta
   för formatet; testet accepterar nu båda.
4. **Genererade kataloger i källkontrollerna.** `.wrangler/` och `dist/` lades
   till i `.gitignore`, `.prettierignore`, eslint-ignore och hygienkontrollens
   överhoppade kataloger. `package-lock.json` som uppstod vid installationen
   togs bort – repot har en låsfil, `bun.lock`.
5. **Release-kontrollen** läser nu `dist/`, accepterar `_routes.json` och
   behandlar `404.html` som en känd ingångspunkt utöver `index.html`.

## Plattformsfynd på Windows

Den första leveransen föll på ägarens maskin av två skäl, båda åtgärdade:

1. **Beroenden.** Commiten inför `lightningcss` och `wrangler`. `bun install`
   måste köras efter att arbetsträdet uppdaterats, annars saknas paketen och
   varje kommando som bygger faller. `bun.lock` innehåller de plattformsspecifika
   binärerna för både Windows och Linux.
2. **Processtart i auditen.** Skriptet startade servern via `npx`, som på
   Windows är `npx.cmd` och inte kan startas utan skal. Servern startas nu i
   stället med det lokalt pinnade `wrangler`-kommandot och `shell: true`, vilket
   både löser Windows-fallet och tar bort beroendet av att Node och npx finns
   på maskinen.

## Validering

| Kommando                 | Resultat                                                                  |
| ------------------------ | ------------------------------------------------------------------------- |
| `bun run build`          | app.css 18 581 B, consent-banner.css 2 891 B (ominifierad källa 24 467 B) |
| `bun run check`          | 0                                                                         |
| `bun run check:release`  | 0                                                                         |
| `bun run check:security` | 0                                                                         |
| `bun run test`           | 91/91                                                                     |
| `bun run test:security`  | 16/16                                                                     |
| `bun run audit`          | **0 – tre giltiga körningar**                                             |

| Lighthouse                                        | Körning 1      | Körning 2       | Körning 3       |
| ------------------------------------------------- | -------------- | --------------- | --------------- |
| Stylesheet                                        | 5 482 B        | 5 482 B         | 5 482 B         |
| Script                                            | 1 699 B        | 1 699 B         | 1 699 B         |
| LCP                                               | 1 846 ms       | 1 472 ms        | 1 528 ms        |
| CLS                                               | 0.000          | 0.000           | 0.000           |
| Prestanda / Tillgänglighet / Best practices / SEO | 99/100/100/100 | 100/100/100/100 | 100/100/100/100 |

## Konsekvens för budgetarna

Den uppmätta överföringsstorleken sjönk från 25 246 B till **5 482 B** för CSS
och från 2 799 B till **1 699 B** för JavaScript. Två saker orsakar det:
minifieringen i bygget och att Cloudflare-runtimen komprimerar svaret, vilket
den tidigare statiska servern inte gjorde. Siffran mäter nu det besökaren
faktiskt hämtar.

Budgeten på 25 600 B höjdes inte, men den har därmed förlorat sin styrande
verkan – den ligger nu nästan fem gånger över faktisk förbrukning. Att sätta
ett nytt, meningsfullt tak är ett ägarbeslut och ingår inte i denna commit.
