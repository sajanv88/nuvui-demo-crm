import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { ContactsQuery } from "../contacts-query";
import {
  type CompanyKind,
  companyKindLabels,
  type Provider,
  providerLabels,
} from "../labels";
import type {
  CompanyKindRow,
  Contact,
  ContactsPage,
  Figure,
  MonthRow,
  ProviderRow,
  StoredContact,
} from "../types";
import { loadContacts } from "./source";

/**
 * Every function here is cached across requests with "use cache" and tagged
 * "contacts". After a write, call `updateTag(CONTACTS_TAG)` from the Server
 * Action that made it, or `revalidateTag(CONTACTS_TAG, "max")` from a
 * webhook, and every page that reads contacts is refreshed.
 */
export const CONTACTS_TAG = "contacts";

const DAY = 24 * 60 * 60 * 1000;

/* Deriving fields */

const honorifics = /^(mr|mrs|ms|miss|dr|prof)\.?$/i;
const suffixes = /^(jr|sr|i|ii|iii|iv|v|md|phd|dds|dvm)\.?$/i;

function initialsOf(name: string): string {
  const words = name
    .split(/\s+/)
    .filter((word) => !honorifics.test(word) && !suffixes.test(word));
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

function providerOf(email: string): Provider {
  const host = email.split("@")[1]?.toLowerCase() ?? "";
  if (host.startsWith("gmail")) return "gmail";
  if (host.startsWith("yahoo")) return "yahoo";
  if (host.startsWith("hotmail")) return "hotmail";
  return "other";
}

function domainOf(website: string): string {
  try {
    return `.${new URL(website).hostname.split(".").pop() ?? ""}`;
  } catch {
    return "unknown";
  }
}

function companyKindOf(company: string): CompanyKind {
  if (company.includes(" - ")) return "partnership";
  if (company.includes(",") && company.includes(" and "))
    return "three-partner";
  if (company.endsWith(" and Sons")) return "family";
  if (company.endsWith(" Group")) return "group";
  if (company.endsWith(" Inc")) return "inc";
  if (company.endsWith(" LLC")) return "llc";
  return "partnership";
}

function derive(contact: StoredContact): Contact {
  return {
    ...contact,
    initials: initialsOf(contact.name),
    provider: providerOf(contact.email),
    domain: domainOf(contact.website),
    companyKind: companyKindOf(contact.company),
  };
}

function countBy<T, K extends string>(items: T[], key: (item: T) => K) {
  const counts = new Map<K, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

const monthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
const shortMonth = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const longMonth = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const longDay = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/* Reads */

/** Every contact, newest first. */
export async function getContacts(): Promise<Contact[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  const stored = await loadContacts();
  return stored
    .map(derive)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getContact(id: string): Promise<Contact | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG, `contact:${id}`);

  return (await getContacts()).find((contact) => contact.id === id);
}

export async function getContactIds(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  return (await getContacts()).map((contact) => contact.id);
}

export async function getContactCount(): Promise<number> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  return (await getContacts()).length;
}

export async function getLatestContacts(count: number): Promise<Contact[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  return (await getContacts()).slice(0, count);
}

const searchable = (contact: Contact) =>
  `${contact.name} ${contact.email} ${contact.company}`.toLowerCase();

/** Contacts matching a search and filter, filtered and sorted. */
function filterAndSort(
  contacts: Contact[],
  { q, provider, sort, dir }: Omit<ContactsQuery, "page" | "pageSize">,
): Contact[] {
  const needle = q.toLowerCase();
  const found = contacts.filter(
    (contact) =>
      (!needle || searchable(contact).includes(needle)) &&
      (!provider || contact.provider === provider),
  );
  const sign = dir === "desc" ? -1 : 1;
  return found.sort(
    (a, b) =>
      a[sort].localeCompare(b[sort], "en", { sensitivity: "base" }) * sign,
  );
}

/**
 * One page of contacts. The query has already been checked by
 * parseContactsQuery, so `sort` is a known column.
 */
export async function queryContacts(
  query: ContactsQuery,
): Promise<ContactsPage> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  const found = filterAndSort(await getContacts(), query);
  const pageCount = Math.max(1, Math.ceil(found.length / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.pageSize;

  return {
    rows: found.slice(start, start + query.pageSize),
    total: found.length,
    page,
    pageCount,
  };
}

/** Every contact matching a search and filter, for an export. */
export async function exportContacts(
  query: Omit<ContactsQuery, "page" | "pageSize">,
): Promise<Contact[]> {
  return filterAndSort(await getContacts(), query);
}

export interface Summary {
  total: number;
  /** The newest sign-up. "Last 30 days" counts back from it. */
  asOf: string;
  range: { from: string; to: string };
}

export async function getSummary(): Promise<Summary> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  const contacts = await getContacts();
  const newest = contacts[0]?.createdAt ?? new Date(0).toISOString();
  const oldest = contacts[contacts.length - 1]?.createdAt ?? newest;
  return {
    total: contacts.length,
    asOf: newest,
    range: {
      from: longDay.format(new Date(oldest)),
      to: longDay.format(new Date(newest)),
    },
  };
}

/** One row per month from the first sign-up to the last, empty ones too. */
export async function getMonthlyGrowth(): Promise<MonthRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  const dates = (await getContacts()).map((c) => new Date(c.createdAt));
  if (dates.length === 0) return [];
  const newest = new Date(Math.max(...dates.map(Number)));
  const oldest = new Date(Math.min(...dates.map(Number)));
  const perMonth = countBy(dates, monthKey);

  const months: MonthRow[] = [];
  let running = 0;
  for (
    let cursor = new Date(
      Date.UTC(oldest.getUTCFullYear(), oldest.getUTCMonth(), 1),
    );
    cursor <= newest;
    cursor = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1),
    )
  ) {
    const signups = perMonth.get(monthKey(cursor)) ?? 0;
    running += signups;
    months.push({
      month: shortMonth.format(cursor),
      label: longMonth.format(cursor),
      signups,
      total: running,
    });
  }
  return months;
}

export async function getProviderBreakdown(): Promise<ProviderRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  return [...countBy(await getContacts(), (c) => c.provider)]
    .map(([provider, contacts]) => ({ provider, contacts }))
    .sort((a, b) => b.contacts - a.contacts);
}

export async function getActivity() {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  const dates = (await getContacts()).map((c) => new Date(c.createdAt));
  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const partNames = ["Night", "Morning", "Afternoon", "Evening"];
  const byDay = countBy(
    dates,
    (d) => weekdayNames[(d.getUTCDay() + 6) % 7] ?? "Mon",
  );
  const byPart = countBy(
    dates,
    (d) => partNames[Math.floor(d.getUTCHours() / 6)] ?? "Night",
  );
  return {
    weekdays: weekdayNames.map((day) => ({
      day,
      contacts: byDay.get(day) ?? 0,
    })),
    dayparts: partNames.map((part) => ({
      part,
      contacts: byPart.get(part) ?? 0,
    })),
  };
}

export async function getDomainBreakdown() {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  return [...countBy(await getContacts(), (c) => c.domain)]
    .map(([domain, contacts]) => ({ domain, contacts }))
    .sort((a, b) => b.contacts - a.contacts);
}

export async function getCompanyKinds(): Promise<CompanyKindRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  const contacts = await getContacts();
  return [...countBy(contacts, (c) => c.companyKind)]
    .map(([kind, count]) => ({
      kind,
      label: companyKindLabels[kind],
      contacts: count,
      examples: contacts
        .filter((c) => c.companyKind === kind)
        .slice(0, 3)
        .map((c) => c.company),
    }))
    .sort((a, b) => b.contacts - a.contacts);
}

export async function getFigures(): Promise<Figure[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACTS_TAG);

  const [contacts, months, providers] = await Promise.all([
    getContacts(),
    getMonthlyGrowth(),
    getProviderBreakdown(),
  ]);
  const total = contacts.length;
  const newest = new Date(contacts[0]?.createdAt ?? 0).getTime();
  const inWindow = (fromDays: number, toDays: number) =>
    contacts.filter((c) => {
      const age = newest - new Date(c.createdAt).getTime();
      return age >= fromDays * DAY && age < toDays * DAY;
    }).length;
  const last30 = inWindow(0, 30);
  const prior30 = inWindow(30, 60);
  const before30 = total - last30;

  const busiest = months.reduce<MonthRow | undefined>(
    (best, row) => (!best || row.signups > best.signups ? row : best),
    undefined,
  );
  const top = providers[0];
  const spark = months.slice(-12);

  return [
    {
      label: "Total contacts",
      value: total.toLocaleString("en-GB"),
      change: before30 > 0 ? last30 / before30 : undefined,
      description: "growth in the last 30 days",
      spark: spark.map((row) => ({ label: row.label, value: row.total })),
    },
    {
      label: "New in the last 30 days",
      value: last30.toLocaleString("en-GB"),
      change: prior30 > 0 ? (last30 - prior30) / prior30 : undefined,
      description: `against ${prior30} the 30 days before`,
      spark: spark.map((row) => ({ label: row.label, value: row.signups })),
    },
    {
      label: "Monthly average",
      value: (total / Math.max(months.length, 1)).toFixed(1),
      description: busiest
        ? `busiest was ${busiest.label}, with ${busiest.signups}`
        : "no sign-ups yet",
      spark: spark.map((row) => ({ label: row.label, value: row.signups })),
    },
    {
      label: "Top email provider",
      value: top ? providerLabels[top.provider] : "None",
      description: top
        ? `${Math.round((top.contacts / total) * 100)}% of contacts use it`
        : "",
      spark: spark.map((row) => ({
        label: row.label,
        value: contacts.filter(
          (c) =>
            c.provider === top?.provider &&
            shortMonth.format(new Date(c.createdAt)) === row.month,
        ).length,
      })),
    },
  ];
}
