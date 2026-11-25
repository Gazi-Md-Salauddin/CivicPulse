"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import Profile, {
  type IProfileUser,
  type IProfileUpdateData,
} from "@/components/shared/Profile";
import { updateMaintenanceProfile } from "@/services/profile.service";
import { useSession } from "@/lib/auth-client";

export default function MaintenanceStaffProfilePage() {
  const { data: session, isPending } = useSession();
  const [success, setSuccess] = useState("");
  const [profileOverrides, setProfileOverrides] = useState<
    Partial<IProfileUser>
  >({});

  const profileUser: IProfileUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        address: session.user.address,
        image: session.user.image,
        role: session.user.role ?? undefined,
        ...profileOverrides,
      }
    : null;

  const handleProfileUpdate = async (data: IProfileUpdateData) => {
    setSuccess("");

    const result = await updateMaintenanceProfile(data);
    setProfileOverrides(result.data);
    setSuccess("Your profile settings have been updated.");
  };

  if (isPending) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 text-sm text-gray-500">
        <LoaderCircle size={20} className="animate-spin text-[#0F766E]" />
        Loading your profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        Sign in to view and update your profile settings.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      {success && (
        <div
          role="status"
          className="mx-auto mb-6 flex max-w-5xl items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}
      <Profile
        key={`${profileUser.id}:${profileUser.name}:${profileUser.address ?? ""}:${profileUser.image ?? ""}`}
        user={profileUser}
        onSave={handleProfileUpdate}
      />
    </main>
  );
}
