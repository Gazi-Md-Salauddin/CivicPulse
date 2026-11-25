"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

type DashboardRole =
  | "admin"
  | "citizen"
  | "department_manager"
  | "maintenance_staff";

interface ProtectedDashboardProps {
  role: DashboardRole;
  children: ReactNode;
}

export default function ProtectedDashboard({
  role,
  children,
}: ProtectedDashboardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userRole = session?.user.role;

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/auth/login");
    } else if (userRole !== role) {
      router.replace("/unauthorized");
    }
  }, [isPending, role, router, session, userRole]);

  if (isPending || !session || userRole !== role) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-slate-600"
        role="status"
      >
        Verifying account access...
      </div>
    );
  }

  return children;
}
