"use client";

import {
  BuildingIcon,
  LayoutDashboardIcon,
  PieChartIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@nuvui/icons";
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@nuvui/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkStatusIcon } from "./navigation-progress";

const pages = [
  { href: "/", label: "Overview", Icon: LayoutDashboardIcon },
  { href: "/growth", label: "Growth", Icon: TrendingUpIcon },
  { href: "/audience", label: "Audience", Icon: PieChartIcon },
  { href: "/companies", label: "Companies", Icon: BuildingIcon },
  { href: "/contacts", label: "Contacts", Icon: UsersIcon },
] as const satisfies readonly { href: Route; label: string; Icon: unknown }[];

const isActive = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The page links, with the one for `pathname` marked as current. With no
 * pathname, nothing is marked: that's the Suspense fallback for routes
 * whose URL is only known at request time.
 */
export function SidebarNavLinks({
  pathname,
  contactCount,
}: {
  pathname: string | null;
  contactCount: number;
}) {
  return (
    <SidebarMenu>
      {pages.map(({ href, label, Icon }) => {
        const active = pathname !== null && isActive(pathname, href);
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton asChild active={active} tooltip={label}>
              <Link href={href} aria-current={active ? "page" : undefined}>
                <LinkStatusIcon icon={<Icon size={16} aria-hidden="true" />} />
                <span>{label}</span>
                {href === "/contacts" ? (
                  <SidebarMenuBadge>{contactCount}</SidebarMenuBadge>
                ) : null}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

/** The page links. A client leaf only because it reads the pathname. */
export function SidebarNav({ contactCount }: { contactCount: number }) {
  return (
    <SidebarNavLinks pathname={usePathname()} contactCount={contactCount} />
  );
}
