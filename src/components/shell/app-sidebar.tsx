import { DatabaseIcon, HexagonIcon } from "@nuvui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@nuvui/react";
import Link from "next/link";
import { Suspense } from "react";
import { getContactCount } from "web/lib/data/contacts";
import { AccentPicker } from "./accent-picker";
import { LinkStatusIcon } from "./navigation-progress";
import { SidebarNav, SidebarNavLinks } from "./sidebar-nav";

export async function AppSidebar() {
  const contactCount = await getContactCount();

  return (
    <Sidebar label="Main">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="NuvUI CRM, home">
              <Link href="/">
                <LinkStatusIcon
                  icon={<HexagonIcon size={16} aria-hidden="true" />}
                />
                <span className="shell__brand">NuvUI CRM</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <Suspense
            fallback={
              <SidebarNavLinks pathname={null} contactCount={contactCount} />
            }
          >
            <SidebarNav contactCount={contactCount} />
          </Suspense>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AccentPicker />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Export every contact as CSV">
              <a href="/api/contacts/export" download>
                <DatabaseIcon size={16} aria-hidden="true" />
                <span>{contactCount} records · CSV</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
