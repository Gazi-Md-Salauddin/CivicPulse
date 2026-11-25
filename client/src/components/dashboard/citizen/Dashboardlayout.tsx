"use client";

import { useMemo, useState } from "react";
import {
    FileText,
    Plus,
    MapPin,
    Bell,
    Search,
    Clock3,
    CheckCircle2,
    Wrench,
    AlertCircle,
    ArrowUpRight,
    CalendarDays,
} from "lucide-react";
import Link from "next/link";
import type { IIssue } from "@/types/issue.types";

const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    pending: "Submitted",
    under_review: "Under Review",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    rejected: "Rejected",
};

const categoryLabels: Record<string, string> = {
    road_damage: "Road Damage",
    streetlight: "Streetlight",
    drainage: "Drainage",
    footpath: "Footpath",
    waste_management: "Waste Management",
    public_infrastructure: "Public Infrastructure",
};

const statusFilters = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
    "Rejected",
];

const formatStatus = (status: string | null | undefined) => {
    const key = status?.trim().toLowerCase().replace(/[\s-]+/g, "_") || "";

    return (
        statusLabels[key] ||
        key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
        "Unknown"
    );
};

const getStatusKey = (status: string | null | undefined) =>
    status?.trim().toLowerCase().replace(/[\s-]+/g, "_") || "unknown";

const formatCategory = (category: string) => {
    const key = category.trim().toLowerCase();

    return (
        categoryLabels[key] ||
        key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
};

const formatDate = (date: string | null | undefined) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getIssueTimestamp = (issue: IIssue) => {
    const timestamp = new Date(issue.updated_at || issue.created_at).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getUpdateIcon = (status: string | null | undefined) => {
    const statusKey = getStatusKey(status);

    if (statusKey === "resolved" || statusKey === "closed") {
        return CheckCircle2;
    }

    if (statusKey === "assigned" || statusKey === "in_progress") {
        return Wrench;
    }

    if (statusKey === "rejected") {
        return AlertCircle;
    }

    return Clock3;
};

const getUpdateColor = (status: string | null | undefined) => {
    const statusKey = getStatusKey(status);

    if (statusKey === "resolved" || statusKey === "closed") {
        return "bg-green-50 text-green-600";
    }

    if (statusKey === "assigned" || statusKey === "in_progress") {
        return "bg-orange-50 text-orange-600";
    }

    if (statusKey === "rejected") {
        return "bg-red-50 text-red-600";
    }

    return "bg-purple-50 text-purple-600";
};

function StatusBadge({ status }: { status: string | null | undefined }) {
    const styles: Record<string, string> = {
        submitted: "bg-blue-50 text-blue-700",
        pending: "bg-blue-50 text-blue-700",
        under_review: "bg-purple-50 text-purple-700",
        assigned: "bg-indigo-50 text-indigo-700",
        in_progress: "bg-orange-50 text-orange-600",
        resolved: "bg-green-50 text-green-700",
        closed: "bg-gray-100 text-gray-600",
        rejected: "bg-red-50 text-red-700",
    };
    const statusKey = getStatusKey(status);

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[statusKey] || "bg-gray-100 text-gray-600"
                }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {formatStatus(status)}
        </span>
    );
}

type CitizenDashboardProps = {
    issues: IIssue[];
};

export default function CitizenDashboard({
    issues,
}: CitizenDashboardProps) {

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const stats = [
        {
            label: "Total Reports",
            value: issues.length,
            change: "All submitted reports",
            icon: FileText,
            color: "bg-teal-50 text-teal-700",
        },
        {
            label: "Pending Reports",
            value: issues.filter((issue) =>
                ["pending", "submitted", "under_review"].includes(
                    getStatusKey(issue.status)
                )
            ).length,
            change: "Submitted or under review",
            icon: Clock3,
            color: "bg-amber-50 text-amber-600",
        },
        {
            label: "In Progress",
            value: issues.filter((issue) =>
                ["assigned", "in_progress"].includes(getStatusKey(issue.status))
            ).length,
            change: "Assigned or being handled",
            icon: Wrench,
            color: "bg-purple-50 text-purple-600",
        },
        {
            label: "Resolved Reports",
            value: issues.filter((issue) =>
                ["resolved", "closed"].includes(getStatusKey(issue.status))
            ).length,
            change: "Resolved or closed",
            icon: CheckCircle2,
            color: "bg-green-50 text-green-600",
        },
    ];

    const filteredReports = useMemo(() => {
        const query = search.trim().toLowerCase();

        return issues.filter((issue) => {
            const matchesSearch =
                !query ||
                [
                    issue.title,
                    issue.id,
                    issue.location_address,
                    formatCategory(issue.category),
                ].some((value) => value.toLowerCase().includes(query));

            const matchesFilter =
                filter === "All" || formatStatus(issue.status) === filter;

            return matchesSearch && matchesFilter;
        });
    }, [filter, issues, search]);

    const recentUpdates = useMemo(
        () =>
            [...issues]
                .sort((first, second) => getIssueTimestamp(second) - getIssueTimestamp(first))
                .slice(0, 3),
        [issues]
    );

    const categoryCounts = useMemo(() => {
        const counts = issues.reduce<Record<string, number>>((result, issue) => {
            const category = formatCategory(issue.category || "Unknown");
            result[category] = (result[category] || 0) + 1;
            return result;
        }, {});

        return Object.entries(counts).sort((first, second) => second[1] - first[1]);
    }, [issues]);

    const maxCategoryCount = categoryCounts[0]?.[1] || 1;

    return (
        <div className="bg-[#F5FAF9] text-slate-800 container mx-auto">

            {/* Main Content */}
            <main className="min-h-screen">

                {/* Dashboard Body */}
                <div className="mx-auto container space-y-7 p-5 sm:p-8">

                    {/* Welcome Section */}
                    <section className="flex flex-col justify-between gap-5 rounded-2xl bg-linear-to-r from-[#134E4A] to-[#0F766E] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
                        <div>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Welcome back, Citizen!
                            </h1>

                            <p className="mt-2 max-w-lg text-sm leading-6 text-teal-50/80">
                                Together, we can build a better city. Track your reports
                                and help improve your community.
                            </p>
                        </div>

                        <Link
                            href="/create-issue"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0F766E] shadow transition hover:bg-teal-50"
                        >
                            <Plus size={19} />
                            Report an Issue
                        </Link>
                    </section>

                    {/* Statistics */}
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold">
                                Your Activity Overview
                            </h3>

                            <span className="text-xs text-slate-400">
                                All time statistics
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`rounded-xl p-3 ${stat.color}`}>
                                            <stat.icon size={22} />
                                        </div>

                                    </div>

                                    <div className="mt-5">
                                        <p className="text-sm text-slate-500">
                                            {stat.label}
                                        </p>

                                        <div className="mt-1 flex items-end justify-between gap-2">
                                            <h3 className="text-3xl font-bold tracking-tight">
                                                {stat.value}
                                            </h3>

                                            <span className="pb-1 text-[11px] text-slate-400">
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Reports Section */}
                    <section
                        id="reports"
                        className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                    >
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                            <div>
                                <h3 className="text-lg font-bold">Recent Reports</h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Track the status of your submitted issues.
                                </p>
                            </div>

                            <Link
                                href="/dashboard/citizen/my-reports"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E] hover:text-[#134E4A]"
                            >
                                View All Reports
                                <ArrowUpRight size={17} />
                            </Link>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-xs">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
                            >
                                <option value="All">All Status</option>
                                {statusFilters.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="bg-[#F5FAF9] text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            Issue Details
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Location
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="transition hover:bg-teal-50/40"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {report.title}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {report.id} · {formatCategory(report.category)}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <MapPin size={15} className="text-slate-400" />
                                                    {report.location_address || "Location not provided"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {formatDate(report.created_at)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge status={report.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredReports.length === 0 && (
                                <div className="p-10 text-center text-sm text-slate-400">
                                    {issues.length === 0
                                        ? "You haven't submitted any reports yet."
                                        : "No reports match your search or status filter."}
                                </div>
                            )}
                        </div>

                        {/* Mobile Report Cards */}
                        <div className="space-y-3 p-4 md:hidden">
                            {filteredReports.map((report) => (
                                <article
                                    key={report.id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {report.title}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {report.id} · {formatCategory(report.category)}
                                            </p>
                                        </div>

                                        <StatusBadge status={report.status} />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={13} />
                                            {report.location_address || "Location not provided"}
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={13} />
                                            {formatDate(report.created_at)}
                                        </span>
                                    </div>
                                </article>
                            ))}

                            {filteredReports.length === 0 && (
                                <p className="p-6 text-center text-sm text-slate-400">
                                    {issues.length === 0
                                        ? "You haven't submitted any reports yet."
                                        : "No reports match your search or status filter."}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Bottom Sections */}
                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                        {/* Recent Report Updates */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">Recently Updated Reports</h3>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Current status and most recent update date
                                    </p>
                                </div>

                                <Bell size={19} className="text-[#0F766E]" />
                            </div>

                            {recentUpdates.length === 0 ? (
                                <p className="py-6 text-center text-sm text-slate-400">
                                    No report updates to display yet.
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {recentUpdates.map((issue) => {
                                        const UpdateIcon = getUpdateIcon(issue.status);

                                        return (
                                            <div key={issue.id} className="flex gap-4">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getUpdateColor(issue.status)}`}
                                                >
                                                    <UpdateIcon size={19} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm font-semibold">
                                                        {issue.title}
                                                    </h4>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        Current status: {formatStatus(issue.status)}
                                                    </p>

                                                    <p className="mt-2 text-[11px] text-slate-400">
                                                        Updated {formatDate(issue.updated_at || issue.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Report Categories */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">Reports by Category</h3>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Distribution of your submitted reports
                                    </p>
                                </div>

                                <FileText size={20} className="text-[#0F766E]" />
                            </div>

                            {categoryCounts.length === 0 ? (
                                <p className="py-6 text-center text-sm text-slate-400">
                                    Category breakdown will appear after you submit a report.
                                </p>
                            ) : (
                                <div className="space-y-5">
                                    {categoryCounts.map(([category, count]) => (
                                        <div key={category}>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="font-medium text-slate-700">
                                                    {category}
                                                </span>
                                                <span className="text-slate-500">{count}</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-[#0F766E]"
                                                    style={{
                                                        width: `${(count / maxCategoryCount) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
