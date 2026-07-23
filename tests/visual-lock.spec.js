import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", slug: "home", label: "Startsida" },
  { path: "/portfolj/", slug: "portfolj", label: "Portfölj" },
  { path: "/bolaget/", slug: "bolaget", label: "Bolaget" },
  { path: "/engineering/", slug: "engineering", label: "Engineering" },
  { path: "/kontakt/", slug: "kontakt", label: "Kontakt" },
];

const viewports = [
  { width: 320, height: 900 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
];

const compactBreakpoint = 44 * 16;

test.describe("M1-08 visual lock", () => {
  for (const route of routes) {
    for (const viewport of viewports) {
      test(`${route.label} is stable at ${viewport.width}px`, async ({
        browserName,
        page,
      }, testInfo) => {
        const consoleErrors = [];
        const failedRequests = [];

        page.on("console", (message) => {
          if (message.type() === "error") {
            consoleErrors.push(message.text());
          }
        });

        page.on("requestfailed", (request) => {
          failedRequests.push(
            `${request.url()} — ${request.failure()?.errorText ?? "unknown failure"}`,
          );
        });

        await page.setViewportSize(viewport);

        const response = await page.goto(route.path, {
          waitUntil: "load",
        });

        expect(response?.status(), `${route.path} response`).toBe(200);

        await page.evaluate(() => document.fonts.ready);

        const state = await page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          const heading = document.querySelector("h1");
          const header = document.querySelector(".site-header");
          const navigation = document.querySelector(".site-navigation");
          const wordmark = document.querySelector(".site-brand__wordmark");
          const headingRect = heading?.getBoundingClientRect();
          const wordmarkRect = wordmark?.getBoundingClientRect();

          return {
            documentOverflow: root.scrollWidth > root.clientWidth,
            bodyFont: getComputedStyle(body).fontFamily,
            headingFont: heading ? getComputedStyle(heading).fontFamily : null,
            headingVisible:
              Boolean(headingRect) &&
              headingRect.width > 0 &&
              headingRect.height > 0,
            wordmarkVisible:
              Boolean(wordmarkRect) &&
              wordmarkRect.width > 0 &&
              wordmarkRect.height > 0,
            wordmarkContained:
              Boolean(wordmarkRect) &&
              wordmarkRect.left >= 0 &&
              wordmarkRect.right <= root.clientWidth,
            headerPosition: header ? getComputedStyle(header).position : null,
            navigationPosition: navigation
              ? getComputedStyle(navigation).position
              : null,
            navigationBottom: navigation
              ? Math.round(
                  window.innerHeight -
                    navigation.getBoundingClientRect().bottom,
                )
              : null,
            fontsStatus: document.fonts.status,
          };
        });

        expect(
          state.documentOverflow,
          `${route.path} horizontal overflow at ${viewport.width}px`,
        ).toBe(false);
        expect(state.bodyFont).toContain("Schibsted Grotesk");
        expect(state.headingFont).toContain("Schibsted Grotesk");
        expect(state.headingVisible).toBe(true);
        expect(state.wordmarkVisible).toBe(true);
        expect(state.wordmarkContained).toBe(true);
        expect(state.fontsStatus).toBe("loaded");

        if (viewport.width < compactBreakpoint) {
          expect(state.navigationPosition).toBe("fixed");
          expect(state.navigationBottom).toBe(0);
        } else {
          expect(state.headerPosition).toBe("sticky");
          expect(state.navigationPosition).not.toBe("fixed");
        }

        expect(consoleErrors).toEqual([]);
        expect(failedRequests).toEqual([]);

        const screenshotPath = testInfo.outputPath(
          `${browserName}-${route.slug}-${viewport.width}px.png`,
        );

        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        await testInfo.attach(
          `${browserName}-${route.slug}-${viewport.width}px`,
          {
            path: screenshotPath,
            contentType: "image/png",
          },
        );
      });
    }
  }

  test("reduced motion removes the optional link transition", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const reducedDuration = await page
      .locator(".hero__action")
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration);

    expect(reducedDuration).toBe("0s");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload();

    const standardDuration = await page
      .locator(".hero__action")
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration);

    expect(standardDuration).not.toBe("0s");
  });

  for (const width of [390, 1440]) {
    test(`focus order remains complete at ${width}px`, async ({
      browserName,
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const anchors = page.locator("a[href]");
      const anchorCount = await anchors.count();
      const focusedIndices = [];

      if (browserName === "webkit") {
        testInfo.annotations.push({
          type: "verification",
          description:
            "Playwright WebKit verifies ordered focusability. Real Safari Tab or Option-Tab traversal remains a separate manual check because link traversal depends on Safari and operating-system keyboard settings.",
        });
      }

      for (
        let expectedIndex = 0;
        expectedIndex < anchorCount;
        expectedIndex += 1
      ) {
        if (browserName === "webkit") {
          await anchors.nth(expectedIndex).focus();
        } else {
          await page.keyboard.press("Tab");
        }

        const focusState = await page.evaluate(() => {
          const documentAnchors = [...document.querySelectorAll("a[href]")];
          const active = document.activeElement;
          const index = documentAnchors.indexOf(active);
          const rect = active?.getBoundingClientRect();
          const navigation = document.querySelector(".site-navigation");
          const navigationRect = navigation?.getBoundingClientRect();
          const insideNavigation = Boolean(active?.closest(".site-navigation"));

          return {
            index,
            tagName: active?.tagName ?? null,
            left: rect?.left ?? null,
            right: rect?.right ?? null,
            bottom: rect?.bottom ?? null,
            width: rect?.width ?? null,
            height: rect?.height ?? null,
            navigationTop: navigationRect?.top ?? null,
            insideNavigation,
          };
        });

        expect(focusState.index, `focus index ${expectedIndex}`).toBe(
          expectedIndex,
        );
        expect(focusState.tagName).toBe("A");
        expect(focusState.width).toBeGreaterThan(0);
        expect(focusState.height).toBeGreaterThan(0);
        expect(focusState.left).toBeGreaterThanOrEqual(0);
        expect(focusState.right).toBeLessThanOrEqual(width);

        if (
          width < compactBreakpoint &&
          !focusState.insideNavigation &&
          focusState.navigationTop !== null
        ) {
          expect(
            focusState.bottom,
            `focused link ${expectedIndex} obscured by compact navigation`,
          ).toBeLessThanOrEqual(focusState.navigationTop);
        }

        focusedIndices.push(focusState.index);
      }

      expect(focusedIndices).toEqual(
        Array.from({ length: anchorCount }, (_, index) => index),
      );
    });
  }
});
