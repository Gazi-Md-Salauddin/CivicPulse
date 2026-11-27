
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiUrl, parseApiResponse } from "@/services/api";
import { authClient } from "@/lib/auth-client";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardList,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

// Types

type Department = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  status?: string;
  manager_id?: string | null;
};

type Issue = {
  id: string;
  title: string;
  description?: string;
  category: string;
  location_address?: string;
  location?: string;
  status: string;
  reporter_name?: string;
  reporter?: string;
  assigned_staff_name?: string | null;
  assignedTo?: string | null;
  created_at?: string;
  createdAt?: string;
};

type DashboardStats = {
  totalIssues: number;
  pendingIssues: number;
  underReviewIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  assignedStaffCount: number;
  activeTasks: number;
  completedTasks: number;
};

type DashboardData = {
  department: Department;
  statistics: DashboardStats;
  recentIssues: Issue[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data: DashboardData;
};

// Helpers

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const statusStyles: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700",
  pending: "bg-blue-50 text-blue-700",
  "under review": "bg-amber-50 text-amber-700",
  assigned: "bg-violet-50 text-violet-700",
  "in progress": "bg-cyan-50 text-cyan-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-gray-100 text-gray-600",
};

const getStatusStyle = (status: string) => {
  return (
    statusStyles[status.toLowerCase().replace(/_/g, " ")] ||
    "bg-gray-100 text-gray-600"
  );
};

const getInitials = (name?: string | null) => {
  if (!name) return "NA";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};

// Dashboard Component

export default function DepartmentManagerDashboard() {
  // States

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch Dashboard

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Get JWT from Better Auth

      const { data, error: tokenError } =
        await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error(
          tokenError?.message ||
            "Unable to retrieve authentication token. Please login again."
        );
      }

      // 2. Send JWT to Express Backend

      const response = await fetch(
        apiUrl("manager/dashboard"),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      // 3. Parse Response

      const result =
        await parseApiResponse<ApiResponse>(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load manager dashboard."
        );
      }

      // 4. Update Dashboard

      setDashboard(result.data);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Fetch

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Dashboard Data

  const department = dashboard?.department;
  const stats = dashboard?.statistics;
  const issues = dashboard?.recentIssues || [];

  // Search and Filters

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        issue.title?.toLowerCase().includes(searchText) ||
        issue.id?.toLowerCase().includes(searchText) ||
        issue.category?.toLowerCase().includes(searchText) ||
        issue.location_address?.toLowerCase().includes(searchText) ||
        issue.location?.toLowerCase().includes(searchText);

      const normalizedStatus = issue.status
        ?.toLowerCase()
        .replace(/_/g, " ");

      const matchesStatus =
        statusFilter === "All" ||
        normalizedStatus === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [issues, search, statusFilter]);

  // Statistics

  const statCards = [
    {
      title: "Department Issues",
      value: stats?.totalIssues ?? 0,
      description: "Total department issues",
      icon: <ClipboardList size={21} />,
      color: "bg-teal-50 text-[#0F766E]",
    },
    {
      title: "Pending Review",
      value:
        (stats?.pendingIssues ?? 0) +
        (stats?.underReviewIssues ?? 0),
      description: "Waiting for verification",
      icon: <Clock3 size={21} />,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "In Progress",
      value: stats?.inProgressIssues ?? 0,
      description: "Currently being resolved",
      icon: <Wrench size={21} />,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Resolved",
      value:
        (stats?.resolvedIssues ?? 0) +
        (stats?.closedIssues ?? 0),
      description: "Successfully completed",
      icon: <CheckCircle2 size={21} />,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Maintenance Staff",
      value: stats?.assignedStaffCount ?? 0,
      description: "Assigned department staff",
      icon: <Users size={21} />,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  const resolvedCount =
    (stats?.resolvedIssues ?? 0) +
    (stats?.closedIssues ?? 0);

  const totalIssues = stats?.totalIssues ?? 0;

  const resolutionRate =
    totalIssues > 0
      ? Math.round((resolvedCount / totalIssues) * 100)
      : 0;

  // Loading State

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5FAF9]">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-[#0F766E]"
          />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading department dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error State

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5FAF9] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle
            size={40}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Unable to Load Dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#115E59]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  // Main UI

  return (
    <div className="min-h-screen bg-[#F5FAF9]">
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto">

          {/* Header */}

          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                <span>Dashboard</span>
                <ChevronRight size={14} />
                <span className="font-medium text-[#0F766E]">
                  Department Overview
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Department Dashboard
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Monitor issues, manage staff and track department operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                <CalendarDays size={17} className="text-[#0F766E]" />
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              <button
                onClick={fetchDashboard}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 hover:border-[#0F766E] hover:text-[#0F766E]"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <Link
                href="/dashboard/department-manager/department-issues"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59]"
              >
                <ClipboardList size={17} />
                Manage Issues
              </Link>
            </div>
          </div>

          {/* Department Banner */}

          <div className="mb-7 overflow-hidden rounded-2xl bg-[#134E4A] p-5 text-white sm:p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-teal-300" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                    Department Workspace
                  </span>
                </div>

                <h2 className="text-xl font-bold sm:text-2xl">
                  {department?.name || "Department"}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-teal-100">
                  {department?.description ||
                    "Manage department issues, coordinate maintenance staff and ensure timely resolution of citizen reports."}
                </p>

                {department?.location && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-teal-200">
                    <MapPin size={14} />
                    {department.location}
                  </p>
                )}
              </div>

              <div className="flex gap-5 sm:gap-7">
                <div>
                  <p className="text-3xl font-bold">
                    {stats?.assignedStaffCount ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-teal-200">
                    Assigned Staff
                  </p>
                </div>

                <div className="h-12 w-px bg-white/20" />

                <div>
                  <p className="text-3xl font-bold">
                    {Math.max(totalIssues - resolvedCount, 0)}
                  </p>
                  <p className="mt-1 text-xs text-teal-200">
                    Unresolved Issues
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {statCards.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold text-gray-900">
                      {stat.value}
                    </h2>
                  </div>

                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>
            ))}
          </section>

          {/* Overview Panels */}

          <section className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Status Overview */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Issue Status Overview
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Current department issue distribution
                  </p>
                </div>
                <Activity size={20} className="text-[#0F766E]" />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { title: "Submitted", value: stats?.pendingIssues ?? 0, color: "bg-blue-500" },
                  { title: "Under Review", value: stats?.underReviewIssues ?? 0, color: "bg-amber-500" },
                  { title: "In Progress", value: stats?.inProgressIssues ?? 0, color: "bg-cyan-500" },
                  { title: "Resolved", value: stats?.resolvedIssues ?? 0, color: "bg-emerald-500" },
                  { title: "Closed", value: stats?.closedIssues ?? 0, color: "bg-gray-500" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs font-medium text-gray-500">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-gray-900">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">Issues</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Rate */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Resolution Rate
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Overall department progress
                  </p>
                </div>
                <Activity size={20} className="text-[#0F766E]" />
              </div>

              <div className="mt-7 flex items-center justify-center">
                <div
                  className="relative flex h-36 w-36 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#0F766E ${resolutionRate * 3.6}deg, #E5E7EB 0deg)`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <p className="text-3xl font-bold text-gray-900">
                      {resolutionRate}%
                    </p>
                    <p className="text-[10px] text-gray-400">Resolved</p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-gray-500">
                {resolvedCount} out of {totalIssues} issues completed
              </p>
            </div>
          </section>

          {/* Recent Issues */}

          <section className="mb-7 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Department Issues
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review and monitor recently reported issues.
                </p>
              </div>

              <Link
                href="/dashboard/department-manager/department-issues"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline"
              >
                View All Issues
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Filters */}

            <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search issue, ID or location..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Filter
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-11 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-600 outline-none focus:border-[#0F766E]"
                  >
                    <option value="All">All Status</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Table */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Issue Details</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Assigned Staff</th>
                    <th className="px-5 py-4 font-semibold">Reported</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredIssues.map((issue) => {
                    const assignedName =
                      issue.assigned_staff_name || issue.assignedTo;

                    return (
                      <tr key={issue.id} className="transition hover:bg-gray-50/70">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {issue.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {issue.id} · {issue.category}
                          </p>
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={13} className="text-[#0F766E]" />
                            {issue.location_address || issue.location || "Location unavailable"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(issue.status)}`}>
                            {formatStatus(issue.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {assignedName ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#CCFBF1] text-[10px] font-bold text-[#0F766E]">
                                {getInitials(assignedName)}
                              </div>
                              <span className="text-xs font-medium text-gray-700">
                                {assignedName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-amber-600">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-gray-500">
                          {formatDate(issue.created_at || issue.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <Link
                              href={`/dashboard/department-manager/department-issues/${issue.id}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-[#0F766E] hover:text-[#0F766E]"
                              title="View issue details"
                            >
                              <ArrowUpRight size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredIssues.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
                        No issues found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}

            <div className="space-y-3 p-4 md:hidden">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0F766E]">
                        {issue.id}
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-gray-900">
                        {issue.title}
                      </h3>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(issue.status)}`}>
                      {formatStatus(issue.status)}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={14} />
                    {issue.location_address || issue.location || "Location unavailable"}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(issue.created_at || issue.createdAt)}
                    </span>
                    <Link
                      href={`/dashboard/department-manager/department-issues/${issue.id}`}
                      className="text-xs font-semibold text-[#0F766E]"
                    >
                      View Details
                      <ArrowUpRight size={14} className="ml-1 inline" />
                    </Link>
                  </div>
                </div>
              ))}

              {filteredIssues.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-500">
                  No issues found.
                </div>
              )}
            </div>
          </section>

          {/* Department Management Links */}

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#0F766E]">
                  <Users size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Maintenance Team</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {stats?.assignedStaffCount ?? 0} staff members
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                View your department&apos;s maintenance staff and manage task assignments.
              </p>
              <p className="mt-5 text-xs text-gray-400">
                Staff management is not available yet.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Activity size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Department Reports</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Department performance
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Review department issue statistics and monitor resolution progress.
              </p>
              <p className="mt-5 text-xs text-gray-400">
                Detailed analytics are not available yet.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
