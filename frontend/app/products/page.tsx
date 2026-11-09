import type { Metadata } from "next";
import { Suspense } from "react";

import CatalogPage from "../../components/CatalogPage";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsRoute() {
  return (
    <Suspense fallback={<main />}>
      <CatalogPage />
    </Suspense>
  );
}
