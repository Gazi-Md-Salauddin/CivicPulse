"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getAdminDepartmentIssueOverview,
  getAdminIssueDetails,
  getAdminIssues,
  type AdminDepartmentOverview,
  type WorkflowIssue,
} from "@/services/issue-workflow.service";

const statuses = [
  "All",
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
];

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 ring-amber-200",
    submitted: "bg-amber-100 text-amber-800 ring-amber-200",
    under_review: "bg-yellow-100 text-yellow-800 ring-yellow-200",
    assigned: "bg-blue-100 text-blue-800 ring-blue-200",
    in_progress: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    resolved: "bg-green-100 text-green-800 ring-green-200",
    closed: "bg-gray-100 text-gray-700 ring-gray-200",
    rejected: "bg-red-100 text-red-800 ring-red-200",
  };

  return colors[status.toLowerCase()] || "bg-gray-100 text-gray-700 ring-gray-200";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function IssueDetailsDialog({
  issue,
  onClose,
}: {
  issue: WorkflowIssue;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Issue details"
    >
      <div className="my-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
          <div>
            <p className="text-xs text-gray-400">Issue ID: {issue.id}</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {issue.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {formatLabel(issue.status)} · {issue.department_name || "No department"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close issue details"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-5 sm:p-6">
          <section>
            <h3 className="text-sm font-bold text-gray-900">Report</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {issue.description || "No description provided."}
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Reporter</dt>
                <dd className="mt-1 text-gray-700">
                  {issue.reporter_name || "Unknown"}
                  {issue.reporter_email ? ` (${issue.reporter_email})` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Priority</dt>
                <dd className="mt-1 text-gray-700">
                  {issue.priority ? formatLabel(issue.priority) : "Not assigned"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Location</dt>
                <dd className="mt-1 text-gray-700">
                  {issue.location_address || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Assigned staff</dt>
                <dd className="mt-1 text-gray-700">
                  {issue.assigned_staff_name || "Not assigned"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-gray-900">
              Complete status history
            </h3>
            {issue.status_history?.length ? (
              <ol className="mt-4 space-y-4">
                {issue.status_history.map((event) => (
                  <li
                    key={event.id}
                    className="border-l-2 border-teal-100 pl-4"
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {event.previous_status
                        ? `${formatLabel(event.previous_status)} → `
                        : ""}
                      {formatLabel(event.new_status)}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {event.changed_by_name || "System"} ·{" "}
                      {formatDate(event.created_at)}
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
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No status history exists for this issue.
              </p>
            )}
          </section>

          {issue.work_notes?.length ? (
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-900">
                Maintenance notes
              </h3>
              <ul className="mt-3 space-y-3">
                {issue.work_notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-gray-50 p-3">
                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {note.note}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {note.staff_name} · {formatDate(note.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {issue.completion_photos?.length ? (
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-900">
                Completion photos
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {issue.completion_photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={photo.image_url}
                      alt={`Completion evidence submitted by ${photo.uploaded_by_name || "staff"}`}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminIssueManagementPage() {
  const [issues, setIssues] = useState<WorkflowIssue[]>([]);
  const [departments, setDepartments] = useState<AdminDepartmentOverview[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<WorkflowIssue | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [issueResponse, departmentResponse] = await Promise.all([
        getAdminIssues({
          page,
          limit: 20,
          status:
            status === "All"
              ? undefined
              : status.toLowerCase().replace(/\s+/g, "_"),
          search,
        }),
        getAdminDepartmentIssueOverview(),
      ]);
      setIssues(issueResponse.data.issues);
      setTotal(issueResponse.data.pagination.total);
      setTotalPages(issueResponse.data.pagination.totalPages);
      setDepartments(departmentResponse.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load system issue data."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => void loadData(), 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const openIssue = async (issueId: string) => {
    try {
      setDetailLoading(true);
      setError("");
      const response = await getAdminIssueDetails(issueId);
      setSelectedIssue(response.data);
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Unable to load issue details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const totals = departments.reduce(
    (aggregate, department) => ({
      issues: aggregate.issues + department.total_issues,
      active:
        aggregate.active +
        department.submitted_issues +
        department.under_review_issues +
        department.assigned_issues +
        department.in_progress_issues,
      resolved: aggregate.resolved + department.resolved_issues,
    }),
    { issues: 0, active: 0, resolved: 0 }
  );

  return (
    <main className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto container space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F766E]">
              System administration
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Issue management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              System-wide issue queue and department performance.
            </p>
          </div>
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </span>
            <button onClick={() => void loadData()} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Issues by department", totals.issues],
            ["Active workflow", totals.active],
            ["Resolved", totals.resolved],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-bold text-gray-900">Department overview</h2>
            {departments.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {departments.map((department) => (
                  <div
                    key={department.department_id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {department.department_name}
                      </p>
                      <span className="text-xs text-gray-400">
                        {department.total_issues} total
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {department.submitted_issues} submitted ·{" "}
                      {department.assigned_issues + department.in_progress_issues} active ·{" "}
                      {department.resolved_issues + department.closed_issues} resolved/closed
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No department issue statistics are available.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search title, location, reporter, or ID"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0F766E]"
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700"
              aria-label="Filter by status"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All statuses" : item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : issues.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Issue</th>
                    <th className="px-5 py-3 font-semibold">Department</th>
                    <th className="px-5 py-3 font-semibold">Reporter</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Reported</th>
                    <th className="px-5 py-3 text-right font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="max-w-xs px-5 py-4">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {issue.id} · {formatLabel(issue.category)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {issue.department_name || "Unassigned"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {issue.reporter_name || "Unknown"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusColor(issue.status)}`}
                        >
                          {formatLabel(issue.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                        {formatDate(issue.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => void openIssue(issue.id)}
                          disabled={detailLoading}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-[#0F766E] disabled:opacity-50"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-14 text-center text-sm text-gray-500">
              No issues match the current search or status filter.
            </div>
          )}

          {!loading && totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
              <p className="text-xs text-gray-500">
                {total} issue(s) · Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedIssue && (
        <IssueDetailsDialog
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </main>
  );
}
