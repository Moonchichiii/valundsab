import { expect, test } from "@playwright/test";

const origin = "http://127.0.0.1:8000";

test.describe("font delivery", () => {
  test("loads the local variable font with Swedish glyphs and stable layout", async ({
    page,
  }) => {
    const fontRequests = [];

    await page.addInitScript(() => {
      window.__fontLayoutShift = 0;

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__fontLayoutShift += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    page.on("request", (request) => {
      if (request.resourceType() === "font") {
        fontRequests.push(request.url());
      }
    });

    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const uniqueFontRequests = [...new Set(fontRequests)];

    expect(uniqueFontRequests).toEqual([
      `${origin}/assets/fonts/schibsted-grotesk-latin-wght-normal.woff2`,
    ]);

    const fontState = await page.evaluate(() => ({
      body: document.fonts.check('400 16px "Schibsted Grotesk"', "åäöÅÄÖ"),
      display: document.fonts.check(
        '620 64px "Schibsted Grotesk"',
        "Vi bygger åäö",
      ),
      status: document.fonts.status,
      cls: window.__fontLayoutShift,
    }));

    expect(fontState.body).toBe(true);
    expect(fontState.display).toBe(true);
    expect(fontState.status).toBe("loaded");
    expect(fontState.cls).toBeLessThanOrEqual(0.001);
  });
});
