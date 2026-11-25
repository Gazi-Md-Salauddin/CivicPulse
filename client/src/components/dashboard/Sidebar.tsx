"use client";

import { Suspense, useState, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bars,
  Envelope,
  House,
  Person,
} from "@gravity-ui/icons";

import { Drawer } from "@heroui/react";

import {
  Building2,
  ChevronRight,
  ClipboardList,
  HardHat,
} from "lucide-react";


// Types

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

type NavSection = {
  title: string;
  items: NavItem[];
};

type RoleConfig = {
  portalName: string;
  workspaceName: string;
  workspaceDescription: string;
  workspaceIcon: ComponentType<SVGProps<SVGSVGElement>>;
  sections: NavSection[];
  supportTitle: string;
  supportDescription: string;
};


// Role Based Navigation Configuration

const sidebarConfig: Record<UserRole, RoleConfig> = {
  citizen: {
    portalName: "Citizen Portal",
    workspaceName: "Citizen Workspace",
    workspaceDescription: "Community Member",
    workspaceIcon: House,

    sections: [
      {
        title: "Workspace",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/citizen",
            icon: House,
          },
          {
            label: "My Reports",
            href: "/dashboard/citizen/my-reports",
            icon: Envelope,
          },
          {
            label: "Create Issue",
            href: "/create-issue",
            icon: House,
          },
        ],
      },
      {
        title: "Account",
        items: [
          {
            label: "Profile",
            href: "/dashboard/citizen/profile",
            icon: Person,
          },
        ],
      },
    ],

    supportTitle: "Need assistance?",
    supportDescription:
      "Have questions or need help reporting a community issue?",
  },

  admin: {
    portalName: "Admin Panel",
    workspaceName: "Admin Workspace",
    workspaceDescription: "System Administrator",
    workspaceIcon: ShieldCheckIcon,

    sections: [
      {
        title: "Workspace",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/admin",
            icon: House,
          },
          {
            label: "Users",
            href: "/dashboard/admin/users",
            icon: Person,
          },
          {
            label: "Departments",
            href: "/dashboard/admin/departments",
            icon: Building2,
          },
          {
            label: "Issue Management",
            href: "/dashboard/admin/issues",
            icon: Envelope,
          },
        ],
      },
    ],

    supportTitle: "System Support",
    supportDescription:
      "Manage your platform and get assistance when needed.",
  },

  "department-manager": {
    portalName: "Department Portal",
    workspaceName: "Manager Workspace",
    workspaceDescription: "Department Manager",
    workspaceIcon: HardHat,

    sections: [
      {
        title: "Workspace",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/department-manager",
            icon: House,
          },
          {
            label: "Department Issues",
            href: "/dashboard/department-manager/department-issues",
            icon: Envelope,
          },
          {
            label: "Team Management",
            href: "/dashboard/department-manager/team",
            icon: Person,
          },
        ],
      },
    ],

    supportTitle: "Manager Support",
    supportDescription:
      "Need help managing your department and maintenance team?",
  },

  "maintenance-staff": {
    portalName: "Staff Portal",
    workspaceName: "Staff Workspace",
    workspaceDescription: "Maintenance Team",
    workspaceIcon: HardHat,

    sections: [
      {
        title: "Workspace",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/maintenance-staff",
            icon: House,
          },
          {
            label: "My Tasks",
            href: "/dashboard/maintenance-staff/tasks",
            icon: ClipboardList,
          },
        ],
      },
      {
        title: "Account",
        items: [
          {
            label: "Profile Settings",
            href: "/dashboard/maintenance-staff/profile",
            icon: Person,
          },
        ],
      },
    ],

    supportTitle: "Need assistance?",
    supportDescription:
      "Contact your department manager for task-related support.",
  },
};


// Admin Icon

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return <HardHat {...props} />;
}

// Navigation Items


function NavigationItems({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const config = sidebarConfig[role];

  // Flatten all navigation items
  const allItems = config.sections.flatMap(
    (section) => section.items
  );

  // Find the most specific matching route.
  // This prevents parent and child menus being active together.
  const activeItem = allItems
    .filter(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <nav className="flex flex-col gap-6">
      {config.sections.map((section) => (
        <div key={section.title}>
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-teal-300">
            {section.title}
          </p>

          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              const Icon = item.icon;

              const isActive =
                activeItem?.href === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#14B8A6] text-white shadow-sm"
                      : "text-teal-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-5 shrink-0" />

                  <span>{item.label}</span>

                  {isActive && (
                    <ChevronRight
                      size={16}
                      className="ml-auto"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

// Main Sidebar Component

export default function Sidebar({
  role,
  mode,
}: SidebarProps) {
  const config = sidebarConfig[role];
  const WorkspaceIcon = config.workspaceIcon;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mobile Drawer

  if (mode === "mobile") {
    return (
      <div className="w-full bg-[#134E4A] px-4 py-3 lg:hidden">
        <Drawer isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Trigger className="flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-medium text-white transition hover:bg-white/15">
            <Bars aria-hidden="true" />
            <span>Menu</span>
          </Drawer.Trigger>

          <Drawer.Backdrop>
            <Drawer.Content
              placement="left"
              className="max-w-[calc(100vw-1rem)] bg-white/10 text-white"
            >
              <Drawer.Dialog className="bg-[#134E4A]">
                <Drawer.CloseTrigger aria-label="Close dashboard navigation" className="bg-white/10 text-white" />

                <Drawer.Header className="pr-12">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#134E4A] text-white">
                      <WorkspaceIcon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <Drawer.Heading className="truncate text-white">
                        {config.workspaceName}
                      </Drawer.Heading>
                      <p className="text-sm text-gray-400">
                        {config.workspaceDescription}
                      </p>
                    </div>
                  </div>
                </Drawer.Header>

                <Drawer.Body>
                  <div className="flex min-h-full flex-col gap-6">
                    <Suspense fallback={null}>
                      <NavigationItems
                        role={role}
                        onNavigate={() => setDrawerOpen(false)}
                      />
                    </Suspense>

                    <div className="mt-auto rounded-xl border border-white/10 bg-[#134E4A] p-4">
                      <p className="text-sm font-semibold text-white">
                        {config.supportTitle}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-teal-100">
                        {config.supportDescription}
                      </p>
                    </div>
                  </div>
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
    <aside className="hidden w-64 shrink-0 bg-[#134E4A] p-4 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:self-start">
      <div className="flex h-full flex-col">

        {/* Workspace Header */}
        <div className="mb-7 rounded-xl bg-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14B8A6] text-white">
              <WorkspaceIcon className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {config.workspaceName}
              </p>

              <p className="truncate text-xs text-teal-200">
                {config.workspaceDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={null}>
            <NavigationItems role={role} />
          </Suspense>
        </div>

        {/* Support Card */}
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">
            {config.supportTitle}
          </p>

          <p className="mt-1 text-xs leading-5 text-teal-200">
            {config.supportDescription}
          </p>

        </div>
      </div>
    </aside>
  );
}
