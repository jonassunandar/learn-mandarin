import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { vocabulary } from "../lib/vocabulary/data";
async function main() {
  if (vocabulary.length !== 100)
    throw new Error(`Expected 100 words, got ${vocabulary.length}`);
  await fs.mkdir("public/hanzi", { recursive: true });
  await fs.mkdir("public/icons", { recursive: true });
  const chars = [...new Set(vocabulary.flatMap((w) => w.characters))];
  for (const char of chars)
    await fs.copyFile(
      path.join("node_modules/hanzi-writer-data", `${char}.json`),
      path.join("public/hanzi", `${char}.json`),
    );
  await fs.copyFile(
    "node_modules/hanzi-writer-data/ARPHICPL.TXT",
    "public/hanzi/ARPHICPL.TXT",
  );
  for (const [file, size] of [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["maskable-512.png", 512],
    ["apple-touch-icon.png", 180],
  ] as const) {
    const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" rx="105" fill="#284b40"/><path d="M160 142v228M352 142v228M160 256h192" fill="none" stroke="#f7f8f2" stroke-width="35" stroke-linecap="round"/><path d="M222 169h68M222 343h68" stroke="#b5c292" stroke-width="14" stroke-linecap="round"/></svg>`;
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(`public/icons/${file}`);
  }
  await fs.writeFile(
    "public/offline-assets.json",
    JSON.stringify([
      "/",
      "/practice",
      "/words",
      "/progress",
      "/auth",
      "/manifest.webmanifest",
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      ...vocabulary.map((w) => `/words/${w.id}`),
      ...chars.map((c) => `/hanzi/${encodeURIComponent(c)}.json`),
    ]),
  );
  const escape = (s: string) => `'${s.replaceAll("'", "''")}'`;
  const sql =
    "-- Generated from lib/vocabulary/data.ts by npm run assets.\ninsert into public.vocabulary (id,hanzi,pinyin,meaning_en,meaning_id,characters,example_hanzi,example_pinyin,example_meaning_en,example_meaning_id,level,sort_order) values\n" +
    vocabulary
      .map(
        (w) =>
          `(${[w.id, w.hanzi, w.pinyin, w.meaningEn, w.meaningId].map(escape).join(",")},ARRAY[${w.characters.map(escape).join(",")}],${[w.exampleHanzi, w.examplePinyin, w.exampleMeaningEn, w.exampleMeaningId].map((s) => (s ? escape(s) : "NULL")).join(",")},1,${w.order})`,
      )
      .join(",\n") +
    "\non conflict (id) do update set hanzi=excluded.hanzi,pinyin=excluded.pinyin,meaning_en=excluded.meaning_en,meaning_id=excluded.meaning_id,characters=excluded.characters,example_hanzi=excluded.example_hanzi,example_pinyin=excluded.example_pinyin,example_meaning_en=excluded.example_meaning_en,example_meaning_id=excluded.example_meaning_id,sort_order=excluded.sort_order;\n";
  await fs.writeFile("supabase/seed.sql", sql);
  console.log(
    `Prepared ${vocabulary.length} words, ${chars.length} local stroke files, PWA icons, and SQL seed.`,
  );
}
void main();
