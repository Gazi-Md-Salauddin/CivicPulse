"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, parseApiResponse } from "@/services/api";
import {
  Search,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  Users,
} from "lucide-react";

type AssignedStaff = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  assignedAt: string;
};

type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  reporter_id: string;
  priority: "low" | "medium" | "high" | "critical" | null;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_staff: AssignedStaff[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type IssuesResponse = {
  success: boolean;
  message: string;
  data: {
    department?: {
      id: string;
      name: string;
    };
    issues: Issue[];
    pagination: Pagination;
  };
};

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
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ManagerIssuesPage() {
  const router = useRouter();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [departmentName, setDepartmentName] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (status !== "All") {
        params.set("status", status.toLowerCase().replace(/\s+/g, "_"));
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        apiUrl(`manager/departmentissues?${params.toString()}`),
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await parseApiResponse<IssuesResponse>(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load issues");
      }

      setIssues(result.data.issues || []);
      setDepartmentName(result.data.department?.name || "");
      setPagination(result.data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIssues();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchIssues]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto container space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0F766E]">
              <ClipboardList size={17} />
              Department Management
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Department Issues
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor issues reported to your department.
            </p>

            {departmentName && (
              <p className="mt-2 text-sm font-semibold text-[#0F766E]">
                {departmentName}
              </p>
            )}
          </div>

          <button
            onClick={fetchIssues}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Issues</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {pagination.total}
                </h2>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-[#0F766E]">
                <ClipboardList size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Page</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {pagination.page} / {pagination.totalPages || 1}
                </h2>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Eye size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Assigned Staff</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {issues.reduce(
                    (total, issue) =>
                      total + issue.assigned_staff.length,
                    0
                  )}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Assignments on this page
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <Users size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by title, description or location..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statuses.map((item) => (
                <button
                  key={item}
                  onClick={() => handleStatusChange(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    status === item
                      ? "bg-[#0F766E] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load issues</p>
              <p className="mt-1">{error}</p>
              <button
                onClick={fetchIssues}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Issue List */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-gray-900">Issue Queue</h2>
              <p className="mt-1 text-xs text-gray-500">
                {pagination.total} issue(s) found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : !error && issues.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#0F766E]">
                <ClipboardList size={27} />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                No issues found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No issues match your current search or filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Issue</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Location</th>
                      <th className="px-5 py-4 font-semibold">Assigned Staff</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Reported</th>
                      <th className="px-5 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className="transition hover:bg-gray-50/80"
                      >
                        <td className="max-w-xs px-5 py-4">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {issue.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                            {issue.description}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-[#0F766E]">
                            {issue.category}
                          </span>
                        </td>

                        <td className="max-w-[190px] px-5 py-4">
                          <div className="flex items-start gap-1.5 text-xs text-gray-600">
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                              {issue.location_address || "Not provided"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {issue.assigned_staff.length > 0 ? (
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {issue.assigned_staff[0].name}
                              </p>
                              {issue.assigned_staff.length > 1 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  +{issue.assigned_staff.length - 1} more
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              issue.status
                            )}`}
                          >
                            {formatStatus(issue.status)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                          {formatDate(issue.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/department-manager/department-issues/${issue.id}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-[#0F766E] transition hover:bg-[#0F766E] hover:text-white"
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

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-bold text-gray-900">
                          {issue.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {issue.category}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusStyle(
                          issue.status
                        )}`}
                      >
                        {formatStatus(issue.status)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">
                      {issue.description}
                    </p>

                    <div className="mt-3 space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span className="line-clamp-1">
                          {issue.location_address || "Location not provided"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        {formatDate(issue.created_at)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        {issue.assigned_staff.length > 0
                          ? issue.assigned_staff.map((staff) => staff.name).join(", ")
                          : "Not assigned"}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/department-manager/department-issues/${issue.id}`
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#134E4A]"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Showing page {pagination.page} of {pagination.totalPages}
                {" "}({pagination.total} total issues)
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-[#0F766E]">
                  {pagination.page}
                </span>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
