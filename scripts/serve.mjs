import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

import { headersForPath, loadHeadersFile } from "./headers.mjs";

const root = resolve("apps/web");
const port = 8000;
const headerRules = await loadHeadersFile(join(root, "_headers"));

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
  [".ico", "image/x-icon"],
  [".png", "image/png"],
  [".avif", "image/avif"],
  [".webmanifest", "application/manifest+json"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const policyHeaders = Object.fromEntries(
    headersForPath(headerRules, url.pathname),
  );

  if (url.pathname === "/_headers") {
    respond(
      response,
      404,
      "text/plain; charset=utf-8",
      "Not found",
      policyHeaders,
    );
    return;
  }
  const requested = resolve(
    join(root, normalize(decodeURIComponent(url.pathname))),
  );

  if (requested !== root && !requested.startsWith(root + sep)) {
    respond(
      response,
      403,
      "text/plain; charset=utf-8",
      "Forbidden",
      policyHeaders,
    );
    return;
  }

  const filePath = await resolveFile(requested);

  if (!filePath) {
    respond(
      response,
      404,
      "text/plain; charset=utf-8",
      "Not found",
      policyHeaders,
    );
    return;
  }

  const type =
    contentTypes.get(extname(filePath)) ?? "application/octet-stream";
  respond(response, 200, type, await readFile(filePath), policyHeaders);
});

async function resolveFile(candidate) {
  try {
    const stats = await stat(candidate);

    if (stats.isDirectory()) {
      const index = join(candidate, "index.html");
      const indexStats = await stat(index);
      return indexStats.isFile() ? index : null;
    }

    return stats.isFile() ? candidate : null;
  } catch {
    return null;
  }
}

function respond(response, status, type, body, headers = {}) {
  response.writeHead(status, {
    ...headers,
    "content-length": Buffer.byteLength(body),
    "content-type": type,
  });
  response.end(body);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    server.close(() => {
      process.exit(0);
    });
  });
}

server.listen(port, "127.0.0.1");
