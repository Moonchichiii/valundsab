import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const encodedTerms = [
  "Q2hhdEdQVA==",
  "Q2xhdWRl",
  "T3BlbkFJ",
  "QW50aHJvcGlj",
  "QUktZ2VuZXJhdGVk",
  "R2VuZXJhdGVkIGJ5",
  "R2VuZXJhdGVkIHdpdGg=",
  "QXNzaXN0ZWQgYnk=",
  "Q28tQXV0aG9yZWQtQnk=",
];

const terms = encodedTerms.map((value) =>
  Buffer.from(value, "base64").toString("utf-8"),
);

const textExtensions = new Set([
  ".css",
  ".editorconfig",
  ".gitignore",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".prettierrc",
  ".svg",
  ".toml",
  ".txt",
  ".webmanifest",
  ".xml",
  ".yml",
]);

const skippedDirectories = new Set([
  ".git",
  ".lighthouseci",
  "node_modules",
  "playwright-report",
  "test-results",
]);

const taskWords = ["TO" + "DO", "FIX" + "ME", "HA" + "CK", "TE" + "MP"];
const taskPattern = new RegExp(
  "\\b(" + taskWords.join("|") + ")\\b(?!\\(#\\d+\\))",
);
const consolePattern = new RegExp("console\\." + "log" + "\\s*\\(");
const importantPattern = new RegExp("!" + "impo" + "rtant");
const bannerPattern = /(\/\*|\/\/|<!--)[ \t]*[=*#-]{6,}/;
const deadCodeLinePattern = /^[ \t]*\/\/.*[;{}][ \t]*$/m;
const deadCodeBlockPattern = /\/\*[^*]*[;{}][^*]*\*\//;
const inlineStylePattern = /<[a-z][^>]*\sstyle[ \t]*=/i;
const scriptUrlPattern = new RegExp(
  "(href|src)[ \\t]*=[ \\t]*[\"']java" + "script:",
  "i",
);
const emptyRulePattern = /\{[ \t\r\n]*\}/;

const findings = [];

function report(path, rule) {
  findings.push(path + ": " + rule);
}

function isBinary(buffer) {
  const sample = buffer.subarray(0, 512);
  return sample.includes(0);
}

function scanProvenanceText(path, content) {
  const lower = content.toLowerCase();
  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) {
      report(path, "provenance term in file content");
      return;
    }
  }
}

function scanFilename(path) {
  const lower = path.toLowerCase();
  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) {
      report(path, "provenance term in file name");
      return;
    }
  }
}

function scanCode(path, content, extension) {
  if (bannerPattern.test(content)) {
    report(path, "comment banner");
  }

  if (taskPattern.test(content)) {
    report(path, "task marker without issue reference");
  }

  if (extension === ".js" || extension === ".mjs") {
    if (consolePattern.test(content)) {
      report(path, "console logging");
    }
    if (
      deadCodeLinePattern.test(content) ||
      deadCodeBlockPattern.test(content)
    ) {
      report(path, "commented-out code");
    }
  }

  if (extension === ".css") {
    if (importantPattern.test(content)) {
      report(path, "importance override");
    }
    if (emptyRulePattern.test(content)) {
      report(path, "empty rule");
    }
    if (deadCodeBlockPattern.test(content)) {
      report(path, "commented-out code");
    }
  }

  if (extension === ".html") {
    if (inlineStylePattern.test(content)) {
      report(path, "inline style attribute");
    }
    if (scriptUrlPattern.test(content)) {
      report(path, "script URL");
    }
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const relativePath = relative(process.cwd(), fullPath);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (!skippedDirectories.has(entry)) {
        walk(fullPath);
      }
      continue;
    }

    scanFilename(relativePath);

    const buffer = readFileSync(fullPath);
    if (isBinary(buffer)) {
      continue;
    }

    const extension = extname(entry) || entry;
    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = buffer.toString("utf-8");
    scanProvenanceText(relativePath, content);

    const codeExtensions = [".css", ".html", ".js", ".mjs"];
    if (
      codeExtensions.includes(extension) &&
      relativePath !== join("scripts", "check-source-hygiene.mjs")
    ) {
      scanCode(relativePath, content, extension);
    }
  }
}

function scanCommits(range) {
  const messages = execFileSync("git", ["log", "--format=%B", range], {
    encoding: "utf-8",
  });
  const lower = messages.toLowerCase();
  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) {
      report(range, "provenance term in commit message");
    }
  }
}

const commitsFlag = process.argv.indexOf("--commits");

if (commitsFlag !== -1) {
  const range = process.argv[commitsFlag + 1];
  if (!range) {
    console.error("check-source-hygiene: --commits requires a range");
    process.exit(2);
  }
  scanCommits(range);
} else {
  walk(process.cwd());
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(finding);
  }
  process.exit(1);
}
