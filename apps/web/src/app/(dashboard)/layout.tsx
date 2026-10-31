import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppSidebar />

      <div className="md:pl-64">
        <AppHeader />

        <main className="mx-auto min-h-[calc(100vh-120px)] max-w-7xl p-5 md:p-8">
          {children}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}