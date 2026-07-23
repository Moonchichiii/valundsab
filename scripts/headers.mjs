import { readFile } from "node:fs/promises";

export function parseHeadersFile(content) {
  const rules = [];
  let currentRule;

  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const value = rawLine.trim();

    if (!value || value.startsWith("#")) {
      continue;
    }

    if (!/^\s/.test(rawLine)) {
      currentRule = {
        pattern: value,
        headers: new Map(),
      };
      rules.push(currentRule);
      continue;
    }

    if (!currentRule) {
      throw new Error(`Header without path rule on line ${index + 1}`);
    }

    const separator = value.indexOf(":");

    if (separator <= 0) {
      throw new Error(`Invalid header on line ${index + 1}`);
    }

    const name = value.slice(0, separator).trim().toLowerCase();
    const headerValue = value.slice(separator + 1).trim();

    if (!headerValue) {
      throw new Error(`Empty header value on line ${index + 1}`);
    }

    if (currentRule.headers.has(name)) {
      throw new Error(`Duplicate header "${name}" on line ${index + 1}`);
    }

    currentRule.headers.set(name, headerValue);
  }

  if (rules.length === 0) {
    throw new Error("No header rules found");
  }

  return rules;
}

export function headersForPath(rules, pathname) {
  const headers = new Map();

  for (const rule of rules) {
    if (!matchesPath(rule.pattern, pathname)) {
      continue;
    }

    for (const [name, value] of rule.headers) {
      headers.set(name, value);
    }
  }

  return headers;
}

export async function loadHeadersFile(path) {
  return parseHeadersFile(await readFile(path, "utf8"));
}

function matchesPath(pattern, pathname) {
  if (pattern === "/*") {
    return true;
  }

  if (pattern.endsWith("*")) {
    return pathname.startsWith(pattern.slice(0, -1));
  }

  return pathname === pattern;
}
