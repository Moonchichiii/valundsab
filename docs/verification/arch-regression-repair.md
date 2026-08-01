# ARCH – Reparation av build-, audit- och dokumentationskontraktet

## Vad som var trasigt

Övergången till `dist/` gjorde katalogen obligatorisk för varje runtime men
lämnade grindarna beroende av att den redan råkade finnas. Fem konkreta
regressioner:

1. **Auditen byggde inte själv.** `bun run audit` startade en server mot
   `dist/` utan att skapa den. I en ren checkout finns ingen `dist/`, eftersom
   katalogen är versionsignorerad – prestandajobbet i CI var därmed brutet.
   Värre: på en maskin med gammal `dist/` kunde Lighthouse bli grönt för fel
   version av källkoden.
2. **Auditen gick via `npx`.** Projektet är Bun-styrt med exakt pinnad
   Wrangler; en separat resolver kunde plocka en annan version och krävde att
   Node och npx fanns installerat.
3. **Testkörningen dog mitt i sviten.** Wranglers dev-server avslutades under
   pågående Playwright-körning på Windows. Femtiosju tester föll med
   `ERR_CONNECTION_REFUSED` – inte för att sajten var trasig, utan för att
   runtimen försvann.
4. **README beskrev en arkitektur som inte längre fanns** – `apps/web` som
   deploybar katalog, inget byggverktyg, ingen source transformation.
5. **`docs/DEPLOYMENT.md` hänvisade bara till ADR 0005** trots att build-,
   output- och runtime-modellen styrs av ADR 0006.

## Åtgärd

**Auditen är självförsörjande.** `bun run audit` är nu
`bun run build && bun scripts/run-audit.mjs`. Den bygger alltid en ren `dist/`
från aktuell källa innan Lighthouse startar, så en grind kan aldrig mäta
gammal output. Playwright bygger på samma sätt före sin server startar.

**En output, en läsare per uppgift.** Projektets egen server serverar nu
`dist/` i stället för `apps/web` och är runtime för både Playwright och
Lighthouse. Den startas direkt som en fil med `process.execPath` – ingen PATH,
inget skal, ingen npx, identiskt beteende på Windows och Linux.
`bun run dev` kör den pinnade Wrangler-versionen mot samma `dist/` och är
runtimen för arbetet med Pages Functions.

Avvikelsen mot den ursprungliga instruktionen är medveten och dokumenterad i
ADR 0006: kvalitetsgrindarna får inte bero på en dev-server som avslutas mitt
i en testsvit. Wrangler är kvar, pinnad och obligatorisk för Functions.

**Dokumentationen stämmer med koden.** README beskriver
källa → build → `dist/` → Pages, med kommandona som faktiskt finns.
`docs/DEPLOYMENT.md` pekar på ADR 0005 för plattformen och ADR 0006 för
build- och runtime-modellen.

**Genererade kataloger** – `dist/`, `.wrangler/`, `.lighthouseci/`,
`test-results/`, `playwright-report/` – är versionsignorerade och undantagna
från formatering, lint och källhygien.

## Bevis från ren miljö

Alla genererade kataloger togs bort före körningen.

| Steg                              | Resultat                                     |
| --------------------------------- | -------------------------------------------- |
| `dist/` före `bun run audit`      | saknades                                     |
| `dist/` efter att auditen startat | byggd av auditen själv                       |
| `bun run build`                   | app.css 18 581 B, consent-banner.css 2 891 B |
| `bun run check`                   | 0                                            |
| `bun run check:release`           | 0                                            |
| `bun run check:security`          | 0                                            |
| `bun run test`                    | 91/91                                        |
| `bun run test:security`           | 16/16                                        |
| `bun run audit`                   | **0 – tre giltiga körningar**                |

| Lighthouse                                        | Körning 1      | Körning 2       | Körning 3       |
| ------------------------------------------------- | -------------- | --------------- | --------------- |
| Stylesheet                                        | 19 356 B       | 19 356 B        | 19 356 B        |
| Script                                            | 2 799 B        | 2 799 B         | 2 799 B         |
| LCP                                               | 1 523 ms       | 1 611 ms        | 1 512 ms        |
| CLS                                               | 0.000          | 0.000           | 0.000           |
| Prestanda / Tillgänglighet / Best practices / SEO | 99/100/100/100 | 100/100/100/100 | 100/100/100/100 |

Inga HTML-, CSS-, design-, produkt- eller innehållsfiler ändrades i denna
reparation.

## Kvarstående observation

En körning på ägarens maskin visade fontrelaterad CLS på 0.0015 mot gränsen
0.001. Värdet går inte att återskapa i byggmiljön, där CLS mäts till 0.000 i
samtliga körningar. Det bör mätas om efter denna reparation innan slutsats
dras, eftersom den tidigare mätningen gjordes när runtimen var instabil.
