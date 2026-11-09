"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { StorageNotice, StoreNotice } from "../lib/store";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/**
 * Wraps every page except the start page ("/") with the shop header, the two
 * store notices (mounted once, here) and the footer. Pages render their own
 * <main> as the child.
 */
export default function ShopChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return <>{children}</>;
  return (
    <>
      <Suspense>
        <SiteHeader />
      </Suspense>
      <StorageNotice />
      <StoreNotice />
      {children}
      <SiteFooter />
    </>
  );
}
