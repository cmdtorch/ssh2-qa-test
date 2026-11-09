import type { Metadata } from "next";

import BasketPage from "../../components/BasketPage";

export const metadata: Metadata = {
  title: "Basket",
};

export default function BasketRoute() {
  return <BasketPage />;
}
