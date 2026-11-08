import type { CompanyKind, Provider } from "./labels";

/** A contact as it's stored. */
export interface StoredContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  website: string;
  /** ISO 8601, UTC. */
  createdAt: string;
}

/** A contact with the fields the dashboard derives from it. */
export interface Contact extends StoredContact {
  initials: string;
  provider: Provider;
  domain: string;
  companyKind: CompanyKind;
}

export interface Figure {
  label: string;
  value: string;
  /** A ratio against the period before, for a Trend. */
  change?: number;
  description: string;
  spark: { label: string; value: number }[];
}

export interface MonthRow {
  month: string;
  label: string;
  signups: number;
  total: number;
}

export interface ProviderRow {
  provider: Provider;
  contacts: number;
}

export interface CompanyKindRow {
  kind: CompanyKind;
  label: string;
  contacts: number;
  examples: string[];
}

export interface ContactsPage {
  rows: Contact[];
  /** Contacts matching the search and filter, across every page. */
  total: number;
  /** The page served, which is the one asked for, kept within range. */
  page: number;
  pageCount: number;
}
