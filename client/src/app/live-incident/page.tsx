// client/src/app/(public)/incident-map/page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  List,
  LoaderCircle,
  MapPin,
  MapPinned,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import IssueMap from "@/components/map/IssueMap";
import type {
  IssueMapItem,
  MapCoordinate,
} from "@/components/map/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_CENTER: MapCoordinate = {
  latitude: 23.8103,
  longitude: 90.4125,
};

type Issue = {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  priority?: string | null;
  location_address?: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    issues?: Issue[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } | Issue[];
};

const statuses = [
  "all",
  "submitted",
  "pending",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

const categories = [
  "all",
  "road_damage",
  "streetlight",
  "drainage",
  "footpath",
  "waste_management",
  "public_infrastructure",
];

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    submitted: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    under_review: "bg-purple-50 text-purple-700",
    assigned: "bg-indigo-50 text-indigo-700",
    in_progress: "bg-cyan-50 text-cyan-700",
    resolved: "bg-green-50 text-green-700",
    closed: "bg-slate-100 text-slate-600",
  };

  return styles[status] || "bg-slate-100 text-slate-600";
}

export default function IncidentMapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const [view, setView] = useState<"map" | "list">("map");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);

      const response = await fetch(
        `${API_BASE_URL}/public/issues?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load incidents.");
      }

      const responseData = result.data;

      if (Array.isArray(responseData)) {
        setIssues(responseData);
        setTotal(responseData.length);
        setTotalPages(1);
      } else {
        setIssues(responseData?.issues || []);
        setTotal(responseData?.pagination?.total || 0);
        setTotalPages(
          Math.max(1, responseData?.pagination?.totalPages || 1)
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchIssues();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchIssues]);

  useEffect(() => {
    setPage(1);
  }, [search, status, category]);

  const mapIssues = useMemo<IssueMapItem[]>(
    () =>
      issues
        .filter(
          (issue) =>
            issue.latitude !== null &&
            issue.longitude !== null &&
            Number.isFinite(Number(issue.latitude)) &&
            Number.isFinite(Number(issue.longitude)) &&
            Math.abs(Number(issue.latitude)) <= 90 &&
            Math.abs(Number(issue.longitude)) <= 180
        )
        .map((issue) => ({
          id: issue.id,
          title: issue.title,
          category: formatLabel(issue.category),
          status: formatLabel(issue.status),
          locationAddress: issue.location_address,
          coordinate: {
            latitude: Number(issue.latitude),
            longitude: Number(issue.longitude),
          },
          href: `/issues/${issue.id}`,
        })),
    [issues]
  );

  const stats = useMemo(
    () => ({
      total: issues.length,
      active: issues.filter(
        (issue) =>
          !["resolved", "closed", "rejected"].includes(issue.status)
      ).length,
      resolved: issues.filter(
        (issue) => issue.status === "resolved"
      ).length,
      located: mapIssues.length,
    }),
    [issues, mapIssues]
  );

  return (
    <main className="min-h-screen bg-[#F5FAF9] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto container space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-700">
              <MapPinned size={17} />
              CivicPulse Public Monitoring
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Live Incidents
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Explore reported infrastructure issues across the city
              and monitor their resolution progress.
            </p>
          </div>

          <button
            onClick={() => void fetchIssues()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total incidents",
              value: total,
              icon: MapPin,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Active on this page",
              value: stats.active,
              icon: AlertCircle,
              color: "text-amber-600 bg-amber-50",
            },
            {
              label: "Resolved on this page",
              value: stats.resolved,
              icon: Layers,
              color: "text-green-600 bg-green-50",
            },
            {
              label: "Mapped incidents",
              value: stats.located,
              icon: MapPinned,
              color: "text-teal-600 bg-teal-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 sm:text-sm">
                  {item.label}
                </span>
                <span className={`rounded-lg p-2 ${item.color}`}>
                  <item.icon size={18} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={17} className="text-teal-700" />
            <h2 className="font-semibold text-slate-900">
              Search and filters
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-600"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All statuses" : formatLabel(item)}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-600"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All categories" : formatLabel(item)}
                </option>
              ))}
            </select>
          </div>

          {(search || status !== "all" || category !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setCategory("all");
              }}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </section>

        {/* Map / List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                Incident locations
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {mapIssues.length} incidents with valid GPS coordinates
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setView("map")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  view === "map"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <MapPinned size={16} />
                Map
              </button>

              <button
                onClick={() => setView("list")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  view === "list"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>

          {error && (
            <div className="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
              <button
                onClick={() => void fetchIssues()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[440px] items-center justify-center gap-3 text-sm text-slate-500">
              <LoaderCircle className="animate-spin text-teal-700" />
              Loading incidents...
            </div>
          ) : !error && view === "map" ? (
            mapIssues.length > 0 ? (
              <div className="p-3 sm:p-4">
                <IssueMap
                  issues={mapIssues}
                  center={DEFAULT_CENTER}
                  zoom={12}
                  className="h-[440px] sm:h-[550px]"
                />

                <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-blue-500" />
                    In progress
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-green-500" />
                    Resolved
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
                <MapPin size={35} className="text-slate-300" />
                <h3 className="mt-3 font-semibold text-slate-800">
                  No mapped incidents
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  No incidents with valid GPS coordinates were found.
                </p>
              </div>
            )
          ) : !error && (
            <div className="divide-y divide-slate-100">
              {issues.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-500">
                  No incidents found.
                </div>
              ) : (
                issues.map((issue) => (
                  <article
                    key={issue.id}
                    className="flex flex-col justify-between gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {issue.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(issue.status)}`}
                        >
                          {formatLabel(issue.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatLabel(issue.category)}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} />
                        {issue.location_address || "Location unavailable"}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <CalendarDays size={13} />
                        {formatDate(issue.created_at)}
                      </p>
                    </div>

                    <Link
                      href={`/issues/${issue.id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      View details
                      <ArrowRight size={15} />
                    </Link>
                  </article>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && (
            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                {total} total incidents · Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-slate-400">
          Incident locations are displayed using OpenStreetMap.
          Map availability depends on your internet connection.
        </p>
      </div>
    </main>
  );
}