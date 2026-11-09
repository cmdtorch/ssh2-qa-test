"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import styles from "./store.module.css";
import { checkAvailability, type AvailabilityResult } from "./api";

export const BASKET_KEY = "lunisse.basket";
export const WISHLIST_KEY = "lunisse.wishlist";
export const MAX_QUANTITY = 10;

export const STORAGE_MESSAGE =
  "Your choices will not be saved after you close this page";
export const REMOVED_MESSAGE =
  "Some products are no longer available and were removed";

export type BasketLine = { slug: string; volume: number; quantity: number };

type Data = { basket: BasketLine[]; wishlist: string[] };

type Flags = {
  ready: boolean;
  storageBlocked: boolean;
  limitReached: boolean;
  removedNotice: boolean;
};

export type Store = Data &
  Flags & {
    totalUnits: number;
    addToBasket: (slug: string, volume: number, quantity: number) => void;
    setQuantity: (slug: string, volume: number, quantity: number) => void;
    removeLine: (slug: string, volume: number) => void;
    toggleWishlist: (slug: string) => void;
    isInWishlist: (slug: string) => boolean;
    /** Hides the limit message; call it when the visitor does something else. */
    dismissLimit: () => void;
    /** Checks the stored items against the backend; pages call it through useAvailabilityCheck. */
    /** Answers with the availability results, or null when the check failed. */
    checkOnOpen: () => Promise<AvailabilityResult[] | null>;
  };

const StoreContext = createContext<Store | null>(null);

function isLine(value: unknown): value is BasketLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.slug === "string" &&
    line.slug !== "" &&
    typeof line.volume === "number" &&
    Number.isInteger(line.volume) &&
    line.volume > 0 &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity >= 1 &&
    line.quantity <= MAX_QUANTITY
  );
}

function parseBasket(raw: string | null): BasketLine[] {
  const lines: BasketLine[] = [];
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    for (const value of parsed) {
      if (
        isLine(value) &&
        !lines.some((l) => l.slug === value.slug && l.volume === value.volume)
      ) {
        lines.push({
          slug: value.slug,
          volume: value.volume,
          quantity: value.quantity,
        });
      }
    }
  } catch {
    return [];
  }
  return lines;
}

function parseWishlist(raw: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const slugs: string[] = [];
    for (const value of parsed) {
      if (typeof value === "string" && value !== "" && !slugs.includes(value)) {
        slugs.push(value);
      }
    }
    return slugs;
  } catch {
    return [];
  }
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ basket: [], wishlist: [] });
  const [flags, setFlags] = useState<Omit<Flags, "ready">>({
    storageBlocked: false,
    limitReached: false,
    removedNotice: false,
  });
  const [ready, setReady] = useState(false);
  const dataRef = useRef<Data>(data);

  const commit = useCallback(
    (next: Data, changes: Partial<typeof flags> = {}) => {
      const previous = dataRef.current;
      dataRef.current = next;
      setData(next);
      let blocked = false;
      try {
        if (next.basket !== previous.basket) {
          window.localStorage.setItem(BASKET_KEY, JSON.stringify(next.basket));
        }
        if (next.wishlist !== previous.wishlist) {
          window.localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(next.wishlist),
          );
        }
      } catch {
        blocked = true;
      }
      setFlags((f) => ({
        ...f,
        limitReached: false,
        ...changes,
        storageBlocked: f.storageBlocked || blocked,
      }));
    },
    [],
  );

  useEffect(() => {
    const load = () => {
      const loaded = {
        basket: parseBasket(readStorage(BASKET_KEY)),
        wishlist: parseWishlist(readStorage(WISHLIST_KEY)),
      };
      dataRef.current = loaded;
      setData(loaded);
    };
    // Storage is read after mount so the server and first client render agree.
    load();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    const onStorage = () => load();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToBasket = useCallback(
    (slug: string, volume: number, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1) return;
      const { basket, wishlist } = dataRef.current;
      const existing = basket.find(
        (l) => l.slug === slug && l.volume === volume,
      );
      const sum = (existing?.quantity ?? 0) + quantity;
      const quantityNow = Math.min(sum, MAX_QUANTITY);
      const next = existing
        ? basket.map((l) =>
            l === existing ? { ...l, quantity: quantityNow } : l,
          )
        : [...basket, { slug, volume, quantity: quantityNow }];
      commit({ basket: next, wishlist }, { limitReached: sum > MAX_QUANTITY });
    },
    [commit],
  );

  const setQuantity = useCallback(
    (slug: string, volume: number, quantity: number) => {
      const { basket, wishlist } = dataRef.current;
      const value = clampQuantity(quantity);
      commit({
        basket: basket.map((l) =>
          l.slug === slug && l.volume === volume
            ? { ...l, quantity: value }
            : l,
        ),
        wishlist,
      });
    },
    [commit],
  );

  const removeLine = useCallback(
    (slug: string, volume: number) => {
      const { basket, wishlist } = dataRef.current;
      commit({
        basket: basket.filter((l) => !(l.slug === slug && l.volume === volume)),
        wishlist,
      });
    },
    [commit],
  );

  const toggleWishlist = useCallback(
    (slug: string) => {
      const { basket, wishlist } = dataRef.current;
      commit({
        basket,
        wishlist: wishlist.includes(slug)
          ? wishlist.filter((s) => s !== slug)
          : [...wishlist, slug],
      });
    },
    [commit],
  );

  const dismissLimit = useCallback(
    () => setFlags((f) => (f.limitReached ? { ...f, limitReached: false } : f)),
    [],
  );

  const checkOnOpen = useCallback(async () => {
    setFlags((f) => (f.removedNotice ? { ...f, removedNotice: false } : f));
    const { basket, wishlist } = dataRef.current;
    const items = [...basket.map((l) => `${l.slug}:${l.volume}`), ...wishlist];
    if (items.length === 0) return [];

    let results;
    try {
      results = await checkAvailability(items);
    } catch {
      return null;
    }
    const gone = new Set(
      results.filter((r) => !r.available).map((r) => r.item),
    );
    if (gone.size === 0) return results;

    const current = dataRef.current;
    const basketNow = current.basket.filter(
      (l) => !gone.has(`${l.slug}:${l.volume}`),
    );
    const wishlistNow = current.wishlist.filter((s) => !gone.has(s));
    const removed =
      basketNow.length !== current.basket.length ||
      wishlistNow.length !== current.wishlist.length;
    if (!removed) return results;
    commit(
      {
        basket:
          basketNow.length !== current.basket.length
            ? basketNow
            : current.basket,
        wishlist:
          wishlistNow.length !== current.wishlist.length
            ? wishlistNow
            : current.wishlist,
      },
      { removedNotice: true },
    );
    return results;
  }, [commit]);

  const value = useMemo<Store>(
    () => ({
      ...data,
      ...flags,
      ready,
      totalUnits: data.basket.reduce((sum, l) => sum + l.quantity, 0),
      addToBasket,
      setQuantity,
      removeLine,
      toggleWishlist,
      isInWishlist: (slug: string) => data.wishlist.includes(slug),
      dismissLimit,
      checkOnOpen,
    }),
    [
      data,
      flags,
      ready,
      addToBasket,
      setQuantity,
      removeLine,
      toggleWishlist,
      dismissLimit,
      checkOnOpen,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (store === null) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return store;
}

export type AvailabilityState = {
  loading: boolean;
  error: boolean;
  /** Results in the order basket lines ("slug:volume") then wishlist slugs. */
  results: AvailabilityResult[];
  retry: () => void;
};

/**
 * Call once in each page that checks availability when it opens (not the start
 * page). One check per open: its results are returned so a page that needs the
 * current prices (basket, wishlist) does not send a second request.
 */
export function useAvailabilityCheck(): AvailabilityState {
  const { ready, checkOnOpen } = useStore();
  const [state, setState] = useState<{
    loading: boolean;
    error: boolean;
    results: AvailabilityResult[];
  }>({ loading: true, error: false, results: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let stale = false;
    void checkOnOpen().then((results) => {
      if (stale) return;
      setState(
        results === null
          ? { loading: false, error: true, results: [] }
          : { loading: false, error: false, results },
      );
    });
    return () => {
      stale = true;
    };
  }, [ready, checkOnOpen, attempt]);

  const retry = useCallback(() => {
    setState({ loading: true, error: false, results: [] });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}

export function StorageNotice() {
  const { storageBlocked } = useStore();
  if (!storageBlocked) return null;
  return (
    <p className={styles.notice} role="status">
      {STORAGE_MESSAGE}
    </p>
  );
}

export function StoreNotice() {
  const { removedNotice } = useStore();
  if (!removedNotice) return null;
  return (
    <p className={styles.notice} role="status">
      {REMOVED_MESSAGE}
    </p>
  );
}
