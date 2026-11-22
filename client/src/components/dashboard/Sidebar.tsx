"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bars,
  Bell,
  Envelope,
  Gear,
  House,
  Magnifier,
  Person,
} from "@gravity-ui/icons";

import { Button, Drawer } from "@heroui/react";

export type UserRole =
  | "citizen"
  | "admin"
  | "department-manager"
  | "maintenance-staff";

type SidebarMode = "desktop" | "mobile";

interface SidebarProps {
  role: UserRole;
  mode: SidebarMode;
}

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navigation: Record<UserRole, NavItem[]> = {
  citizen: [
    { label: "Dashboard", href: "/dashboard/citizen", icon: House },
    { label: "My Reports", href: "/dashboard/citizen/reports", icon: Envelope },
    { label: "Create Issue", href: "/dashboard/citizen/create-issue", icon: Bell },
    { label: "Nearby Issues", href: "/dashboard/citizen/nearby-issues", icon: Magnifier },
    { label: "Notifications", href: "/dashboard/citizen/notifications", icon: Bell },
    { label: "Profile", href: "/dashboard/citizen/profile", icon: Person },
  ],

  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: House },
    { label: "Users", href: "/dashboard/admin/users", icon: Person },
    { label: "Departments", href: "/dashboard/admin/departments", icon: House },
    { label: "All Reports", href: "/dashboard/admin/reports", icon: Envelope },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: Magnifier },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Gear },
  ],

  "department-manager": [
    { label: "Dashboard", href: "/dashboard/manager", icon: House },
    { label: "Department Issues", href: "/dashboard/manager/issues", icon: Envelope },
    { label: "Assign Tasks", href: "/dashboard/manager/assign-tasks", icon: Bell },
    { label: "Staff", href: "/dashboard/manager/staff", icon: Person },
    { label: "Analytics", href: "/dashboard/manager/analytics", icon: Magnifier },
  ],

  "maintenance-staff": [
    { label: "Dashboard", href: "/dashboard/staff", icon: House },
    { label: "My Tasks", href: "/dashboard/staff/tasks", icon: Envelope },
    { label: "Notifications", href: "/dashboard/staff/notifications", icon: Bell },
    { label: "Profile", href: "/dashboard/staff/profile", icon: Person },
  ],
};

const roleLabels: Record<UserRole, string> = {
  citizen: "Citizen Portal",
  admin: "Admin Panel",
  "department-manager": "Department Portal",
  "maintenance-staff": "Staff Portal",
};

function NavigationItems({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navigation[role].map((item) => {
        const Icon = item.icon;

        const isActive =
          pathname === item.href ||
          (item.href !== `/${role}/dashboard` &&
            pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#14B8A6] text-white"
                : "text-teal-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="size-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ role, mode }: SidebarProps) {
  // Mobile Drawer
  if (mode === "mobile") {
    return (
      <div className="lg:hidden">
        <Drawer>
          <Button variant="secondary">
            <Bars />
            Menu
          </Button>

          <Drawer.Backdrop>
            <Drawer.Content placement="left">
              <Drawer.Dialog>
                <Drawer.CloseTrigger />

                <Drawer.Header>
                  <Drawer.Heading>CivicPulse</Drawer.Heading>
                  <p className="text-sm text-muted">
                    {roleLabels[role]}
                  </p>
                </Drawer.Header>

                <Drawer.Body>
                  <NavigationItems role={role} />
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>
    );
  }

  // Desktop Sidebar
  return (
    <aside className="top-[2px] hidden h-screen w-[260px] shrink-0 flex-col bg-[#134E4A] text-white lg:flex">
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-6">
        <Link href={`/dashboard/${role}`}>
          <h2 className="text-xl font-bold">CivicPulse</h2>
          <p className="mt-1 text-xs text-teal-200">
            {roleLabels[role]}
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-teal-300">
          Main Menu
        </p>

        <NavigationItems role={role} />
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-teal-100 transition hover:bg-red-500/20 hover:text-white"
        >
          <Gear className="size-5" />
          Settings
        </button>
      </div>
    </aside>
  );
}
