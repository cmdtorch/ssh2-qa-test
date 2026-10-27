import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const frontendDir = resolve(import.meta.dirname, "..");

export function runScript(script: string) {
  const result = spawnSync("pnpm", ["run", "--silent", script], {
    cwd: frontendDir,
    encoding: "utf8",
  });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

export function withFixture<T>(
  name: string,
  content: string,
  check: (dir: string) => T,
): T {
  const dir = mkdtempSync(join(frontendDir, "tooling-fixture-"));
  try {
    writeFileSync(join(dir, name), content);
    return check(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
