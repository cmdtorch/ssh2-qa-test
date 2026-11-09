import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Product-detail data that the standard seed does not contain. Each helper edits
// the running E2E database through `manage.py shell` (one docker exec).

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function shell(code: string): void {
  execFileSync(
    "docker",
    ["compose", "-p", "setup-monorepo-e2e", "-f", "docker-compose.yml", "-f", "docker-compose.e2e.yml",
      "exec", "-T", "backend", "python", "manage.py", "shell", "-c", code],
    { cwd: repoRoot, encoding: "utf8" },
  );
}

/** Sets fields of a product, e.g. { descriptor_line: "Edp | Floral", top_notes: "..." }. */
export function editProduct(slug: string, fields: Record<string, string | null>): void {
  shell(
    `import json\n` +
      `from catalog.models import Product\n` +
      `Product.objects.filter(slug=${JSON.stringify(slug)}).update(**json.loads(${JSON.stringify(JSON.stringify(fields))}))\n`,
  );
}

/** Replaces the photos of a product by `count` distinct ones (files <slug>-photo-1.png ...). */
export function setPhotoCount(slug: string, count: number): void {
  shell(
    `from catalog.models import Product, ProductPhoto\n` +
      `from catalog.management.commands.seed_e2e import png_file\n` +
      `p = Product.objects.get(slug=${JSON.stringify(slug)})\n` +
      `p.photos.all().delete()\n` +
      `for i in range(${count}):\n` +
      ` ProductPhoto.objects.create(product=p, position=i, image=png_file(f'{p.slug}-photo-{i + 1}.png'))\n`,
  );
}

/** Sets the shared Shipping & handling and Questions texts. */
export function setSharedTexts(texts: { shipping?: string; questions?: string }): void {
  shell(
    `import json\n` +
      `from catalog.models import SharedTexts\n` +
      `t = SharedTexts.load()\n` +
      `for k, v in json.loads(${JSON.stringify(JSON.stringify(texts))}).items():\n` +
      ` setattr(t, k, v)\n` +
      `t.save()\n`,
  );
}
