# M2-03 – Säker mottagning av kontaktformuläret

## Endpoint

`functions/api/contact.js` svarar på `/api/contact`. Routningen styrs av den
explicita `dist/_routes.json` som bygget skriver, så endast `/api/*` når
funktionskod – allt annat levereras av det statiska lagret.

Filen är JavaScript, inte TypeScript. Att typkontrollera funktionen hade krävt
minst två nya pinnade beroenden för lint- och byggkedjan, vilket är ett eget
beslut. Säg till om du vill ha `.ts` med `typescript` och `typescript-eslint`
pinnade, så konverteras filen i en egen commit.

## Kontrakt

| Villkor                                                                      | Svar                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------- |
| GET, PUT, PATCH, DELETE                                                      | `405` med `Allow: POST`                  |
| `Origin` från annan origin, eller `Sec-Fetch-Site` som inte är `same-origin` | `403`                                    |
| Annat än `application/x-www-form-urlencoded`                                 | `415`                                    |
| Kropp över 16 KiB, deklarerad eller faktisk                                  | `413`                                    |
| Fler än fem försök per klient och minut                                      | `429` med `Retry-After`                  |
| Ifylld honungsfälla                                                          | `303` till bekräftelsevyn, inget skickas |
| Ogiltiga eller ofullständiga fält                                            | `400` utan detaljer                      |
| Leverans avstängd                                                            | `503` som hänvisar till e-postadressen   |
| Leverans misslyckas                                                          | `502` som hänvisar till e-postadressen   |
| Godkänd postning                                                             | `303` till `/kontakt/tack/`              |

Ingen CORS-header sätts, så anrop från andra origins får aldrig läsa svaret.

## Validering på servern

Alla fält omvalideras oberoende av HTML-formulärets egna krav: obligatoriska
fält måste ha innehåll, e-postadressen måste ha giltig form, ärendet måste vara
ett av tre låsta värden, och varje fält har en längdgräns (namn 120, e-post
200, företag 120, meddelande 4 000 tecken).

Före validering normaliseras indata: radbrytningar blir `\n` och
styrtecken tas bort, vilket stänger header- och loggningsinjektion. Innehållet
sätts aldrig in som HTML – meddelandet skickas som `text/plain`.

## Skydd mot missbruk

Honungsfällan `website` är dold med `display: none`, har `tabindex="-1"` och
`autocomplete="off"`. Fylls den i får avsändaren samma bekräftelse som en
riktig postning men ingenting levereras, så en bot inte kan skilja fallen åt.

Rate limiting är ett glidande fönster på fem försök per minut och klient-IP,
hållet i minnet i den körande isolaten. Det är avsiktligt kortlivat och
bästa-möjliga, inte en garanti – Turnstile läggs till först om verkligt
missbruk motiverar den extra integritets- och CSP-kostnaden.

## Loggning och hemligheter

Vid misslyckad leverans loggas endast HTTP-statusen. Meddelandetext,
e-postadress och namn loggas aldrig. Felmeddelanden till besökaren är
generiska och avslöjar inget om intern uppbyggnad.

Ingen nyckel finns i repot. Funktionen läser fyra värden från miljön:

| Variabel                 | Roll                                          |
| ------------------------ | --------------------------------------------- |
| `CONTACT_FORM_ENABLED`   | måste vara `true`, annars levereras ingenting |
| `CLOUDFLARE_ACCOUNT_ID`  | konto för Email Service                       |
| `CONTACT_EMAIL_TOKEN`    | API-token, sätts som Cloudflare-secret        |
| `CONTACT_SENDER_ADDRESS` | verifierad avsändaradress                     |

## Egna säkerhetsheaders

`_headers` gäller inte svar från Functions. Varje svar sätter därför sina egna:
`Content-Security-Policy` med `default-src 'none'`, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` och
`Cache-Control: no-store`.

## Verifierat i Cloudflare-runtimen

Kört mot `wrangler pages dev dist`:

```
GET  /api/contact  → 405
POST application/json → 415
POST tom kropp     → 400
POST giltig        → 503   (leverans avstängd)
POST med fälla     → 303   → /kontakt/tack/
```

Svarsheaders bekräftade på plats i samma körning.

## Validering

| Kommando                 | Resultat                            |
| ------------------------ | ----------------------------------- |
| `bun run check`          | 0                                   |
| `bun run check:release`  | 0                                   |
| `bun run check:security` | 0                                   |
| `bun run test`           | **108/108** (13 nya för endpointen) |
| `bun run test:security`  | 16/16                               |

Endpointtesterna anropar hanteraren direkt med konstruerade `Request`-objekt.
De behöver varken server eller Wrangler och är därmed lika deterministiska på
Windows som i CI.

## Kvar innan formuläret kan gå live

1. DNS flyttat till Cloudflare (M5).
2. Domänen onboardad i Email Sending med SPF- och DKIM-poster.
3. Avsändaradress verifierad, `kontakt@valunds.se` verifierad som mottagare.
4. `CONTACT_EMAIL_TOKEN` satt som secret, övriga tre variabler satta.
5. `CONTACT_FORM_ENABLED` satt till `true` – först då levereras något.

Fram till dess svarar endpointen `503` och hänvisar till e-postadressen, som
står både på kontaktsidan och i footern. Integritetstexten är samtidigt
uppdaterad: den påstår inte längre att webbplatsen saknar formulär, utan
beskriver exakt vilka uppgifter formuläret behandlar och varför.
