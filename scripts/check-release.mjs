import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import {
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

const root = resolve("apps/web");

const allowedExtensions = new Set([
  ".avif",
  ".css",
  ".html",
  ".ico",
  ".js",
  ".json",
  ".mjs",
  ".png",
  ".svg",
  ".txt",
  ".webmanifest",
  ".woff2",
  ".xml",
]);

const budgets = {
  javascriptGzip: 4096,
  cssGzip: 20480,
  initialPageWeight: 153600,
};

const findings = [];

function report(message) {
  findings.push(message);
}

function walk(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function referencesOf(html) {
  const pattern = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  const references = [];
  let match;
  while ((match = pattern.exec(html)) !== null) {
    references.push(match[1]);
  }
  return references;
}

function isExternal(reference) {
  return (
    /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(reference) ||
    /^https?:/i.test(reference)
  );
}

function isNonFile(reference) {
  return /^(?:mailto:|tel:|data:|blob:|#)/i.test(reference);
}

function resolveReference(fromFile, reference) {
  const withoutQuery = reference.split(/[?#]/)[0];
  const base = withoutQuery.startsWith("/")
    ? join(root, withoutQuery.slice(1))
    : join(dirname(fromFile), withoutQuery);
  const target = resolve(base);
  const pathFromRoot = relative(root, target);
  const escapesRoot =
    pathFromRoot === ".." ||
    pathFromRoot.startsWith(".." + sep) ||
    isAbsolute(pathFromRoot);

  if (escapesRoot) {
    return null;
  }

  try {
    const stats = statSync(target);
    if (stats.isDirectory()) {
      const index = join(target, "index.html");
      return statSync(index).isFile() ? index : null;
    }
    return stats.isFile() ? target : null;
  } catch {
    return null;
  }
}

const files = walk(root);
const htmlFiles = files.filter((file) => extname(file) === ".html");

for (const file of files) {
  const relativePath = relative(root, file);
  const extension = extname(file) || file;
  if (!allowedExtensions.has(extension)) {
    report(relativePath + ": file type not allowed in the deployable tree");
  }
}

const rootIndex = join(root, "index.html");
const reachable = new Set();
const queue = [rootIndex];

while (queue.length > 0) {
  const current = queue.pop();
  if (reachable.has(current)) {
    continue;
  }
  reachable.add(current);

  const relativePath = relative(root, current);
  const html = readFileSync(current, "utf-8");

  for (const reference of referencesOf(html)) {
    if (isNonFile(reference)) {
      continue;
    }
    if (isExternal(reference)) {
      report(relativePath + ": external reference " + reference);
      continue;
    }
    const target = resolveReference(current, reference);
    if (!target) {
      report(relativePath + ": unresolved reference " + reference);
      continue;
    }
    if (extname(target) === ".html") {
      queue.push(target);
    }
  }
}

for (const file of htmlFiles) {
  if (!reachable.has(file)) {
    report(relative(root, file) + ": not reachable from the root document");
  }
}

function gzipTotal(extension) {
  return files
    .filter((file) => extname(file) === extension)
    .reduce((total, file) => total + gzipSync(readFileSync(file)).length, 0);
}

const javascriptGzip = gzipTotal(".js") + gzipTotal(".mjs");
if (javascriptGzip > budgets.javascriptGzip) {
  report(
    "JavaScript budget exceeded: " +
      javascriptGzip +
      " > " +
      budgets.javascriptGzip +
      " bytes gzip",
  );
}

const cssGzip = gzipTotal(".css");
if (cssGzip > budgets.cssGzip) {
  report(
    "CSS budget exceeded: " + cssGzip + " > " + budgets.cssGzip + " bytes gzip",
  );
}

function initialWeightOf(documentPath) {
  const html = readFileSync(documentPath, "utf-8");
  let total = statSync(documentPath).size;
  const lazyPattern = /<img[^>]*loading\s*=\s*["']lazy["'][^>]*>/gi;
  const criticalHtml = html.replace(lazyPattern, "");
  for (const reference of referencesOf(criticalHtml)) {
    if (isNonFile(reference) || isExternal(reference)) {
      continue;
    }
    const target = resolveReference(documentPath, reference);
    if (target && extname(target) !== ".html") {
      total += statSync(target).size;
    }
  }
  return total;
}

const initialWeight = initialWeightOf(rootIndex);
if (initialWeight > budgets.initialPageWeight) {
  report(
    "Initial page weight exceeded: " +
      initialWeight +
      " > " +
      budgets.initialPageWeight +
      " bytes",
  );
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(finding);
  }
  process.exit(1);
}
