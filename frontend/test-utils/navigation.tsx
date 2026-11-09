import { useMemo, useSyncExternalStore, type ReactNode } from "react";

/**
 * A tiny in-memory router for jsdom tests: push/replace change the address and
 * re-render everything that reads it, back() returns to the previous address.
 */
let url = "/products";
const past: string[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function go(next: string) {
  url = next;
  listeners.forEach((listener) => listener());
}

export function setUrl(next: string) {
  past.length = 0;
  go(next);
}

export function currentUrl(): URL {
  return new URL(url, "http://localhost");
}

const router = {
  push: (next: string) => {
    past.push(url);
    go(next);
  },
  replace: (next: string) => go(next),
  back: () => {
    const previous = past.pop();
    if (previous !== undefined) go(previous);
  },
};

export const navigationMock = {
  useRouter: () => router,
  usePathname: () =>
    useSyncExternalStore(
      subscribe,
      () => currentUrl().pathname,
      () => currentUrl().pathname,
    ),
  useSearchParams: () => {
    const search = useSyncExternalStore(
      subscribe,
      () => currentUrl().search,
      () => currentUrl().search,
    );
    return useMemo(() => new URLSearchParams(search), [search]);
  },
};

export const linkMock = {
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
  } & Record<string, unknown>) => (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        event.preventDefault();
        router.push(href);
      }}
    >
      {children}
    </a>
  ),
};
