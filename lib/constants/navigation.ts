import {
  LayoutDashboard,
  Calendar,
  Film,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Short label for mobile bottom nav (max 8 chars) */
  mobileLabel: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/plan/current", label: "This week", mobileLabel: "Plan", icon: Calendar },
  { href: "/videos", label: "Content library", mobileLabel: "Videos", icon: Film },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings },
];
