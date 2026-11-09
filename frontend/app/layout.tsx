import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import ShopChrome from "../components/ShopChrome";
import { StoreProvider } from "../lib/store";

export const metadata: Metadata = {
  title: "App",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <ShopChrome>{children}</ShopChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
