import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { chromium } from "playwright";

const serverUrl = "http://127.0.0.1:8000/";
const debuggingPort = 9222;
const debuggingUrl = "http://127.0.0.1:" + debuggingPort + "/json/version";
const profileDir = ".lighthouseci/chrome-profile";

async function waitFor(url, attempts) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("timed out waiting for " + url);
}

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  stdio: "ignore",
});

let browser;
let exitCode = 1;

try {
  await waitFor(serverUrl, 40);

  browser = spawn(
    chromium.executablePath(),
    [
      "--headless=new",
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=" + debuggingPort,
      "--user-data-dir=" + profileDir,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  await waitFor(debuggingUrl, 60);

  exitCode = await new Promise((resolve) => {
    const lhci = spawn(
      process.execPath,
      ["node_modules/@lhci/cli/src/cli.js", "autorun"],
      { stdio: "inherit" },
    );
    lhci.on("exit", (code) => {
      resolve(code ?? 1);
    });
  });
} catch (error) {
  console.error(String(error));
} finally {
  if (browser) {
    browser.kill();
  }
  server.kill("SIGTERM");
  try {
    await rm(profileDir, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 200,
    });
  } catch {
    /* best-effort: the profile dir is ignored by git and reused next run */
  }
}

process.exit(exitCode);
