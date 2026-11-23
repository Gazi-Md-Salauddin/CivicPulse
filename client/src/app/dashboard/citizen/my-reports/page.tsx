
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Eye,
  RefreshCw,
} from "lucide-react";

import { getIssues } from "@/services/issue.service";
import type { IIssue } from "@/types/issue.types";

// Types
type IssueStatus =
  | "Submitted"
  | "Under Review"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Rejected";

type IssuePriority = "Low" | "Medium" | "High" | "Critical";

type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: IssueStatus;
  priority: IssuePriority;
  image: string;
};

// Status Styles
const statusStyles: Record<IssueStatus, string> = {
  Submitted: "bg-blue-50 text-blue-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Assigned: "bg-purple-50 text-purple-700",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-gray-100 text-gray-600",
  Rejected: "bg-red-50 text-red-700",
};

// Priority Styles
const priorityStyles: Record<IssuePriority, string> = {
  Low: "text-gray-500",
  Medium: "text-blue-600",
  High: "text-orange-600",
  Critical: "text-red-600",
};

// Category Mapping
const categoryMap: Record<string, string> = {
  road_damage: "Road Damage",
  streetlight: "Streetlight",
  drainage: "Drainage",
  footpath: "Footpath",
  waste_management: "Waste Management",
  public_infrastructure: "Public Infrastructure",
};

// Status Mapping
const statusMap: Record<string, IssueStatus> = {
  submitted: "Submitted",
  pending: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",
};

// API Data Mapping
function mapIssue(issue: IIssue): Issue {
  const categoryKey = String(issue.category).toLowerCase();
  const statusKey = String(issue.status).toLowerCase();

  return {
    id: String(issue.id),
    title: issue.title,
    description: issue.description,
    category: categoryMap[categoryKey] || String(issue.category),
    location: issue.location_address || "Location not available",
    date: issue.created_at,
    status: statusMap[statusKey] || "Submitted",
    priority: "Medium",
    image:
      issue.image_url ||
      "https://placehold.co/900x500?text=No+Image",
  };
}

export default function MyReportsPage() {
  // API States
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("Latest");

  // UI States
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");

  const pageSize = 4;

  // Fetch Issues
  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getIssues();

      const issueList: IIssue[] = Array.isArray(response.data)
        ? response.data
        : [];

      const formattedIssues = issueList.map(mapIssue);

      setIssues(formattedIssues);
    } catch (error) {
      console.error("Fetch Issues Error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Filter, Search and Sort
  const filteredReports = useMemo(() => {
    let result = [...issues];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.id.toLowerCase().includes(query) ||
          report.location.toLowerCase().includes(query)
      );
    }

    // Status Filter
    if (status !== "All Status") {
      result = result.filter((report) => report.status === status);
    }

    // Category Filter
    if (category !== "All Categories") {
      result = result.filter(
        (report) => report.category === category
      );
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return sort === "Latest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [issues, search, status, category, sort]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / pageSize)
  );

  const currentReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Statistics
  const totalReports = issues.length;

  const pendingReports = issues.filter(
    (report) =>
      report.status === "Submitted" ||
      report.status === "Under Review"
  ).length;

  const activeReports = issues.filter(
    (report) =>
      report.status === "Assigned" ||
      report.status === "In Progress"
  ).length;

  const resolvedReports = issues.filter(
    (report) =>
      report.status === "Resolved" ||
      report.status === "Closed"
  ).length;

  // Reset Filters
  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
    setCategory("All Categories");
    setSort("Latest");
    setPage(1);
  };

  // Format Date
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5FAF9] px-4 py-6 sm:px-6 lg:px-8">
      <div className="container mx-auto">

        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-[#0F766E]">
                My Reports
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Reports
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Track and manage all your submitted infrastructure reports.
            </p>
          </div>

          <Link
            href="/dashboard/citizen/create-issue"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
          >
            <Plus size={18} />
            Create New Report
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Total Reports"
            value={totalReports}
            description="All submitted reports"
            icon={<FileText size={21} />}
            iconClass="bg-teal-50 text-[#0F766E]"
          />

          <StatCard
            label="Pending Review"
            value={pendingReports}
            description="Waiting for review"
            icon={<Clock3 size={21} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            label="In Progress"
            value={activeReports}
            description="Being handled"
            icon={<AlertCircle size={21} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Resolved"
            value={resolvedReports}
            description="Completed reports"
            icon={<CheckCircle2 size={21} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Reports Section */}
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Section Header */}
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Your Submitted Reports
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View the status and progress of your reports.
              </p>
            </div>

            <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-[#0F766E]">
              {filteredReports.length} Reports Found
            </span>
          </div>

          {/* Filters */}
          <div className="space-y-4 border-b border-gray-100 p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

              {/* Search */}
              <div className="relative xl:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by title, ID or location..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
                />
              </div>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-[#0F766E]"
              >
                <option>All Status</option>
                <option>Submitted</option>
                <option>Under Review</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
                <option>Rejected</option>
              </select>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-[#0F766E]"
              >
                <option>All Categories</option>
                <option>Road Damage</option>
                <option>Streetlight</option>
                <option>Drainage</option>
                <option>Footpath</option>
                <option>Waste Management</option>
                <option>Public Infrastructure</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-[#0F766E] hover:underline"
              >
                Clear Filters
              </button>

              <div className="flex items-center gap-3">
                {/* Sorting */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <SlidersHorizontal size={16} />
                  <span>Sort:</span>

                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0F766E]"
                  >
                    <option>Latest</option>
                    <option>Oldest</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center rounded-lg border border-gray-200 p-1">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "grid"
                        ? "bg-[#0F766E] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    Grid
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "list"
                        ? "bg-[#0F766E] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Content */}
          <div className="p-5">

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-xl border border-gray-100"
                  >
                    <div className="h-48 bg-gray-200" />

                    <div className="space-y-3 p-5">
                      <div className="h-4 w-1/3 rounded bg-gray-200" />
                      <div className="h-5 w-2/3 rounded bg-gray-200" />
                      <div className="h-4 w-full rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error */
              <div className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertCircle size={28} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  Failed to load reports
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchIssues}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115E59]"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            ) : currentReports.length > 0 ? (
              /* Report Cards */
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 gap-5 lg:grid-cols-2"
                    : "flex flex-col gap-4"
                }
              >
                {currentReports.map((report) => (
                  <article
                    key={report.id}
                    className={`group overflow-hidden rounded-xl border border-gray-100 bg-white transition hover:border-teal-200 hover:shadow-md ${view === "list"
                        ? "flex flex-col sm:flex-row"
                        : ""
                      }`}
                  >
                    {/* Image */}
                    <div
                      className={`relative shrink-0 overflow-hidden bg-gray-100 ${view === "list"
                          ? "h-48 sm:h-auto sm:w-56"
                          : "h-48"
                        }`}
                    >
                      <img
                        src={report.image}
                        alt={report.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <span
                        className={`absolute left-3 top-3 rounded-md px-3 py-1.5 text-xs font-semibold ${statusStyles[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="mb-2">
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {report.category}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${priorityStyles[report.priority]}`}
                        >
                          {report.priority} Priority
                        </span>
                      </div>



                      <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition group-hover:text-[#0F766E]">
                        {report.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {report.description}
                      </p>

                      <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin
                            size={15}
                            className="shrink-0 text-[#0F766E]"
                          />
                          <span className="truncate">
                            {report.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-[#0F766E]"
                          />
                          <span>{formatDate(report.date)}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className="text-xs text-gray-400">
                          Submitted by you
                        </span>

                        <Link
                          href={`/dashboard/citizen/my-reports/${report.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0FDFA] px-3 py-2 text-xs font-semibold text-[#0F766E] transition hover:bg-[#0F766E] hover:text-white"
                        >
                          <Eye size={15} />
                          View Details
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
                  <FileText size={25} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No reports found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  You haven't submitted any reports yet, or no reports match your filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-sm font-semibold text-[#0F766E] hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredReports.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-5 sm:flex-row">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredReports.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {filteredReports.length}
                </span>{" "}
                reports
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((number) => (
                  <button
                    type="button"
                    key={number}
                    onClick={() => setPage(number)}
                    className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${page === number
                        ? "bg-[#0F766E] text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Help Card */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-teal-100 bg-[#ECFDF5] p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-[#134E4A]">
              Have another issue to report?
            </h3>

            <p className="mt-1 text-sm text-[#0F766E]/80">
              Help improve your community by reporting infrastructure problems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Statistics Card
function StatCard({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}
