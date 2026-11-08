// The contacts list's state, as it's kept in the URL. Shared by the server,
// which reads it from searchParams, and the client, which writes it back.
// Everything from the URL is untrusted text, so each field is checked
// against what's allowed and falls back to its default.

import { PROVIDERS, type Provider } from "./labels";

export const SORTABLE = [
  "name",
  "email",
  "company",
  "website",
  "provider",
  "createdAt",
] as const;
export type SortKey = (typeof SORTABLE)[number];

export const PAGE_SIZES = [10, 20, 50, 100] as const;

export interface ContactsQuery {
  page: number;
  pageSize: number;
  q: string;
  provider: Provider | "";
  sort: SortKey;
  dir: "asc" | "desc";
}

export const DEFAULT_QUERY: ContactsQuery = {
  page: 1,
  pageSize: 10,
  q: "",
  provider: "",
  sort: "createdAt",
  dir: "desc",
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const oneOf = <T extends string | number>(
  allowed: readonly T[],
  value: unknown,
  fallback: T,
): T => (allowed.includes(value as T) ? (value as T) : fallback);

export function parseContactsQuery(params: Params): ContactsQuery {
  const page = Number.parseInt(first(params.page) ?? "", 10);
  const pageSize = Number.parseInt(first(params.pageSize) ?? "", 10);

  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : DEFAULT_QUERY.page,
    pageSize: oneOf(PAGE_SIZES, pageSize, DEFAULT_QUERY.pageSize),
    q: (first(params.q) ?? "").trim().slice(0, 100),
    provider: oneOf(PROVIDERS, first(params.provider), "") as Provider | "",
    sort: oneOf(SORTABLE, first(params.sort), DEFAULT_QUERY.sort),
    dir: oneOf(["asc", "desc"] as const, first(params.dir), DEFAULT_QUERY.dir),
  };
}

/**
 * The query as a search string, starting with "?", or "" when everything is
 * the default. Defaults are left out so the URLs people share stay short.
 */
export function contactsSearch(
  query: ContactsQuery,
  { paged = true }: { paged?: boolean } = {},
): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.provider) params.set("provider", query.provider);
  if (query.sort !== DEFAULT_QUERY.sort || query.dir !== DEFAULT_QUERY.dir) {
    params.set("sort", query.sort);
    params.set("dir", query.dir);
  }
  if (paged && query.pageSize !== DEFAULT_QUERY.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }
  if (paged && query.page !== DEFAULT_QUERY.page) {
    params.set("page", String(query.page));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}
