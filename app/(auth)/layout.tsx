import { AppShell } from "@/components/layout/AppShell";
import { UserProvider } from "@/lib/context/user-context";
import { WeekProvider } from "@/lib/context/week-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <WeekProvider>
        <AppShell>{children}</AppShell>
      </WeekProvider>
    </UserProvider>
  );
}
