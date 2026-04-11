import {
  LayoutDashboard,
  Calendar,
  Film,
  BarChart3,
  Settings,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Short label for mobile bottom nav (max 8 chars) */
  mobileLabel: string;
  icon: LucideIcon;
  locked?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/plan/current", label: "This week", mobileLabel: "Plan", icon: Calendar },
  { href: "/videos", label: "Content library", mobileLabel: "Videos", icon: Film },
  { href: "/intelligence", label: "Intelligence", mobileLabel: "Insights", icon: BarChart3, locked: true },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings },
];

export { Lock };
