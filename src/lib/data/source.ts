import "server-only";

import type { StoredContact } from "../types";

/**
 * Where contacts come from. This template reads the bundled data.json, which
 * works the same locally and on Vercel (the file is part of the build, and
 * Vercel's file system is read-only at runtime).
 *
 * To use a real database, replace the body of this function with a query.
 * Everything that reads contacts goes through here, and the callers in
 * ./contacts.ts are already cached and tagged.
 */
export async function loadContacts(): Promise<StoredContact[]> {
  const { default: file } = await import("../../../data.json");
  return (file as { data: StoredContact[] }).data;
}
