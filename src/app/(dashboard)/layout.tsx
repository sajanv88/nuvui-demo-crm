import { SidebarMain, SidebarProvider } from "@nuvui/react";
import { AppSidebar } from "web/components/shell/app-sidebar";
import { NavigationProgressProvider } from "web/components/shell/navigation-progress";

/**
 * The frame every dashboard page shares: the sidebar, and the page beside
 * it. `modal` is the @modal slot, where a contact opened from inside the
 * app is shown in a sheet over the page it was opened from.
 */
export default function DashboardLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <NavigationProgressProvider>
      <SidebarProvider className="shell">
        <AppSidebar />
        <SidebarMain className="shell__main">{children}</SidebarMain>
        {modal}
      </SidebarProvider>
    </NavigationProgressProvider>
  );
}
