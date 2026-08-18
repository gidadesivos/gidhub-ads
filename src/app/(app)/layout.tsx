import { requireSession } from "@/lib/auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { MobileRevenueFab } from "@/components/layout/mobile-fab";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-background lg:block">
        <SidebarNav />
      </aside>
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <Topbar name={session.name} role={session.role} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <MobileRevenueFab />
    </div>
  );
}
