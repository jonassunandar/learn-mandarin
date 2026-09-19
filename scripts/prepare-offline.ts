import fs from "node:fs/promises";
import path from "node:path";
async function files(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? files(path.join(dir, e.name))
          : Promise.resolve([path.join(dir, e.name)]),
      ),
    )
  ).flat();
}
async function main() {
  const assets = JSON.parse(
    await fs.readFile("public/offline-assets.json", "utf8"),
  ) as string[];
  const chunks = (await files(".next/static")).map((f) =>
    encodeURI(f.replace(".next/", "/_next/")),
  );
  await fs.writeFile(
    "public/offline-assets.json",
    JSON.stringify([
      ...new Set([
        ...assets.filter((a) => !a.startsWith("/_next/")),
        ...chunks,
      ]),
    ]),
  );
  const buildId = (await fs.readFile(".next/BUILD_ID", "utf8")).trim();
  const sw = await fs.readFile("public/sw.js", "utf8");
  await fs.writeFile(
    "public/sw.js",
    sw.replace(/const CACHE='[^']+';/, `const CACHE='hanzi100-${buildId}';`),
  );
  console.log(`Offline cache prepared with ${chunks.length} build assets.`);
}
void main();
