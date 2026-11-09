import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Helpers that prepare the test database of the running E2E stack
// (compose project setup-monorepo-e2e) through Django management commands.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function manage(...args: string[]): string {
  return execFileSync(
    "docker",
    [
      "compose",
      "-p",
      "setup-monorepo-e2e",
      "-f",
      "docker-compose.yml",
      "-f",
      "docker-compose.e2e.yml",
      "exec",
      "-T",
      "backend",
      "python",
      "manage.py",
      ...args,
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
}

/** Idempotent seed of the 11 standard products; extra args as in seed_e2e. */
export function seed(...args: string[]): void {
  manage("seed_e2e", ...args);
}

/** Delete every product (users stay). */
export function resetCatalog(): void {
  manage("seed_e2e", "--reset");
}

/** Known state: no products, then the 11 standard ones (plus bulk ones). */
export function freshCatalog(
  bulk?: { count: number; gender?: string; volume?: number },
): void {
  resetCatalog();
  const args: string[] = [];
  if (bulk) {
    args.push("--bulk", String(bulk.count), "--gender", bulk.gender ?? "women");
    if (bulk.volume) args.push("--bulk-volume", String(bulk.volume));
  }
  seed(...args);
}

export const hideProduct = (slug: string) => manage("seed_e2e", "--hide", slug);
export const showProduct = (slug: string) => manage("seed_e2e", "--show", slug);
export const deleteProduct = (slug: string) =>
  manage("seed_e2e", "--delete-product", slug);
export const deleteSize = (slug: string, volume: number) =>
  manage("seed_e2e", "--delete-size", `${slug}:${volume}`);
export function setPrice(
  slug: string,
  volume: number,
  regular: string,
  sale?: string,
): void {
  manage(
    "seed_e2e",
    "--set-price",
    `${slug}:${volume}:${regular}${sale ? `:${sale}` : ""}`,
  );
}

/** A random password for a test user; never use fixed credentials. */
export const randomPassword = () => `Pw-${randomBytes(9).toString("hex")}`;
const randomName = (prefix: string) => `${prefix}-${randomBytes(4).toString("hex")}`;

function shell(code: string): void {
  manage("shell", "-c", code);
}

/** Creates a superuser with a random name and password; returns the credentials. */
export function createSuperuser(
  username = randomName("admin"),
  password = randomPassword(),
): { username: string; password: string } {
  shell(
    `from django.contrib.auth import get_user_model as g; ` +
      `g().objects.create_superuser(${JSON.stringify(username)}, None, ${JSON.stringify(password)})`,
  );
  return { username, password };
}

/** Creates a staff (not super) user holding the given permission codenames, e.g. ["view_product"]. */
export function createStaff(
  permissionCodenames: string[],
  username = randomName("staff"),
  password = randomPassword(),
): { username: string; password: string } {
  shell(
    `from django.contrib.auth import get_user_model as g; ` +
      `from django.contrib.auth.models import Permission as P; ` +
      `u = g().objects.create_user(${JSON.stringify(username)}, None, ${JSON.stringify(password)}, is_staff=True); ` +
      `u.user_permissions.set(P.objects.filter(codename__in=${JSON.stringify(permissionCodenames)}))`,
  );
  return { username, password };
}
