import { expect, test } from "@playwright/test";

const products = [
  { scene: "servicebok", base: "/assets/products/servicebok" },
  { scene: "skogskvitto", base: "/assets/products/skogskvitto" },
];

test.describe("M2-03 visual polish", () => {
  test("product views are local, responsive, lazy and dimensioned", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    const images = page.locator(".product-preview .product-visual__frame");
    await expect(images).toHaveCount(products.length);

    for (const [index, product] of products.entries()) {
      const image = images.nth(index);
      await expect(image).toHaveAttribute("loading", "lazy");
      await expect(image).toHaveAttribute("decoding", "async");
      await expect(image).toHaveAttribute("width", "1600");
      await expect(image).toHaveAttribute("height", "1000");
      await expect(image).toHaveAttribute("alt", /Anonymiserad produktvy/);

      const source = await image.getAttribute("src");
      expect(source.startsWith(product.base)).toBe(true);
      const response = await request.get(source);
      expect(response.ok(), source).toBe(true);
      expect(response.headers()["content-type"]).toContain("image/webp");
    }
  });

  test("every product source offers avif and webp for both layouts", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    for (const product of products) {
      const picture = page.locator(
        `.product-preview[data-scene="${product.scene}"] picture`,
      );
      await expect(picture).toHaveCount(1);

      for (const type of ["image/avif", "image/webp"]) {
        await expect(
          picture.locator(
            `source[type="${type}"][media="(max-width: 43.99rem)"]`,
          ),
          `${product.scene} mobil ${type}`,
        ).toHaveCount(1);
        await expect(
          picture.locator(`source[type="${type}"]:not([media])`),
          `${product.scene} desktop ${type}`,
        ).toHaveCount(1);
      }

      const desktop = picture.locator('source[type="image/avif"]:not([media])');
      const srcset = await desktop.getAttribute("srcset");
      expect(srcset).toContain("1600w");
      await expect(desktop).toHaveAttribute("sizes", /min-width/);

      const first = srcset.split(",")[0].trim().split(" ")[0];
      const response = await request.get(first);
      expect(response.ok(), first).toBe(true);
      expect(response.headers()["content-type"]).toContain("image/avif");
    }
  });

  test("product scenes carry their own surface without third-party requests", async ({
    page,
  }) => {
    const external = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:8000")) {
        external.push(request.url());
      }
    });

    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    const surfaces = await page.evaluate(() =>
      [...document.querySelectorAll(".product-preview[data-scene]")].map(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    );
    expect(surfaces).toHaveLength(2);
    expect(new Set(surfaces).size).toBe(2);
    for (const surface of surfaces) {
      expect(surface).not.toBe("rgba(0, 0, 0, 0)");
    }
    expect(external).toEqual([]);
  });

  test("mobile footer keeps legal links and drops navigation duplicates", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");

    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Kakor" })).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Integritet" }),
    ).toBeVisible();
    await expect(footer.getByRole("link", { name: "Portfölj" })).toBeHidden();

    const navigation = page.getByRole("navigation", {
      name: "Huvudnavigation",
    });
    await expect(
      navigation.getByRole("link", { name: "Portfölj" }),
    ).toBeVisible();
  });

  test("contact page offers a native contact form", async ({ page }) => {
    await page.goto("/kontakt/");

    const form = page.locator("form.contact-form");
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute("method", "post");
    await expect(form).toHaveAttribute("action", "/api/contact");

    for (const label of ["Namn", "E-post", "Ärende", "Meddelande"]) {
      await expect(form.getByLabel(label, { exact: false })).toBeVisible();
    }
    await expect(form.locator("#contact-company")).toBeVisible();
    await expect(form.getByRole("button", { name: /Skicka/ })).toBeVisible();

    for (const field of ["name", "email", "subject", "message"]) {
      await expect(form.locator(`[name="${field}"]`), field).toHaveAttribute(
        "required",
        "",
      );
    }

    const trap = form.locator('[name="website"]');
    await expect(trap).toHaveCount(1);
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(trap).toHaveAttribute("autocomplete", "off");
    await expect(form.locator(".contact-form__trap")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(trap).toBeHidden();
  });

  test("the contact form is usable without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:8000/kontakt/");

    await expect(page.locator("form.contact-form")).toBeVisible();
    await expect(
      page.locator("form.contact-form button[type='submit']"),
    ).toBeVisible();
    await page.close();
    await context.close();
  });

  test("the confirmation view exists for the post redirect", async ({
    page,
  }) => {
    const response = await page.goto("/kontakt/tack/");
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Tack");
  });

  test("bolaget reads as editorial chapters with a working principle ledger", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/bolaget/");

    const chapters = page.locator(".section-split");
    await expect(chapters).toHaveCount(3);
    await expect(chapters.nth(0)).toContainText("Moderbolag");
    await expect(chapters.nth(0)).toContainText(
      "Vi bygger för att driva vidare.",
    );
    await expect(chapters.nth(0)).toContainText(
      "Utvecklar · Äger · Driver · Förvaltar",
    );

    const holdings = page.locator(".holding-list > li");
    await expect(holdings).toHaveCount(3);
    await expect(holdings.nth(0)).toContainText("Valunds Digitala Tjänster");
    await expect(holdings.nth(0)).toContainText("Moderbolag");
    await expect(holdings.nth(1)).toContainText(
      "Digital servicehistorik för fordon",
    );

    const geometry = await page.evaluate(() =>
      [...document.querySelectorAll(".section-split")].map((chapter) => {
        const head = chapter
          .querySelector(".section-split__head")
          .getBoundingClientRect();
        const body = chapter
          .querySelector(".section-split__body")
          .getBoundingClientRect();
        return {
          topDelta: Math.abs(Math.round(head.top - body.top)),
          headLeads: head.left < body.left,
        };
      }),
    );
    for (const [index, chapter] of geometry.entries()) {
      expect(
        chapter.topDelta,
        `kapitel ${index} topplinje`,
      ).toBeLessThanOrEqual(1);
      expect(chapter.headLeads, `kapitel ${index} rubrikspalt`).toBe(true);
    }

    const culm = await page
      .locator('[aria-labelledby="structure-title"]')
      .evaluate((element) => getComputedStyle(element).borderBlockStartStyle);
    expect(culm).toBe("double");
  });

  test("principle ledgers never stack words in the number track", async ({
    page,
  }) => {
    for (const route of ["/", "/bolaget/"]) {
      for (const width of [1024, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const rows = await page.evaluate(() =>
          [...document.querySelectorAll(".principle-ledger > li")].map(
            (item) => {
              const box = item.getBoundingClientRect();
              const title = item.querySelector("b").getBoundingClientRect();
              const paragraph = item.querySelector("p");
              const copy = paragraph.getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(paragraph);
              const lineWidths = [...range.getClientRects()]
                .filter((rect) => rect.width > 0 && rect.height > 0)
                .map((rect) => Math.round(rect.width));
              return {
                height: Math.round(box.height),
                copyLeft: Math.round(copy.left - box.left),
                sameLine: copy.top < title.bottom,
                minLine:
                  lineWidths.length > 1
                    ? Math.min(...lineWidths.slice(0, -1))
                    : Infinity,
                wide: item.parentElement.classList.contains(
                  "principle-ledger--wide",
                ),
              };
            },
          ),
        );
        expect(rows.length).toBeGreaterThanOrEqual(4);
        for (const [index, row] of rows.entries()) {
          expect(
            row.height,
            `${route} ${width} rad ${index} höjd`,
          ).toBeLessThanOrEqual(row.wide ? 120 : 176);
          expect(
            row.minLine,
            `${route} ${width} rad ${index} radbredd`,
          ).toBeGreaterThanOrEqual(90);
          expect(
            row.copyLeft,
            `${route} ${width} rad ${index} spår`,
          ).toBeGreaterThanOrEqual(40);
          if (row.wide) {
            expect(
              row.sameLine,
              `${route} ${width} rad ${index} baslinje`,
            ).toBe(true);
          }
        }
      }
    }
  });

  test("the engineering manifest is measurably readable", async ({ page }) => {
    await page.goto("/engineering/");
    const ratio = await page.evaluate(() => {
      const quote = document.querySelector(
        ".engineering-statement .statement--quote",
      );
      const surface = quote.closest(".engineering-statement");
      const luminance = (value) => {
        const parts = value
          .match(/\d+/g)
          .map(Number)
          .map((channel) => {
            const c = channel / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
        return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
      };
      const text = luminance(getComputedStyle(quote).color);
      const background = luminance(getComputedStyle(surface).backgroundColor);
      return (
        (Math.max(text, background) + 0.05) /
        (Math.min(text, background) + 0.05)
      );
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test("the bottom nav reveals a way home after scrolling", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/bolaget/");
    await page.evaluate(() => document.fonts.ready);

    const home = page.locator(".site-navigation__home a");
    await expect(home).toHaveAttribute("href", "/");

    const atTop = await home.evaluate((link) => {
      const style = getComputedStyle(link.parentElement);
      return {
        opacity: Number(style.opacity),
        animated: style.animationName !== "none",
      };
    });
    if (atTop.animated) {
      expect(atTop.opacity).toBeLessThan(0.05);
    }

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect
      .poll(async () =>
        home.evaluate((link) =>
          Number(getComputedStyle(link.parentElement).opacity),
        ),
      )
      .toBe(1);

    const box = await home.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);

    await home.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("portfolio product visuals carry equal weight", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/portfolj/");
    const areas = await page.evaluate(() =>
      [...document.querySelectorAll(".product-case__visual img")].map(
        (image) => {
          const box = image.getBoundingClientRect();
          return box.width * box.height;
        },
      ),
    );
    expect(areas).toHaveLength(2);
    const spread = Math.abs(areas[0] - areas[1]) / Math.max(...areas);
    expect(spread).toBeLessThanOrEqual(0.15);
  });

  test("the cookie launcher stays clear of content, forms and the panel", async ({
    page,
  }) => {
    const routes = ["/kontakt/", "/portfolj/"];
    const widths = [640, 1024, 1280, 1440, 1920];
    const desktopSelector = [
      "main p",
      "main h1",
      "main h2",
      "main h3",
      "main a",
      "main label",
      'main input:not([type="hidden"])',
      "main select",
      "main textarea",
      "main button",
      "main img",
      "main figure",
      "footer p",
      "footer a",
      "footer .label",
    ].join(", ");
    const compactSelector =
      "footer p, footer a, footer .label, .site-navigation";

    for (const route of routes) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);

        for (const position of ["top", "middle", "bottom"]) {
          await page.evaluate((where) => {
            const max =
              document.documentElement.scrollHeight - window.innerHeight;
            const target =
              where === "top" ? 0 : where === "middle" ? max / 2 : max;
            window.scrollTo(0, target);
          }, position);
          await page.waitForTimeout(120);

          const hits = await page.evaluate(
            (selector) => {
              const zone = document
                .querySelector(".cookie-launcher")
                .getBoundingClientRect();
              const found = [];
              for (const element of document.querySelectorAll(selector)) {
                const rects = [...element.getClientRects()].filter(
                  (rect) => rect.width > 0 && rect.height > 0,
                );
                const overlap = rects.some(
                  (rect) =>
                    rect.left < zone.right &&
                    rect.right > zone.left &&
                    rect.top < zone.bottom &&
                    rect.bottom > zone.top,
                );
                if (overlap) {
                  found.push(`${element.tagName}.${element.className}`);
                }
              }
              return found;
            },
            width >= 1024 ? desktopSelector : compactSelector,
          );

          expect(hits, `${route} ${width}px ${position}`).toEqual([]);
        }

        if (width >= 1024) {
          await expect(
            page.locator("[data-consent][data-collapsed]"),
          ).toHaveCount(1);
        }

        await page.locator(".cookie-launcher").click();
        await expect(page.locator(".consent-settings")).toBeVisible();
        const separated = await page.evaluate(() => {
          const zone = document
            .querySelector(".cookie-launcher")
            .getBoundingClientRect();
          const panel = document
            .querySelector(".consent-settings")
            .getBoundingClientRect();
          return (
            panel.left >= zone.right ||
            panel.right <= zone.left ||
            panel.top >= zone.bottom ||
            panel.bottom <= zone.top
          );
        });
        expect(separated, `${route} ${width}px panelseparation`).toBe(true);
        await page.locator(".consent-settings__close").click();
        await expect(page.locator(".consent-settings")).toBeHidden();
      }
    }
  });
});
