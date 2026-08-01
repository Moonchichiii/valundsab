import { bundle } from "lightningcss";
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SOURCE = "apps/web";
const OUTPUT = "dist";
const CSS_DIRECTORY = "assets/css";
const ENTRY = "app.css";
const STANDALONE = ["consent-banner.css"];

rmSync(OUTPUT, { recursive: true, force: true });
cpSync(SOURCE, OUTPUT, { recursive: true });

for (const file of readdirSync(join(OUTPUT, CSS_DIRECTORY))) {
  rmSync(join(OUTPUT, CSS_DIRECTORY, file));
}

function compile(name) {
  const { code } = bundle({
    filename: join(SOURCE, CSS_DIRECTORY, name),
    minify: true,
  });
  const target = join(OUTPUT, CSS_DIRECTORY, name);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, code);
  return code.length;
}

const sizes = [ENTRY, ...STANDALONE].map((name) => [name, compile(name)]);

writeFileSync(
  join(OUTPUT, "_routes.json"),
  JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }, null, 2) +
    "\n",
);

for (const [name, size] of sizes) {
  console.warn(`${CSS_DIRECTORY}/${name}: ${size} B`);
}
