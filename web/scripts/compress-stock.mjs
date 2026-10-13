// Recompresse les images stock existantes (max 1600px, JPEG q78) et met à jour le manifest.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MANIFEST = path.resolve("src/lib/stock-manifest.json");
const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));

for (const files of Object.values(manifest)) {
  for (const f of files) {
    const file = path.resolve("public" + f.src);
    const input = await fs.readFile(file);
    const { data, info } = await sharp(input)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    if (data.length < input.length) await fs.writeFile(file, data);
    f.w = info.width;
    f.h = info.height;
  }
}
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log("ok");
