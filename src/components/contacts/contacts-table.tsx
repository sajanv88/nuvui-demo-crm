"use client";

import { DownloadIcon, EyeIcon, SearchIcon } from "@nuvui/icons";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
  NativeSelect,
  VisuallyHidden,
} from "@nuvui/react";
import { DataTable, DataTableToolbar } from "@nuvui/table";
import { createColumnHelper, useDataTable } from "@nuvui/table/full";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import {
  type ContactsQuery,
  contactsSearch,
  DEFAULT_QUERY,
  PAGE_SIZES,
  SORTABLE,
  type SortKey,
} from "web/lib/contacts-query";
import { formatDay, hostOf } from "web/lib/format";
import {
  PROVIDERS,
  type Provider,
  providerIntent,
  providerLabels,
} from "web/lib/labels";
import type { Contact } from "web/lib/types";
import { LinkStatusIcon, useReportPending } from "../shell/navigation-progress";

const helper = createColumnHelper<Contact>();
// One empty array, made once, so the table isn't handed a new one each render.
const none: Contact[] = [];

// Made once, outside the component: a new array each render would make the
// table work its rows out again every time.
const columns = helper.columns([
  helper.accessor("name", {
    header: "Name",
    cell: (cell) => (
      <span className="contacts__person">
        <Avatar size="sm">
          <AvatarFallback aria-hidden="true">
            {cell.row.original.initials}
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/contacts/${cell.row.original.id}`}
          className="contacts__link"
          scroll={false}
        >
          {cell.getValue()}
          <LinkStatusIcon inline />
        </Link>
      </span>
    ),
  }),
  helper.accessor("email", {
    header: "Email",
    cell: (cell) => (
      <a className="contacts__link" href={`mailto:${cell.getValue()}`}>
        {cell.getValue()}
      </a>
    ),
  }),
  helper.accessor("company", { header: "Company" }),
  helper.accessor("phone", { header: "Phone", enableSorting: false }),
  helper.accessor("address", { header: "Address", enableSorting: false }),
  helper.accessor("website", {
    header: "Website",
    cell: (cell) => (
      <a
        className="contacts__link"
        href={cell.getValue()}
        target="_blank"
        rel="noopener noreferrer"
      >
        {hostOf(cell.getValue())}
      </a>
    ),
  }),
  helper.accessor("provider", {
    header: "Provider",
    cell: (cell) => (
      <Badge intent={providerIntent[cell.getValue()]} variant="outline">
        {providerLabels[cell.getValue()]}
      </Badge>
    ),
  }),
  helper.accessor("createdAt", {
    header: "Joined",
    cell: (cell) => (
      <time dateTime={cell.getValue()}>
        {formatDay.format(new Date(cell.getValue()))}
      </time>
    ),
  }),
  helper.display({
    id: "actions",
    header: () => <VisuallyHidden>Actions</VisuallyHidden>,
    meta: { label: "Actions", align: "end", control: true },
    enableHiding: false,
    enableSorting: false,
    cell: (cell) => (
      <Button asChild intent="ghost" size="sm">
        <Link href={`/contacts/${cell.row.original.id}`} scroll={false}>
          <LinkStatusIcon icon={<EyeIcon size={16} aria-hidden="true" />} />
          <VisuallyHidden>View {cell.row.original.name}</VisuallyHidden>
        </Link>
      </Button>
    ),
  }),
]);

type Updater<T> = T | ((old: T) => T);
const resolve = <T,>(updater: Updater<T>, old: T): T =>
  typeof updater === "function" ? (updater as (old: T) => T)(old) : updater;

const isSortKey = (id: string): id is SortKey =>
  (SORTABLE as readonly string[]).includes(id);

/**
 * The contacts list. The server has already searched, filtered, sorted and
 * paged the rows for the query in the URL; this component only turns the
 * table's controls back into a URL. Navigation runs in a transition, so the
 * current rows stay up, marked busy, until the next page has arrived, and
 * the controls show the new state at once through useOptimistic.
 */
export function ContactsTable({
  rows,
  total,
  query,
}: {
  rows: Contact[];
  total: number;
  query: ContactsQuery;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useOptimistic(query);
  useReportPending(pending);

  function navigate(next: ContactsQuery, { replace = false } = {}) {
    startTransition(() => {
      setCurrent(next);
      const href = `${pathname}${contactsSearch(next)}` as Route;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    });
  }

  const pagination = {
    pageIndex: current.page - 1,
    pageSize: current.pageSize,
  };
  const sorting = [{ id: current.sort, desc: current.dir === "desc" }];

  const table = useDataTable({
    columns,
    // While the next page is on its way, the table gets no rows, and with
    // `loading` set it draws placeholder rows in their place: the reader
    // sees at once that the click worked, and the old rows can't be
    // mistaken for the new ones.
    data: pending ? none : rows,
    rowCount: total,
    getRowId: (contact) => contact.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableMultiSort: false,
    initialState: { columnVisibility: { phone: false, address: false } },
    state: { pagination, sorting, globalFilter: current.q },
    onPaginationChange: (updater) => {
      const next = resolve(updater, pagination);
      navigate({
        ...current,
        pageSize: next.pageSize,
        // A new page size starts again at the first page.
        page: next.pageSize === current.pageSize ? next.pageIndex + 1 : 1,
      });
    },
    onSortingChange: (updater) => {
      const [next] = resolve(updater, sorting);
      navigate({
        ...current,
        page: 1,
        sort: next && isSortKey(next.id) ? next.id : DEFAULT_QUERY.sort,
        dir: next ? (next.desc ? "desc" : "asc") : DEFAULT_QUERY.dir,
      });
    },
    onGlobalFilterChange: (updater) => {
      const q = String(resolve(updater, current.q) ?? "");
      // Starting a search is a step in the history; refining it replaces
      // that step, so Back doesn't go through it letter by letter.
      navigate(
        { ...current, page: 1, q },
        { replace: current.q !== "" && q !== "" },
      );
    },
  });

  const filtered = current.q !== "" || current.provider !== "";

  return (
    <DataTable
      table={table}
      aria-labelledby="contacts-title"
      rowHeader="name"
      striped={!pending}
      loading={pending}
      loadingRows={Math.min(current.pageSize, 10)}
      pageSizes={[...PAGE_SIZES]}
      className="contacts"
      empty={
        <Empty>
          <EmptyMedia>
            <SearchIcon size={24} aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No contacts match</EmptyTitle>
          <EmptyDescription>
            Try another search, or show every provider.
          </EmptyDescription>
          {filtered ? (
            <EmptyActions>
              <Button
                intent="secondary"
                onClick={() => navigate({ ...DEFAULT_QUERY })}
              >
                Clear the search and filter
              </Button>
            </EmptyActions>
          ) : null}
        </Empty>
      }
      toolbar={
        <DataTableToolbar>
          <table.Filter
            debounce={300}
            placeholder="Search name, email or company"
          />
          <NativeSelect
            aria-label="Email provider"
            value={current.provider}
            onChange={(event) =>
              navigate({
                ...current,
                page: 1,
                provider: event.target.value as Provider | "",
              })
            }
          >
            <option value="">All providers</option>
            {PROVIDERS.map((key) => (
              <option key={key} value={key}>
                {providerLabels[key]}
              </option>
            ))}
          </NativeSelect>
          <span className="contacts__toolbar-gap" aria-hidden="true" />
          <table.ColumnChooser />
          <Button asChild intent="secondary" size="sm">
            <a
              href={`/api/contacts/export${contactsSearch(current, { paged: false })}`}
              download
            >
              <DownloadIcon size={16} aria-hidden="true" />
              Export{filtered ? " matches" : ""}
            </a>
          </Button>
        </DataTableToolbar>
      }
    />
  );
}
