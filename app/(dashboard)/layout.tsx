import { Topbar } from "@/components/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Topbar />
      <main className="px-6 py-6 md:py-8">{children}</main>
    </div>
  );
}
