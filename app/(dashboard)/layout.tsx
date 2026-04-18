import { BottomNav } from "@/components/dashboard/BottomNav"
import { Sidebar } from "@/components/dashboard/navigation/Sidebar"
import { UserProvider } from "@/lib/context/user-context"
import { WeekProvider } from "@/lib/context/week-context"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <UserProvider>
      <WeekProvider>
        <Sidebar />
        {/* Global polite live region — page-level status messages are rendered here by aria-live-aware components */}
        <div
          id="dashboard-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        <main className="pb-20 lg:pb-0 lg:pl-72">
          {children}
        </main>
        <BottomNav />
      </WeekProvider>
    </UserProvider>
  )
}
