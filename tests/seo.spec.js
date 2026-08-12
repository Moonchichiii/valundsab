import { expect, test } from "@playwright/test";

const INDEXABLE = [
  "/",
  "/portfolj/",
  "/bolaget/",
  "/engineering/",
  "/kontakt/",
  "/kakor/",
  "/integritet/",
];

const OG_PAGES = ["/", "/portfolj/", "/bolaget/", "/engineering/", "/kontakt/"];

test.describe("SEO release contract", () => {
  test("robots.txt serves the minimal policy with a sitemap reference", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain("Sitemap: https://valundsab.se/sitemap.xml");
  });

  test("sitemap.xml contains exactly the seven indexable URLs", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(locs).toEqual(
      INDEXABLE.map((route) => "https://valundsab.se" + route),
    );
    expect(body).not.toContain("<lastmod");
    expect(body).not.toContain("<priority");
    expect(body).not.toContain("<changefreq");
  });

  test("every indexable page carries a self-referencing canonical", async ({
    page,
  }) => {
    for (const route of INDEXABLE) {
      await page.goto(route);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://valundsab.se" + route,
      );
    }
  });

  test("titles and descriptions are present and unique on indexable pages", async ({
    page,
  }) => {
    const titles = new Set();
    const descriptions = new Set();
    for (const route of INDEXABLE) {
      await page.goto(route);
      const title = await page.title();
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(title.length).toBeGreaterThan(10);
      expect(description.length).toBeGreaterThan(30);
      titles.add(title);
      descriptions.add(description);
    }
    expect(titles.size).toBe(INDEXABLE.length);
    expect(descriptions.size).toBe(INDEXABLE.length);
  });

  test("open graph data mirrors the canonical title and description", async ({
    page,
  }) => {
    for (const route of OG_PAGES) {
      await page.goto(route);
      const title = await page.title();
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        title,
      );
      await expect(
        page.locator('meta[property="og:description"]'),
      ).toHaveAttribute("content", description);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        "https://valundsab.se" + route,
      );
    }
  });

  test("the confirmation page is noindex,follow without a canonical", async ({
    page,
  }) => {
    await page.goto("/kontakt/tack/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test("the organization data block parses with only verified properties", async ({
    page,
  }) => {
    await page.goto("/");
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = JSON.parse(raw);
    expect(Object.keys(data).sort()).toEqual([
      "@context",
      "@type",
      "email",
      "name",
      "url",
    ]);
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toBe("Valunds Digitala Tjänster");
  });

  test("unknown routes answer with a real 404 status", async ({ request }) => {
    const response = await request.get("/finns-inte-alls/");
    expect(response.status()).toBe(404);
  });

  test("the full company name never wraps or overflows the header", async ({
    page,
  }) => {
    for (const width of [1024, 1280, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      const extension = page.locator(".site-header .site-brand__extension");
      await expect(extension).toBeVisible();
      const box = await extension.boundingBox();
      expect(box.height).toBeLessThan(48);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    }
  });

  test("the company name stays intact with fallback fonts and zoom emulation", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 720, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.route("**/*.woff2", (route) => route.abort());
    await page.goto("/");
    const state = await page.evaluate(() => {
      const extension = document.querySelector(
        ".site-header .site-brand__extension",
      );
      const rect = extension.getBoundingClientRect();
      return {
        singleLine: rect.height < 48,
        overflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        visible: getComputedStyle(extension).display !== "none",
      };
    });
    expect(state.overflow).toBe(0);
    if (state.visible) {
      expect(state.singleLine).toBe(true);
    }
    const brand = page.locator(".site-header .site-brand");
    await brand.focus();
    const focusOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(focusOverflow).toBe(0);
    await context.close();
  });
});
