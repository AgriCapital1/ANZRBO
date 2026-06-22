import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const expectedOutput = ".vercel/output";
const expectedPublicOutput = ".vercel/output/static";
const serverEntry = ".vercel/output/functions/__server.func/index.mjs";
const distFallback = "dist";

function fail(message) {
  console.error(`[vercel-output-check] ${message}`);
  process.exit(1);
}

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    total += stat.isDirectory() ? countFiles(full) : 1;
  }
  return total;
}

if (!existsSync(expectedOutput)) {
  fail(`Dossier Vercel attendu introuvable: ${expectedOutput}`);
}

if (!existsSync(expectedPublicOutput)) {
  fail(`Dossier public attendu introuvable: ${expectedPublicOutput}`);
}

if (!existsSync(serverEntry)) {
  fail(`Entrée serveur attendue introuvable: ${serverEntry}`);
}

const publicFiles = countFiles(expectedPublicOutput);
if (publicFiles === 0) {
  fail(`${expectedPublicOutput} est vide, Vercel refuserait la sortie de build.`);
}

rmSync(distFallback, { recursive: true, force: true });
mkdirSync(distFallback, { recursive: true });
cpSync(expectedPublicOutput, distFallback, { recursive: true });
if (!existsSync(join(distFallback, "index.html"))) {
  writeFileSync(
    join(distFallback, "index.html"),
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ANZRBO</title></head><body><p>ANZRBO — sortie SSR générée dans .vercel/output.</p></body></html>\n`,
  );
}

const manifest = {
  checkedAt: new Date().toISOString(),
  vercelOutputDirectory: expectedOutput,
  publicOutputDirectory: expectedPublicOutput,
  serverEntry,
  distFallback,
  publicFiles,
  deployment: {
    environment: process.env.VERCEL_ENV ?? "local",
    url: process.env.VERCEL_URL ?? null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  },
};

writeFileSync(join(expectedPublicOutput, "build-diagnostics.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`[vercel-output-check] OK: ${expectedOutput}, public: ${expectedPublicOutput} (${publicFiles} fichiers), serveur: ${serverEntry}`);