"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  RefreshCw,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import {
  addManagerStaff,
  deactivateManagerStaff,
  getManagerStaff,
  getManagerStaffCandidates,
  type StaffMember,
} from "@/services/issue-workflow.service";

export default function ManagerTeamPage() {
  const [departmentName, setDepartmentName] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [candidates, setCandidates] = useState<StaffMember[]>([]);
  const [membershipSupported, setMembershipSupported] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [teamResponse, candidatesResponse] = await Promise.all([
        getManagerStaff(),
        getManagerStaffCandidates(),
      ]);
      setDepartmentName(teamResponse.data.department.name);
      setStaff(teamResponse.data.staff);
      setMembershipSupported(teamResponse.data.membershipSupported);
      setCandidates(candidatesResponse.data);
      setSelectedStaff((current) =>
        candidatesResponse.data.some((person) => person.id === current)
          ? current
          : candidatesResponse.data[0]?.id ?? ""
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load department staff."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadTeam(), 0);
    return () => window.clearTimeout(timer);
  }, [loadTeam]);

  const addStaff = async () => {
    if (!selectedStaff) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await addManagerStaff(selectedStaff);
      setSuccess("Staff member added to the department.");
      await loadTeam();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to add this staff member."
      );
    } finally {
      setSaving(false);
    }
  };

  const deactivateStaff = async (person: StaffMember) => {
    if (!window.confirm(`Remove ${person.name} from this department?`)) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await deactivateManagerStaff(person.id);
      setSuccess(`${person.name} was removed from the department.`);
      await loadTeam();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to remove this staff member."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#0F766E]">
              <Users size={17} />
              Department Operations
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Team management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {departmentName || "Manage department staff and workload."}
            </p>
          </div>
          <button
            onClick={() => void loadTeam()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <Check size={18} />
            {success}
          </div>
        )}

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">Add maintenance staff</h2>
          {!membershipSupported && !loading && (
            <p className="mt-2 text-sm text-amber-700">
              Department membership is unavailable until the workflow migration
              is applied. Existing assigned staff can be viewed, but membership
              changes are disabled.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedStaff}
              onChange={(event) => setSelectedStaff(event.target.value)}
              disabled={
                loading ||
                saving ||
                !membershipSupported ||
                candidates.length === 0
              }
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#0F766E]"
            >
              {candidates.length === 0 ? (
                <option value="">No eligible staff available</option>
              ) : (
                candidates.map((person) => (
                  <option value={person.id} key={person.id}>
                    {person.name} — {person.email}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={() => void addStaff()}
              disabled={saving || !membershipSupported || !selectedStaff}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus size={17} />
              Add to team
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">
              {membershipSupported
                ? "Department members"
                : "Previously assigned staff"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Workload counts reflect currently assigned issues.
            </p>
          </div>
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-gray-500">
              {membershipSupported
                ? "No staff members have been added to this department."
                : "No maintenance staff with existing assignments were found for this department."}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {staff.map((person) => (
                <div
                  key={person.staff_id ?? person.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {person.image ? (
                      <img
                        src={person.image}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-[#0F766E]">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {person.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {person.email}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        person.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {person.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>
                        <strong className="text-gray-800">
                          {person.active_task_count ?? 0}
                        </strong>{" "}
                        active
                      </span>
                      <span>
                        <strong className="text-gray-800">
                          {person.completed_task_count ?? 0}
                        </strong>{" "}
                        completed
                      </span>
                    </div>
                    {membershipSupported && person.is_active && (
                      <button
                        onClick={() => void deactivateStaff(person)}
                        disabled={saving}
                        aria-label={`Remove ${person.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <UserX size={15} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
