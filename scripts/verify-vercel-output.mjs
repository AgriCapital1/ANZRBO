import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const expectedOutput = ".output";
const expectedPublicOutput = ".output/public";
const serverEntry = ".output/server/index.mjs";

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

const manifest = {
  checkedAt: new Date().toISOString(),
  vercelOutputDirectory: expectedOutput,
  publicOutputDirectory: expectedPublicOutput,
  serverEntry,
  publicFiles,
  deployment: {
    environment: process.env.VERCEL_ENV ?? "local",
    url: process.env.VERCEL_URL ?? null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  },
};

writeFileSync(join(expectedPublicOutput, "build-diagnostics.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`[vercel-output-check] OK: ${expectedOutput}, public: ${expectedPublicOutput} (${publicFiles} fichiers), serveur: ${serverEntry}`);