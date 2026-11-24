
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    Search,
    MapPin,
    CalendarDays,
    ArrowUpRight,
    AlertCircle,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { getAllPublicIssues } from "@/services/issue.service";
import type { IIssue } from "@/types/issue.types";

// Types
type IssueStatus =
    | "Submitted"
    | "Under Review"
    | "Assigned"
    | "In Progress"
    | "Resolved"
    | "Closed";

type Issue = {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    createdAt: string;
    status: IssueStatus;
    priority: "Low" | "Medium" | "High" | "Critical";
    image: string;
    reporter: string;
};

// Category Mapping
const categoryLabels: Record<string, string> = {
    road_damage: "Road Damage",
    streetlight: "Streetlight",
    drainage: "Drainage",
    footpath: "Footpath",
    waste_management: "Waste Management",
    public_infrastructure: "Public Infrastructure",
};

// Status Mapping
const statusLabels: Record<string, IssueStatus> = {
    pending: "Submitted",
    under_review: "Under Review",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Closed",
    closed: "Closed",
};

// API Data Mapping
const mapIssue = (issue: IIssue): Issue => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: categoryLabels[issue.category] ?? issue.category,
    location: issue.location_address,

    date: new Date(issue.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }),

    createdAt: issue.created_at,

    status: statusLabels[issue.status] ?? "Submitted",

    // Priority is not available in the current database.
    priority: "Medium",

    image:
        issue.image_url ||
        "https://placehold.co/900x600?text=No+Issue+Image",

    reporter: "Citizen",
});

// Filter Options
const categories = [
    "All Categories",
    "Road Damage",
    "Streetlight",
    "Drainage",
    "Footpath",
    "Waste Management",
    "Public Infrastructure",
];

const statuses = [
    "All Status",
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
];

// Status Styles
const statusStyles: Record<IssueStatus, string> = {
    Submitted: "bg-blue-50 text-blue-700",
    "Under Review": "bg-amber-50 text-amber-700",
    Assigned: "bg-purple-50 text-purple-700",
    "In Progress": "bg-cyan-50 text-cyan-700",
    Resolved: "bg-emerald-50 text-emerald-700",
    Closed: "bg-gray-100 text-gray-600",
};

// Priority Styles
const priorityStyles = {
    Low: "text-gray-500",
    Medium: "text-blue-600",
    High: "text-orange-600",
    Critical: "text-red-600",
};

export default function AllIssuesPage() {
    // API States
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter States
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [status, setStatus] = useState("All Status");
    const [priority, setPriority] = useState("All Priorities");
    const [sort, setSort] = useState("Latest");
    const [page, setPage] = useState(1);

    const pageSize = 6;

    // Fetch Public Issues
    const fetchIssues = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllPublicIssues();

            const formattedIssues = response.data.map(mapIssue);

            setIssues(formattedIssues);
            setPage(1);
        } catch (error) {
            console.error("Fetch Public Issues Error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while fetching issues."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Issues on Component Mount
    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    // Search, Filter and Sort
    const filteredIssues = useMemo(() => {
        let result = [...issues];

        // Search
        if (search.trim()) {
            const query = search.toLowerCase();

            result = result.filter(
                (issue) =>
                    issue.title.toLowerCase().includes(query) ||
                    issue.location.toLowerCase().includes(query) ||
                    issue.id.toLowerCase().includes(query)
            );
        }

        // Category Filter
        if (category !== "All Categories") {
            result = result.filter(
                (issue) => issue.category === category
            );
        }

        // Status Filter
        if (status !== "All Status") {
            result = result.filter(
                (issue) => issue.status === status
            );
        }

        // Priority Filter
        if (priority !== "All Priorities") {
            result = result.filter(
                (issue) => issue.priority === priority
            );
        }

        // Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            return sort === "Latest"
                ? dateB - dateA
                : dateA - dateB;
        });

        return result;
    }, [issues, search, category, status, priority, sort]);

    // Pagination
    const totalPages = Math.max(
        1,
        Math.ceil(filteredIssues.length / pageSize)
    );

    const currentIssues = filteredIssues.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    // Reset Filters
    const resetFilters = () => {
        setSearch("");
        setCategory("All Categories");
        setStatus("All Status");
        setPriority("All Priorities");
        setSort("Latest");
        setPage(1);
    };

    return (
        <main className="min-h-screen bg-[#F5FAF9] text-gray-800">
            <section
                id="all-issues"
                className="mx-auto container px-5 py-12 lg:px-8 lg:py-16"
            >
                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold text-[#0F766E]">
                            PUBLIC ISSUE DIRECTORY
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            All Reported Issues
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Browse infrastructure issues reported by the community.
                        </p>
                    </div>

                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-semibold text-gray-900">
                            {loading ? "..." : filteredIssues.length}
                        </span>{" "}
                        reports
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <Filter size={17} className="text-[#0F766E]" />
                        Search & Filter Issues
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

                        {/* Search */}
                        <div className="relative lg:col-span-2">
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
                                placeholder="Search title, location or ID..."
                                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
                            />
                        </div>

                        {/* Category */}
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#0F766E]"
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#0F766E]"
                        >
                            {statuses.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        {/* Priority */}
                        <select
                            value={priority}
                            onChange={(e) => {
                                setPriority(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#0F766E]"
                        >
                            <option value="All Priorities">
                                All Priorities
                            </option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>

                    {/* Reset and Sort */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <button
                            onClick={resetFilters}
                            className="text-sm font-medium text-[#0F766E] hover:underline"
                        >
                            Reset all filters
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Sort by:</span>

                            <select
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#0F766E]"
                            >
                                <option value="Latest">Latest</option>
                                <option value="Oldest">Oldest</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white"
                            >
                                <div className="h-52 bg-gray-200" />

                                <div className="space-y-4 p-5">
                                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                                    <div className="h-4 w-full rounded bg-gray-200" />
                                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                                    <div className="h-11 w-full rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
                        <AlertCircle
                            className="mx-auto text-red-500"
                            size={32}
                        />

                        <h3 className="mt-3 font-bold text-red-700">
                            Failed to Load Issues
                        </h3>

                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={fetchIssues}
                            className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Issue Cards */}
                {!loading && !error && currentIssues.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {currentIssues.map((issue) => (
                            <article
                                key={issue.id}
                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Image */}
                                <div className="relative h-52 overflow-hidden bg-gray-100">
                                    <img
                                        src={issue.image}
                                        alt={issue.title}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />

                                    <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                                        {issue.category}
                                    </span>

                                    <span
                                        className={`absolute right-4 top-4 rounded-lg px-3 py-1.5 text-xs font-semibold ${statusStyles[issue.status]}`}
                                    >
                                        {issue.status}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="mb-3 flex items-center justify-between gap-2">

                                        <span
                                            className={`text-xs font-semibold ${priorityStyles[issue.priority]}`}
                                        >
                                            {issue.priority} Priority
                                        </span>
                                    </div>

                                    <h3 className="line-clamp-1 text-lg font-bold text-gray-900 transition group-hover:text-[#0F766E]">
                                        {issue.title}
                                    </h3>

                                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-gray-500">
                                        {issue.description}
                                    </p>

                                    {/* Location and Date */}
                                    <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <MapPin
                                                size={15}
                                                className="shrink-0 text-[#0F766E]"
                                            />

                                            <span className="line-clamp-1">
                                                {issue.location}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <CalendarDays
                                                size={15}
                                                className="shrink-0 text-[#0F766E]"
                                            />

                                            <span>{issue.date}</span>
                                        </div>
                                    </div>

                                    {/* Details Link */}
                                    <Link
                                        href={`/citizen-all-issue/${issue.id}`}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#0F766E]/20 bg-[#F0FDFA] py-3 text-sm font-semibold text-[#0F766E] transition hover:bg-[#0F766E] hover:text-white"
                                    >
                                        View Issue Details
                                        <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && currentIssues.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
                            <Search size={25} />
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-gray-900">
                            No issues found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            Try changing your search or filter criteria.
                        </p>

                        <button
                            onClick={resetFilters}
                            className="mt-5 rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59]"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filteredIssues.length > 0 && (
                    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-800">
                                {(page - 1) * pageSize + 1}-
                                {Math.min(
                                    page * pageSize,
                                    filteredIssues.length
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-800">
                                {filteredIssues.length}
                            </span>{" "}
                            issues
                        </p>

                        <div className="flex items-center gap-2">
                            <button
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
        </main>
    );
}
