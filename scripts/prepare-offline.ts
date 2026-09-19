import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

async function files(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(path.join(dir, entry.name))
          : Promise.resolve([path.join(dir, entry.name)]),
      ),
    )
  ).flat();
}

// Run inside Next's compile lifecycle, before Vercel snapshots public assets.
// npm postbuild runs too late for Vercel's Next.js adapter.
export async function prepareOffline({
  distDir,
  projectDir,
}: {
  distDir: string;
  projectDir: string;
}) {
  const publicDir = path.join(projectDir, "public");
  const assets = JSON.parse(
    await fs.readFile(path.join(publicDir, "offline-assets.json"), "utf8"),
  ) as string[];
  const chunks = (await files(path.join(distDir, "static")))
    .map((file) =>
      encodeURI(
        `/_next/${path.relative(distDir, file).split(path.sep).join("/")}`,
      ),
    )
    .sort();
  await fs.writeFile(
    path.join(publicDir, "offline-assets.json"),
    JSON.stringify([
      ...new Set([
        ...assets.filter((asset) => !asset.startsWith("/_next/")),
        ...chunks,
      ]),
    ]),
  );
  const version = createHash("sha256")
    .update(chunks.join("\n"))
    .digest("hex")
    .slice(0, 20);
  const workerPath = path.join(publicDir, "sw.js");
  const worker = await fs.readFile(workerPath, "utf8");
  await fs.writeFile(
    workerPath,
    worker.replace(
      /const CACHE\s*=\s*["'][^"']+["'];/,
      `const CACHE='hanzi100-${version}';`,
    ),
  );
  console.log(
    `Offline cache prepared with ${chunks.length} build assets before deployment packaging.`,
  );
}
