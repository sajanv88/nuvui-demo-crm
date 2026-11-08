import type { NextRequest } from "next/server";
import { parseContactsQuery } from "web/lib/contacts-query";
import { exportContacts } from "web/lib/data/contacts";

const COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "address",
  "company",
  "website",
  "createdAt",
] as const;

// Quotes a value, and defuses one that a spreadsheet would run as a formula.
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/**
 * GET /api/contacts/export[?q=&provider=&sort=&dir=]
 * Every contact matching the same search and filter as the contacts page,
 * as CSV. Paging is ignored: an export is the whole result.
 */
export async function GET(request: NextRequest) {
  const query = parseContactsQuery(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const contacts = await exportContacts(query);

  const lines = [
    COLUMNS.join(","),
    ...contacts.map((contact) =>
      COLUMNS.map((column) => csvCell(contact[column])).join(","),
    ),
  ];

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="contacts.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
