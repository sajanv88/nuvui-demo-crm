# NuvUI CRM

A contacts dashboard template built with [Next.js 16](https://nextjs.org) and [nuvui](https://nuvui.nuvraxis.com). It's meant as a starting point: real routes, URL-driven tables, cached server data, streaming with Suspense, and loading feedback that holds up on a slow network.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sajanv88/nuvui-demo-crm)

## Features

- **Five pages**: Overview, Growth, Audience, Companies and Contacts, sharing one sidebar layout.
- **Charts** from `@nuvui/charts` (Recharts): a monthly growth chart with a running total, sparklines, a donut, and bar charts. Each one has a hidden table of its numbers for screen readers.
- **A contacts table** from `@nuvui/table`. Search, provider filter, sorting, page and page size all live in the URL (`/contacts?page=2&provider=gmail&sort=name&dir=asc`), so any view can be shared or bookmarked. The server does the filtering and paging.
- **Contact details in a sheet**: clicking a contact opens it over the list, and closing the sheet returns to the same filtered page. Reloading or sharing the link opens the full `/contacts/[id]` page instead.
- **Loading feedback**: skeletons while sections stream in, skeleton rows while the table changes page, and a progress bar plus a spinner on the clicked link while a page loads.
- **Theming**: light, dark or system mode, and an accent colour picker in the sidebar with presets and a random option. Both are remembered and applied before the first paint.
- **CSV export** of all contacts, or of the current search and filter.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components, partial prefetching, typed routes, React Compiler) |
| UI | `@nuvui/react`, `@nuvui/table`, `@nuvui/charts`, `@nuvui/icons` |
| Data | `data.json`: 100 sample contacts made with Faker |
| Tooling | TypeScript, Biome, pnpm |

## Getting started

You need Node.js 20.9 or newer, and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | What it does |
| --- | --- |
| `pnpm dev` | Starts the development server. |
| `pnpm build` | Makes a production build. |
| `pnpm start` | Serves the production build. |
| `pnpm lint` | Checks the code with Biome. |
| `pnpm format` | Formats the code with Biome. |

## Project structure

```
src/
├── app/
│   ├── layout.tsx                 Root layout: stylesheets, fonts, theme script, metadata
│   ├── not-found.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx             Sidebar, page area and the @modal slot
│   │   ├── loading.tsx, error.tsx
│   │   ├── page.tsx               Overview
│   │   ├── growth/ audience/ companies/
│   │   ├── contacts/page.tsx      The table; reads searchParams inside Suspense
│   │   ├── contacts/[id]/page.tsx The full contact page, prerendered for every contact
│   │   └── @modal/(.)contacts/[id]/  The same contact, opened as a sheet from inside the app
│   └── api/contacts/export/route.ts  CSV export
├── components/
│   ├── shell/                     Sidebar, page header, theme toggle, accent picker, loading indicators
│   ├── dashboard/                 Cards (Server Components), charts (client), skeletons
│   └── contacts/                  Table, contact details, sheet
└── lib/
    ├── data/source.ts             Where contacts come from. Swap this for your database
    ├── data/contacts.ts           Cached, tagged queries ("use cache", cacheLife, cacheTag)
    ├── contacts-query.ts          Reads and writes the table's URL state, with validation
    └── labels.ts, format.ts, types.ts
```

## How it works

### Server first

Pages and cards are Server Components. Only the parts that need the browser are client components: the charts, the table, the sidebar links (they read the current path) and the theme controls. Each card renders its title straight away, and only the part that needs data waits for it, behind its own `<Suspense>` with a skeleton the same shape.

### Data and caching

Every read goes through `src/lib/data/contacts.ts`. Each function uses `"use cache"`, `cacheLife("hours")` and the `contacts` cache tag, and the module is marked `server-only`. As a result:

- The section pages are prerendered as static HTML.
- `/contacts` is partially prerendered: the page frame is static, and the table streams in for each URL.
- Every contact page is prerendered at build time.

**To use a real database**, replace the body of `loadContacts()` in `src/lib/data/source.ts`. After a write, refresh every page that shows contacts:

```ts
import { revalidateTag, updateTag } from "next/cache";
import { CONTACTS_TAG } from "web/lib/data/contacts";

// In a Server Action: expires now, so the action's response sees the change.
updateTag(CONTACTS_TAG);

// From a webhook or route handler: refreshes in the background.
revalidateTag(CONTACTS_TAG, "max");
```

### Table state in the URL

`src/lib/contacts-query.ts` turns `searchParams` into a typed query and back. Every value from the URL is checked: the page number is clamped, the page size must be 10, 20, 50 or 100, and the sort column must be on an allowed list. Default values are left out of the URL to keep links short.

The client table turns each click back into a URL and navigates inside a React transition. While the next page loads, `useOptimistic` updates the controls straight away and the table shows skeleton rows. Starting a search adds a history entry, and further typing replaces it, so the Back button doesn't step through each letter.

### Loading feedback

The App Router has no global "navigation started" event. Instead, each link reports its own state through Next's `useLinkStatus` hook, using `<LinkStatusIcon>` from `src/components/shell/navigation-progress.tsx`, and the table reports through its transition. While anything is loading, a bar runs along the top of the page and the clicked link shows a spinner. Both wait 150ms before appearing, so fast navigations don't flicker.

Wrap any new link the same way:

```tsx
<Link href="/somewhere">
  <LinkStatusIcon icon={<ArrowRightIcon size={16} aria-hidden="true" />} />
  Somewhere
</Link>
```

### Theming

nuvui is themed entirely with CSS variables, with no provider. The theme toggle sets `data-theme` on `<html>`. The accent picker sets a hue, and `src/app/globals.css` turns it into `--color-primary`, `--color-ring` and the first chart colour, with lightness fixed per mode so text stays readable on any hue. The choices are kept in `localStorage`, and a small script in `src/components/shell/theme-script.tsx` applies them before the page paints.

To change the default look for everyone, set nuvui's tokens on `:root` in `globals.css`, or load one of its preset themes. See [nuvui's theming guide](https://nuvui.nuvraxis.com/docs).

## Deploying

The template is set up for [Vercel](https://vercel.com). Use the button at the top, or import the repository. No environment variables are needed. `metadataBase` comes from `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets for you.

`data.json` is bundled into the build, which matters because Vercel's file system is read-only at runtime.

### The sample data

`data.json` holds the sample contacts. `GET /api/users` returns it, and if the file is missing it first generates 100 new contacts with Faker. That generation step writes to disk, so it only works locally; to make a fresh set, delete `data.json` and visit `/api/users` while `pnpm dev` is running. In a deployment, make sure `data.json` is committed.

## License

[MIT](LICENSE)
