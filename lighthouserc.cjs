const { chromium } = require("playwright");

process.env.CHROME_PATH = process.env.CHROME_PATH || chromium.executablePath();

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "bun scripts/serve.mjs",
      url: ["http://127.0.0.1:8000/"],
      settings: {
        chromeFlags:
          "--headless=new --no-sandbox --user-data-dir=.lighthouseci/chrome-profile",
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
        "categories:performance": ["error", { minScore: 0.98 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.02 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 1500 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 4096 }],
        "resource-summary:stylesheet:size": [
          "error",
          { maxNumericValue: 20480 },
        ],
        "resource-summary:total:size": ["error", { maxNumericValue: 153600 }],
        "resource-summary:third-party:count": ["error", { maxNumericValue: 0 }],
        "errors-in-console": ["error", { minScore: 1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
