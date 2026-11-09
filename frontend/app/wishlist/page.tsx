import type { Metadata } from "next";

import WishlistPage from "../../components/WishlistPage";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function WishlistRoute() {
  return <WishlistPage />;
}
