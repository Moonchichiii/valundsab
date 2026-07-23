import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

import { headersForPath, parseHeadersFile } from "./headers.mjs";

const root = resolve("apps/web");
const headersPath = join(root, "_headers");
const findings = [];

function report(message) {
  findings.push(message);
}

const headersContent = readFileSync(headersPath, "utf8");

if (headersContent.startsWith("\uFEFF")) {
  report("_headers: UTF-8 BOM is not allowed");
}

let rules;

try {
  rules = parseHeadersFile(headersContent);
} catch (error) {
  report(`_headers: ${error.message}`);
  rules = [];
}

if (!rules.some((rule) => rule.pattern === "/*")) {
  report("_headers: missing global /* rule");
}

const headers = headersForPath(rules, "/");

const requiredHeaders = new Map([
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

for (const [name, expected] of requiredHeaders) {
  const actual = headers.get(name);

  if (actual !== expected) {
    report(
      `_headers: ${name} must equal "${expected}", received "${actual ?? "missing"}"`,
    );
  }
}

const csp = headers.get("content-security-policy");

if (!csp) {
  report("_headers: Content-Security-Policy is missing");
} else {
  validateCsp(csp);
}

function validateCsp(value) {
  const directives = new Map();

  for (const part of value.split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      continue;
    }

    const [name, ...sources] = tokens;

    if (directives.has(name)) {
      report(`_headers: duplicate CSP directive ${name}`);
      continue;
    }

    directives.set(name, sources);
  }

  const requiredDirectives = new Map([
    ["default-src", ["'none'"]],
    ["base-uri", ["'none'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
    ["object-src", ["'none'"]],
    ["script-src", ["'self'"]],
    ["script-src-elem", ["'self'"]],
    ["script-src-attr", ["'none'"]],
    ["style-src", ["'self'"]],
    ["style-src-elem", ["'self'"]],
    ["style-src-attr", ["'none'"]],
    ["img-src", ["'self'"]],
    ["font-src", ["'self'"]],
    ["connect-src", ["'self'"]],
    ["manifest-src", ["'self'"]],
    ["frame-src", ["'none'"]],
    ["worker-src", ["'none'"]],
    ["media-src", ["'none'"]],
  ]);

  for (const [name, expectedSources] of requiredDirectives) {
    const actualSources = directives.get(name);

    if (!actualSources) {
      report(`_headers: missing CSP directive ${name}`);
      continue;
    }

    if (
      actualSources.length !== expectedSources.length ||
      expectedSources.some((source) => !actualSources.includes(source))
    ) {
      report(
        `_headers: ${name} must equal "${expectedSources.join(" ")}", received "${actualSources.join(" ")}"`,
      );
    }
  }

  for (const name of directives.keys()) {
    if (!requiredDirectives.has(name)) {
      report(`_headers: unexpected CSP directive ${name}`);
    }
  }

  const forbiddenSources = [
    "'unsafe-inline'",
    "'unsafe-eval'",
    "data:",
    "blob:",
    "http:",
    "https:",
    "*",
  ];

  for (const source of forbiddenSources) {
    if (value.includes(source)) {
      report(`_headers: forbidden CSP source ${source}`);
    }
  }
}

function walk(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      walk(path, files);
    } else {
      files.push(path);
    }
  }

  return files;
}

for (const file of walk(root)) {
  const extension = extname(file);
  const relativePath = relative(root, file);

  if (extension === ".html") {
    validateHtml(relativePath, readFileSync(file, "utf8"));
  }

  if (extension === ".css") {
    validateCss(relativePath, readFileSync(file, "utf8"));
  }
}

function validateHtml(path, content) {
  const forbiddenPatterns = [
    [/<style\b/i, "inline style element"],
    [/<script\b(?![^>]*\bsrc\s*=)[^>]*>/i, "inline script element"],
    [/<[^>]+\sstyle\s*=/i, "inline style attribute"],
    [/<[^>]+\son[a-z][a-z0-9:-]*\s*=/i, "inline event handler"],
    [
      /\b(?:src|href|action|formaction|poster)\s*=\s*["'](?:https?:|\/\/|data:|blob:|javascript:)/i,
      "forbidden external or executable URL",
    ],
  ];

  for (const [pattern, rule] of forbiddenPatterns) {
    if (pattern.test(content)) {
      report(`${path}: ${rule}`);
    }
  }
}

function validateCss(path, content) {
  const forbiddenPatterns = [
    [
      /url\(\s*["']?(?:https?:|\/\/|data:|blob:)/i,
      "forbidden external CSS resource",
    ],
    [
      /@import\s+(?:url\()?["']?(?:https?:|\/\/)/i,
      "forbidden external stylesheet import",
    ],
  ];

  for (const [pattern, rule] of forbiddenPatterns) {
    if (pattern.test(content)) {
      report(`${path}: ${rule}`);
    }
  }
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(finding);
  }

  process.exit(1);
}
