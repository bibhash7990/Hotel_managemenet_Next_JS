/**
 * Run Husky locally; skip on CI/Vercel where devDependencies (husky) are often absent.
 */
if (process.env.VERCEL || process.env.CI === "true" || process.env.CI === "1") {
  process.exit(0);
}

const { spawnSync } = require("node:child_process");
const result = spawnSync("husky", { stdio: "inherit", shell: true });
if (result.error?.code === "ENOENT") {
  process.exit(0);
}
process.exit(result.status ?? 1);
