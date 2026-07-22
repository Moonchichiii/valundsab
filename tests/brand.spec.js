import { expect, test } from "@playwright/test";

const routes = ["/", "/portfolj/", "/bolaget/", "/engineering/", "/kontakt/"];
const widths = [320, 360, 390, 430, 768, 1440];

const assets = [
  ["/assets/brand/valunds-wordmark.svg", "image/svg+xml"],
  ["/favicon.svg", "image/svg+xml"],
  ["/favicon.ico", "image/x-icon"],
  ["/apple-touch-icon.png", "image/png"],
];

test.describe("production brand system", () => {
  for (const route of routes) {
    test(`${route} exposes the production wordmark and icons`, async ({
      page,
    }) => {
      await page.goto(route);

      const brand = page.locator(".site-brand");
      const wordmark = brand.locator(".site-brand__wordmark");

      await expect(brand).toHaveAttribute("href", "/");
      await expect(brand).toHaveAttribute("aria-label", "Valunds startsida");
      await expect(wordmark).toHaveCount(1);
      await expect(wordmark).toHaveAttribute(
        "src",
        "/assets/brand/valunds-wordmark.svg",
      );
      await expect(wordmark).toHaveAttribute("alt", "Valunds");
      await expect(wordmark).toHaveAttribute("width", "207");
      await expect(wordmark).toHaveAttribute("height", "50");

      await expect(
        page.locator('link[rel="icon"][type="image/svg+xml"]'),
      ).toHaveAttribute("href", "/favicon.svg");
      await expect(page.locator('link[rel="icon"][sizes="any"]')).toHaveAttribute(
        "href",
        "/favicon.ico",
      );
      await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
        "href",
        "/apple-touch-icon.png",
      );
      await expect(page.locator("body svg")).toHaveCount(0);
    });
  }

  test("brand assets are served with the correct media types", async ({
    request,
  }) => {
    for (const [path, mediaType] of assets) {
      const response = await request.get(path);

      expect(response.ok(), path).toBe(true);
      expect(response.headers()["content-type"], path).toContain(mediaType);
    }
  });

  test("wordmark remains contained at every measured width", async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.locator(".site-brand__wordmark").evaluate((image) =>
        image.decode(),
      );

      const layout = await page.evaluate(() => {
        const header = document.querySelector(".site-header");
        const brand = document.querySelector(".site-brand");
        const wordmark = document.querySelector(".site-brand__wordmark");
        const headerRect = header.getBoundingClientRect();
        const brandRect = brand.getBoundingClientRect();
        const wordmarkRect = wordmark.getBoundingClientRect();

        return {
          documentOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          headerHeight: Math.round(headerRect.height),
          brandLeft: brandRect.left,
          brandRight: brandRect.right,
          wordmarkWidth: wordmarkRect.width,
          wordmarkHeight: wordmarkRect.height,
          naturalWidth: wordmark.naturalWidth,
          naturalHeight: wordmark.naturalHeight,
        };
      });

      expect(layout.documentOverflow, `${width}px document overflow`).toBe(
        false,
      );
      expect(layout.brandLeft, `${width}px left boundary`).toBeGreaterThanOrEqual(
        0,
      );
      expect(layout.brandRight, `${width}px right boundary`).toBeLessThanOrEqual(
        width,
      );
      expect(layout.wordmarkWidth, `${width}px rendered width`).toBeGreaterThan(0);
      expect(layout.wordmarkHeight, `${width}px rendered height`).toBeGreaterThan(
        0,
      );
      expect(layout.naturalWidth, `${width}px natural width`).toBeGreaterThan(0);
      expect(layout.naturalHeight, `${width}px natural height`).toBeGreaterThan(0);

      if (width >= 704) {
        expect(layout.headerHeight, `${width}px header height`).toBe(72);
      }
    }
  });

  test("wordmark loading does not introduce layout shift", async ({ page }) => {
    await page.addInitScript(() => {
      window.__brandLayoutShift = 0;

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__brandLayoutShift += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto("/");
    await page.locator(".site-brand__wordmark").evaluate((image) =>
      image.decode(),
    );

    const layoutShift = await page.evaluate(() => window.__brandLayoutShift);

    expect(layoutShift).toBeLessThanOrEqual(0.001);
  });
});
