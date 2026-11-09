import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductPage from "../../../components/ProductPage";

export const metadata: Metadata = {
  title: "Product",
};

export const dynamic = "force-dynamic";

/** True only when the backend answers that the product does not exist (hidden or unknown). */
async function isMissing(slug: string): Promise<boolean> {
  const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
  try {
    const response = await fetch(
      `${backend}/api/products/${encodeURIComponent(slug)}/`,
      { cache: "no-store" },
    );
    return response.status === 404;
  } catch {
    return false;
  }
}

export default async function ProductRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The real HTTP status of an unknown or hidden product is 404.
  if (await isMissing(slug)) notFound();
  return <ProductPage slug={slug} />;
}
