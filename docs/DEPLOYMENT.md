# Deployment

## Model

```
Pull request  →  isolated Cloudflare Pages preview
main (merge)  →  automatic production deployment
Rollback      →  instant restore from Pages deployment history
```

The deployable directory is `apps/web`, served exactly as committed. See
`docs/decisions/0005-hosting-platform.md`.

## Provider settings (Cloudflare dashboard)

Pages project connected to this repository:

```
Framework preset     None
Production branch    main
Root directory       apps/web
Build command        (blank)
Output directory     .
Preview deployments  All non-main branches
```

No other provider settings are changed. No custom cache rules on top of
Pages defaults.

## Repository protection (GitHub settings)

```
Protect main
Required checks      source, release, browser, accessibility, performance
Direct pushes        disabled
Force pushes         disabled
Merge method         squash only (merge commits and rebase merge disabled)
```

If a required check is renamed or removed in a later issue, branch
protection is updated in that same issue — protection never silently
weakens.

## Rollback

1. Open the Pages project → Deployments.
2. Identify the last good production deployment (green, verified).
3. Choose "Rollback to this deployment".
4. Verify the production address serves the restored content.

The procedure is executed once during M0-05 to prove it works; the date
and deployment IDs of that verification are recorded in the pull
request.

## Domain migration (executed in M5, not before)

DNS at one.com is untouched until this issue runs.

1. Document every DNS record at one.com: MX, SPF, DKIM, DMARC, CAA, and
   all subdomains.
2. Add the `valundsab.se` zone to Cloudflare.
3. Compare and complete the imported records against step 1.
4. Verify the email records explicitly.
5. Disable DNSSEC at one.com.
6. Switch to the two nameservers Cloudflare assigns.
7. Activate `valundsab.se` on the Pages project.
8. Add `www.valundsab.se`.
9. Redirect `www` → apex with 301; canonical address is
   `https://valundsab.se`.
10. Re-enable DNSSEC through Cloudflare once everything resolves.
