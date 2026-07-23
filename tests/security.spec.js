import { expect, test } from "@playwright/test";

const origin = "http://127.0.0.1:8000";

const routes = ["/", "/portfolj/", "/bolaget/", "/engineering/", "/kontakt/"];

const expectedCsp =
  "default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; script-src-elem 'self'; script-src-attr 'none'; style-src 'self'; style-src-elem 'self'; style-src-attr 'none'; img-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; frame-src 'none'; worker-src 'none'; media-src 'none'";

const expectedHeaders = new Map([
  ["content-security-policy", expectedCsp],
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
  [
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  ],
  ["cross-origin-opener-policy", "same-origin"],
  ["cross-origin-resource-policy", "same-origin"],
]);

test.describe("static security baseline", () => {
  for (const route of routes) {
    test(`${route} enforces the approved security policy`, async ({ page }) => {
      const cspViolations = [];
      const thirdPartyRequests = [];
      const failedRequests = [];

      page.on("console", (message) => {
        const text = message.text();

        if (
          /content security policy|refused to (?:load|execute|apply|connect|frame)/i.test(
            text,
          )
        ) {
          cspViolations.push(text);
        }
      });

      page.on("request", (request) => {
        const url = new URL(request.url());

        if (
          (url.protocol === "http:" || url.protocol === "https:") &&
          url.origin !== origin
        ) {
          thirdPartyRequests.push(url.href);
        }
      });

      page.on("requestfailed", (request) => {
        failedRequests.push(
          `${request.url()}: ${request.failure()?.errorText ?? "unknown error"}`,
        );
      });

      const response = await page.goto(route);

      expect(response, `${route} response`).not.toBeNull();
      expect(response.status(), `${route} status`).toBe(200);

      const headers = response.headers();

      for (const [name, expectedValue] of expectedHeaders) {
        expect(headers[name], `${route} ${name}`).toBe(expectedValue);
      }

      await page.evaluate(() => document.fonts.ready);

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("nav")).toHaveCount(1);

      expect(cspViolations, `${route} CSP violations`).toEqual([]);
      expect(thirdPartyRequests, `${route} third-party requests`).toEqual([]);
      expect(failedRequests, `${route} failed requests`).toEqual([]);
    });
  }

  test("_headers is not exposed as a public resource", async ({ request }) => {
    const response = await request.get("/_headers");

    expect(response.status()).toBe(404);

    const headers = response.headers();

    for (const [name, expectedValue] of expectedHeaders) {
      expect(headers[name], `404 ${name}`).toBe(expectedValue);
    }
  });
});

test.describe("JavaScript-disabled operation", () => {
  test.use({ javaScriptEnabled: false });

  for (const route of routes) {
    test(`${route} remains usable without JavaScript`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response, `${route} response`).not.toBeNull();
      expect(response.status(), `${route} status`).toBe(200);

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".site-navigation a")).toHaveCount(4);
    });
  }

  test("primary navigation works without JavaScript", async ({ page }) => {
    const destinations = [
      { name: "Portfölj", path: "/portfolj/" },
      { name: "Bolaget", path: "/bolaget/" },
      { name: "Engineering", path: "/engineering/" },
      { name: "Kontakt", path: "/kontakt/" },
    ];

    for (const destination of destinations) {
      await page.goto("/");

      await page
        .getByRole("link", {
          name: destination.name,
          exact: true,
        })
        .click();

      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(destination.path);

      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
