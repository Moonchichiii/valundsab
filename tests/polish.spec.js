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

  test("the company structure is an editorial two-column list", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/bolaget/");

    const groups = page.locator(".company-structure__group");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toContainText("Moderbolag");
    await expect(groups.nth(1)).toContainText("Portfölj");
    await expect(groups.nth(1)).toContainText("Valunds ServiceBok");
    await expect(groups.nth(1)).toContainText("SkogsKvitto");

    const tops = await page.evaluate(() =>
      [...document.querySelectorAll(".company-structure__group")].map(
        (element) => Math.round(element.getBoundingClientRect().top),
      ),
    );
    expect(tops[0]).toBe(tops[1]);
  });

  test("the cookie launcher clears the content column on wide screens", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kontakt/");
    await page.mouse.wheel(0, 800);
    await expect(page.locator("[data-consent][data-collapsed]")).toHaveCount(1);

    const overlap = await page.evaluate(() => {
      const launcher = document
        .querySelector(".cookie-launcher")
        .getBoundingClientRect();
      return [...document.querySelectorAll("main p, main h1, main h2")].some(
        (element) => {
          const box = element.getBoundingClientRect();
          return (
            box.left < launcher.right &&
            box.right > launcher.left &&
            box.top < launcher.bottom &&
            box.bottom > launcher.top
          );
        },
      );
    });
    expect(overlap, "launchern overlappar brodtext").toBe(false);
  });
});
