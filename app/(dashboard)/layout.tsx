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
        <main className="lg:pl-72">
          {children}
        </main>
      </WeekProvider>
    </UserProvider>
  )
}
