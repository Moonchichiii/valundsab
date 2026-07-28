// [M2-03] Generates the responsive product image matrix in apps/web/assets/products/.
// Inputs: apps/web/assets/products-src/<name>-desktop*.png (+ optional <name>-mobile*.png).
// Until real mobile screenshots exist, mobile sizes are a deliberate attention crop.
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const SRC = "apps/web/assets/products-src";
const OUT = "apps/web/assets/products";
const DESKTOP = [720, 960, 1280, 1600];
const MOBILE = [360, 540, 720];
const FORMATS = [
  ["avif", { quality: 55 }],
  ["webp", { quality: 78 }],
];

mkdirSync(OUT, { recursive: true });
const sources = readdirSync(SRC).filter((f) => /\.(png|jpg)$/i.test(f));
if (sources.length === 0) {
  console.error("Inga kallbilder i " + SRC);
  process.exit(1);
}

for (const file of sources) {
  const base = file.replace(/\.(png|jpg)$/i, "");
  const isMobile = /-mobile/.test(base);
  const input = path.join(SRC, file);
  const widths = isMobile ? MOBILE : DESKTOP;
  for (const width of widths) {
    for (const [ext, options] of FORMATS) {
      const target = path.join(OUT, `${base}-${width}.${ext}`);
      let image = sharp(input).resize({ width, withoutEnlargement: false });
      await image.toFormat(ext, options).toFile(target);
    }
  }
  if (!isMobile) {
    const mobileBase = base.replace("-desktop", "-mobile");
    const hasRealMobile = sources.some((f) => f.startsWith(mobileBase));
    if (!hasRealMobile) {
      const meta = await sharp(input).metadata();
      const cropWidth = Math.round(meta.width * 0.42);
      const cropHeight = Math.min(meta.height, Math.round((cropWidth * 4) / 3));
      const cropped = await sharp(input)
        .resize({
          width: cropWidth,
          height: cropHeight,
          fit: "cover",
          position: sharp.strategy.attention,
        })
        .png()
        .toBuffer();
      for (const width of MOBILE) {
        for (const [ext, options] of FORMATS) {
          const target = path.join(OUT, `${mobileBase}-${width}.${ext}`);
          await sharp(cropped)
            .resize({
              width,
              height: Math.round((width * 4) / 3),
              fit: "cover",
            })
            .toFormat(ext, options)
            .toFile(target);
        }
      }
    }
  }
}
console.warn("Bildmatris klar i " + OUT);
