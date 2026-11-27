
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CalendarDays,
  UserRound,
  Users,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  Mail,
  AlertTriangle,
  Check,
} from "lucide-react";
import {
  assignManagerIssue,
  closeManagerIssue,
  getManagerIssueDetails,
  getManagerStaff,
  rejectManagerIssue,
  setManagerIssuePriority,
  verifyManagerIssue,
  type IssuePriority,
  type StaffMember,
} from "@/services/issue-workflow.service";

type AssignedStaff = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  assignedAt: string;
};

type IssueDetails = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  reporter_id: string;
  status: string;
  priority: IssuePriority | null;
  created_at: string;
  updated_at: string;
  department_id: string;
  department_name: string;
  assigned_staff: AssignedStaff[];
  status_history: Array<{
    id: string;
    previous_status: string | null;
    new_status: string;
    public_message: string | null;
    internal_reason?: string | null;
    changed_by_name?: string;
    created_at: string;
  }>;
  work_notes: Array<{
    id: string;
    note: string;
    staff_name?: string;
    created_at: string;
  }>;
  completion_photos: Array<{
    id: string;
    image_url: string;
    created_at: string;
    uploaded_by_name?: string;
  }>;
};

const issuePriorities: IssuePriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];

const getIssuePriority = (value: string): IssuePriority | "" =>
  issuePriorities.find((priority) => priority === value) ?? "";

function getStatusStyle(status: string) {
  switch (status.toLowerCase().replace(/_/g, " ")) {
    case "submitted":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "under review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "assigned":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "in progress":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "closed":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ManagerIssueDetailsContent() {
  const params = useParams<{ issueId: string }>();
  const router = useRouter();
  const issueId = params.issueId;

  const [issue, setIssue] = useState<IssueDetails | null>(null);
  const [staffCandidates, setStaffCandidates] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedPriority, setSelectedPriority] =
    useState<IssuePriority | "">("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIssueDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [issueResponse, candidateResponse] = await Promise.all([
        getManagerIssueDetails(issueId),
        getManagerStaff(),
      ]);
      setIssue(issueResponse.data);
      setSelectedPriority(issueResponse.data.priority ?? "");
      const eligibleStaff = candidateResponse.data.staff.filter(
        (staff) => staff.is_active
      );
      setStaffCandidates(eligibleStaff);
      setSelectedStaffId((current) =>
        eligibleStaff.some((staff) => staff.id === current)
          ? current
          : eligibleStaff[0]?.id ?? ""
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  const performAction = async (
    action: () => Promise<unknown>,
    message: string
  ) => {
    try {
      setSavingAction(true);
      setActionError("");
      setActionSuccess("");
      await action();
      await fetchIssueDetails();
      setActionSuccess(message);
    } catch (actionFailure) {
      setActionError(
        actionFailure instanceof Error
          ? actionFailure.message
          : "Unable to complete this operation."
      );
    } finally {
      setSavingAction(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (issueId) void fetchIssueDetails();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [issueId, fetchIssueDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5FAF9]">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-[#0F766E]"
          />
          <p className="mt-3 text-sm text-gray-500">
            Loading issue details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F5FAF9] p-5">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={36} className="mx-auto text-red-500" />

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Unable to load issue
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Issue not found"}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
            >
              Go Back
            </button>

            <button
              onClick={fetchIssueDetails}
              className="rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasCoordinates =
    issue.latitude !== null && issue.longitude !== null;

  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
    : null;

  return (
    <div className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto container space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() =>
              router.push(
                "/dashboard/department-manager/department-issues"
              )
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0F766E]"
          >
            <ArrowLeft size={17} />
            Back to Issues
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0F766E]">
                <ClipboardList size={17} />
                Issue Details
              </div>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {issue.title}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Issue ID: {issue.id}
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                issue.status
              )}`}
            >
              {formatStatus(issue.status)}
            </span>
          </div>
        </div>

        <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-teal-50 p-2.5 text-[#0F766E]">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Issue operations</h2>
              <p className="mt-1 text-sm text-gray-500">
                Available actions are limited by the current workflow status.
              </p>
            </div>
          </div>

          {actionError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <Check size={17} />
              {actionSuccess}
            </div>
          )}

          {(issue.status === "submitted" ||
            issue.status === "pending" ||
            issue.status === "under_review") && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">
              {(issue.status === "submitted" || issue.status === "pending") && (
                <button
                  disabled={savingAction}
                  onClick={() =>
                    void performAction(
                      () => verifyManagerIssue(issue.id),
                      "Issue moved to under review."
                    )
                  }
                  className="rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Verify report
                </button>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                <input
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  maxLength={2000}
                  placeholder="Reason required to reject"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0F766E]"
                />
                <button
                  disabled={savingAction || !rejectionReason.trim()}
                  onClick={() =>
                    void performAction(
                      () => rejectManagerIssue(issue.id, rejectionReason.trim()),
                      "Issue rejected."
                    )
                  }
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {issue.status !== "closed" && issue.status !== "rejected" && (
            <div className="grid gap-3 border-t border-gray-100 pt-4 md:grid-cols-2">
              <div className="flex gap-2">
                <select
                  value={selectedPriority}
                  disabled={savingAction}
                  onChange={(event) =>
                    setSelectedPriority(getIssuePriority(event.target.value))
                  }
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  aria-label="Issue priority"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button
                  disabled={
                    savingAction ||
                    !selectedPriority ||
                    selectedPriority === issue.priority
                  }
                  onClick={() =>
                    selectedPriority &&
                    void performAction(
                      () =>
                        setManagerIssuePriority(issue.id, selectedPriority),
                      "Priority updated."
                    )
                  }
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Set priority
                </button>
              </div>

              {(issue.status === "under_review" ||
                issue.status === "assigned") && (
                <div className="flex gap-2">
                  <select
                    value={selectedStaffId}
                    disabled={savingAction || staffCandidates.length === 0}
                    onChange={(event) => setSelectedStaffId(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                    aria-label="Maintenance staff assignment"
                  >
                    {staffCandidates.length === 0 ? (
                      <option value="">No active department staff</option>
                    ) : (
                      staffCandidates.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    disabled={savingAction || !selectedStaffId}
                    onClick={() =>
                      void performAction(
                        () => assignManagerIssue(issue.id, selectedStaffId),
                        "Maintenance staff assigned."
                      )
                    }
                    className="rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          )}

          {issue.status === "resolved" && (
            <div className="border-t border-gray-100 pt-4">
              <button
                disabled={savingAction}
                onClick={() =>
                  void performAction(
                    () => closeManagerIssue(issue.id),
                    "Issue closed successfully."
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <CheckCircle2 size={17} />
                Review and close
              </button>
            </div>
          )}

          {(issue.status === "closed" || issue.status === "rejected") && (
            <p className="border-t border-gray-100 pt-4 text-sm text-gray-500">
              This issue is {formatStatus(issue.status).toLowerCase()} and is
              read-only in the standard workflow.
            </p>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Issue Description
              </h2>

              <div className="mt-4">
                <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-[#0F766E]">
                  {issue.category}
                </span>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {issue.description || "No description provided."}
              </p>
            </section>

            {/* Image */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <ImageIcon size={19} className="text-[#0F766E]" />
                <h2 className="text-lg font-bold text-gray-900">
                  Issue Image
                </h2>
              </div>

              {issue.image_url ? (
                <a
                  href={issue.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={issue.image_url}
                    alt={issue.title}
                    className="max-h-[420px] w-full rounded-xl border border-gray-100 object-cover"
                  />
                </a>
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                  <ImageIcon size={35} />
                  <p className="mt-2 text-sm">No image uploaded</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Status history
              </h2>
              {issue.status_history.length > 0 ? (
                <ol className="mt-5 space-y-4">
                  {issue.status_history.map((event) => (
                    <li key={event.id} className="flex gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
                        <CheckCircle2 size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {event.previous_status
                            ? `${formatStatus(event.previous_status)} → `
                            : ""}
                          {formatStatus(event.new_status)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {event.changed_by_name} · {formatDate(event.created_at)}
                        </p>
                        {event.public_message && (
                          <p className="mt-1 text-sm text-gray-600">
                            {event.public_message}
                          </p>
                        )}
                        {event.internal_reason && (
                          <p className="mt-1 rounded bg-amber-50 p-2 text-sm text-amber-800">
                            Internal reason: {event.internal_reason}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  No status changes have been recorded for this issue yet.
                </p>
              )}
            </section>

            {issue.work_notes.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Maintenance notes
                </h2>
                <ul className="mt-4 space-y-3">
                  {issue.work_notes.map((workNote) => (
                    <li
                      key={workNote.id}
                      className="rounded-xl bg-gray-50 p-4"
                    >
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {workNote.note}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        {workNote.staff_name || "Staff"} · {formatDate(workNote.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {issue.completion_photos.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Completion photos
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {issue.completion_photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <img
                        src={photo.image_url}
                        alt={`Completion evidence submitted by ${photo.uploaded_by_name || "staff"}`}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                      <span className="mt-1 block text-xs text-gray-500">
                        {photo.uploaded_by_name || "Staff"} · {formatDate(photo.created_at)}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Location */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin size={19} className="text-[#0F766E]" />
                <h2 className="text-lg font-bold text-gray-900">
                  Issue Location
                </h2>
              </div>

              <p className="text-sm leading-6 text-gray-600">
                {issue.location_address || "No address provided"}
              </p>

              {hasCoordinates && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">GPS Coordinates</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {issue.latitude}, {issue.longitude}
                  </p>

                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline"
                    >
                      <MapPin size={15} />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Department */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">
                Department Information
              </h2>

              <div className="mt-4 rounded-xl bg-teal-50 p-4">
                <p className="text-xs font-medium text-teal-700">
                  Assigned Department
                </p>
                <p className="mt-2 font-bold text-[#134E4A]">
                  {issue.department_name}
                </p>
              </div>
            </section>

            {/* Reporter */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <UserRound size={18} className="text-[#0F766E]" />
                <h2 className="font-bold text-gray-900">
                  Reporter Information
                </h2>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500">Reporter ID</p>
                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                  {issue.reporter_id}
                </p>
              </div>
            </section>

            {/* Assigned staff */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#0F766E]" />
                <h2 className="font-bold text-gray-900">
                  Assigned Staff
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                {issue.assigned_staff.length > 0 ? (
                  issue.assigned_staff.map((staff) => (
                    <div key={staff.id} className="flex items-start gap-3">
                      {staff.image ? (
                        <img
                          src={staff.image}
                          alt={staff.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 font-bold text-[#0F766E]">
                          {staff.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {staff.name}
                        </p>
                        <p className="mt-1 flex items-center gap-1 break-all text-xs text-gray-500">
                          <Mail size={12} />
                          {staff.email}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Assigned: {formatDate(staff.assignedAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                    No staff assigned to this issue yet.
                  </p>
                )}
              </div>
            </section>

            {/* Timestamps */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">
                Timeline Information
              </h2>

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={17}
                    className="mt-0.5 text-[#0F766E]"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Reported At</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {formatDate(issue.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RefreshCw
                    size={17}
                    className="mt-0.5 text-[#0F766E]"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {formatDate(issue.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function ManagerIssueDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-[#F5FAF9]">
          <p className="text-sm text-gray-500">Loading issue details...</p>
        </div>
      }
    >
      <ManagerIssueDetailsContent />
    </Suspense>
  );
}
