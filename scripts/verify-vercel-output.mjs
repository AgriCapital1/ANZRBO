import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const expectedOutput = ".vercel/output";
const publicOutputCandidates = [".vercel/output/static", ".output/public", "dist/client"];
const serverEntryCandidates = [".vercel/output/functions/__server.func/index.mjs", ".output/server/index.mjs"];
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

const publicOutput = publicOutputCandidates.find((dir) => existsSync(dir));
if (!publicOutput) {
  fail(`Aucune sortie publique trouvée (${publicOutputCandidates.join(", ")}).`);
}

const serverEntry = serverEntryCandidates.find((file) => existsSync(file)) ?? null;

const publicFiles = countFiles(publicOutput);
if (publicFiles === 0) {
  fail(`${publicOutput} est vide, la publication refuserait la sortie de build.`);
}

if (publicOutput !== distFallback) {
  rmSync(distFallback, { recursive: true, force: true });
  mkdirSync(distFallback, { recursive: true });
  cpSync(publicOutput, distFallback, { recursive: true });
}
if (!existsSync(join(distFallback, "index.html"))) {
  fail(`${distFallback}/index.html est introuvable : la sortie publique ne doit pas être remplacée par une page factice.`);
}

const manifest = {
  checkedAt: new Date().toISOString(),
  vercelOutputDirectory: existsSync(expectedOutput) ? expectedOutput : null,
  publicOutputDirectory: publicOutput,
  serverEntry,
  distFallback,
  publicFiles,
  deployment: {
    environment: process.env.VERCEL_ENV ?? "local",
    url: process.env.VERCEL_URL ?? null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  },
};

writeFileSync(join(distFallback, "build-diagnostics.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`[dist-check] OK: dist prêt, public: ${publicOutput} (${publicFiles} fichiers), serveur: ${serverEntry ?? "non vérifié"}`);