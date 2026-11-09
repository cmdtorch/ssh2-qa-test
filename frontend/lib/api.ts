export type Gender = "women" | "men" | "unisex";
export type Sort = "new" | "price-asc" | "price-desc";

export type ProductListItem = {
  slug: string;
  name: string;
  gender: string;
  photo: string | null;
  regular_price: number;
  sale_price: number | null;
  discount_percent: number | null;
};

export type ProductPage = {
  total: number;
  pages: number;
  page: number;
  results: ProductListItem[];
};

export type ProductSize = {
  volume: number;
  is_default: boolean;
  regular_price: number;
  sale_price: number | null;
  discount_percent: number | null;
};

export type ProductDetail = {
  slug: string;
  name: string;
  gender: string;
  photos: string[];
  sizes: ProductSize[];
  description: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  ingredients: string;
  shipping: string;
  questions: string;
  related: ProductListItem[];
  descriptor_line?: string | null;
  rating?: number | null;
};

export type AvailableItem = {
  item: string;
  available: true;
  slug: string;
  name: string;
  photo: string | null;
  volume: number;
  regular_price: number;
  sale_price: number | null;
  discount_percent: number | null;
};

export type UnavailableItem = { item: string; available: false };
export type AvailabilityResult = AvailableItem | UnavailableItem;

export type ProductQuery = {
  gender?: string;
  sort?: string;
  page?: number;
  q?: string;
};

export const AVAILABILITY_CHUNK = 50;

/** status 0 means the backend could not be reached or the answer was unreadable. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { signal });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause;
    }
    throw new ApiError(0, "The backend could not be reached");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }
  if (body === undefined) {
    throw new ApiError(0, "The answer could not be read");
  }
  return body as T;
}

export function getProducts(
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<ProductPage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return request<ProductPage>(`/api/products/${qs ? `?${qs}` : ""}`, signal);
}

export function getProduct(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return request<ProductDetail>(
    `/api/products/${encodeURIComponent(slug)}/`,
    signal,
  );
}

/** One request, at most 50 items; use checkAvailability for any length. */
export async function getAvailability(
  items: string[],
  signal?: AbortSignal,
): Promise<AvailabilityResult[]> {
  const params = new URLSearchParams({ items: items.join(",") });
  const body = await request<{ results: AvailabilityResult[] }>(
    `/api/products/availability/?${params.toString()}`,
    signal,
  );
  return body.results;
}

/** Items are "slug:volume" or "slug"; results come back in the request order. */
export async function checkAvailability(
  items: string[],
  signal?: AbortSignal,
): Promise<AvailabilityResult[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < items.length; i += AVAILABILITY_CHUNK) {
    chunks.push(items.slice(i, i + AVAILABILITY_CHUNK));
  }
  const answers = await Promise.all(
    chunks.map((chunk) => getAvailability(chunk, signal)),
  );
  return answers.flat();
}
