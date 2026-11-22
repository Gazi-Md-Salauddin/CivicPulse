"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    Plus,
    MapPin,
    Bell,
    Settings,
    LogOut,
    Search,
    Menu,
    X,
    Clock3,
    CheckCircle2,
    Wrench,
    AlertCircle,
    ArrowUpRight,
    ChevronRight,
    MoreHorizontal,
    CalendarDays,
    MessageSquare,
    Map,
    Building2,
} from "lucide-react";
import Link from "next/link";

const reports = [
    {
        id: "CP-2026-001",
        title: "Damaged Road near Main Street",
        category: "Road Damage",
        location: "Dhanmondi, Dhaka",
        date: "Nov 20, 2026",
        status: "In Progress",
        priority: "High",
    },
    {
        id: "CP-2026-002",
        title: "Broken Streetlight",
        category: "Streetlight",
        location: "Mirpur 10, Dhaka",
        date: "Nov 18, 2026",
        status: "Under Review",
        priority: "Medium",
    },
    {
        id: "CP-2026-003",
        title: "Water Drainage Problem",
        category: "Drainage",
        location: "Uttara, Dhaka",
        date: "Nov 15, 2026",
        status: "Resolved",
        priority: "High",
    },
    {
        id: "CP-2026-004",
        title: "Garbage Collection Issue",
        category: "Waste Management",
        location: "Mohammadpur, Dhaka",
        date: "Nov 12, 2026",
        status: "Submitted",
        priority: "Low",
    },
];

const activities = [
    {
        title: "Issue marked as In Progress",
        description:
            "Your road damage report has been assigned to a maintenance team.",
        time: "2 hours ago",
        icon: Wrench,
        color: "bg-orange-50 text-orange-600",
    },
    {
        title: "Issue is Under Review",
        description:
            "Your streetlight complaint is being reviewed by the department.",
        time: "Yesterday",
        icon: AlertCircle,
        color: "bg-purple-50 text-purple-600",
    },
    {
        title: "Issue Resolved",
        description:
            "Your drainage problem has been successfully resolved.",
        time: "2 days ago",
        icon: CheckCircle2,
        color: "bg-green-50 text-green-600",
    },
];

const stats = [
    {
        label: "Total Reports",
        value: "24",
        change: "+3 this month",
        icon: FileText,
        color: "bg-teal-50 text-teal-700",
    },
    {
        label: "Pending Reports",
        value: "08",
        change: "Awaiting review",
        icon: Clock3,
        color: "bg-amber-50 text-amber-600",
    },
    {
        label: "In Progress",
        value: "05",
        change: "Being handled",
        icon: Wrench,
        color: "bg-purple-50 text-purple-600",
    },
    {
        label: "Resolved Reports",
        value: "11",
        change: "Successfully resolved",
        icon: CheckCircle2,
        color: "bg-green-50 text-green-600",
    },
];

const navigation = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/citizen" },
    { label: "My Reports", icon: FileText, href: "/dashboard/citizen/reports" },
    { label: "Report an Issue", icon: Plus, href: "/dashboard/citizen/create-issue" },
    { label: "Nearby Issues", icon: MapPin, href: "/dashboard/citizen/nearby-issues" },
];

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Submitted: "bg-blue-50 text-blue-700",
        "Under Review": "bg-purple-50 text-purple-700",
        Assigned: "bg-indigo-50 text-indigo-700",
        "In Progress": "bg-orange-50 text-orange-700",
        Resolved: "bg-green-50 text-green-700",
        Closed: "bg-gray-100 text-gray-600",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"
                }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

export default function CitizenDashboard() {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            report.title.toLowerCase().includes(search.toLowerCase()) ||
            report.id.toLowerCase().includes(search.toLowerCase()) ||
            report.location.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "All" || report.status === filter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-[#F5FAF9] text-slate-800 container mx-auto">

            {/* Main Content */}
            <main className="min-h-screen">

                {/* Topbar */}
                <header className="sticky top-0  flex h-[82px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <p className="text-xs text-slate-400">
                                Citizen Portal / Overview
                            </p>
                            <h2 className="text-lg font-bold text-slate-800">
                                Dashboard
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            aria-label="Notifications"
                            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-teal-50 hover:text-[#0F766E]"
                        >
                            <Bell size={19} />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                        </button>

                        <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-[#0F766E]">
                                GS
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Citizen User</p>
                                <p className="text-xs text-slate-400">
                                    Dhaka, Bangladesh
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">

                    {/* Welcome Section */}
                    <section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#134E4A] to-[#0F766E] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
                        <div>
                            <p className="mb-2 text-sm font-medium text-teal-100/80">
                                Sunday, November 22, 2026
                            </p>

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

                                        <button
                                            aria-label={`More about ${stat.label}`}
                                            className="text-slate-400 hover:text-[#0F766E]"
                                        >
                                            <MoreHorizontal size={21} />
                                        </button>
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

                            <a
                                href="/citizen/reports"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E] hover:text-[#134E4A]"
                            >
                                View All Reports
                                <ArrowUpRight size={17} />
                            </a>
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
                                <option value="Submitted">Submitted</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
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
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right font-semibold">
                                            Action
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
                                                    {report.id} · {report.category}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <MapPin size={15} className="text-slate-400" />
                                                    {report.location}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {report.date}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`text-xs font-semibold ${report.priority === "High"
                                                            ? "text-red-600"
                                                            : report.priority === "Medium"
                                                                ? "text-amber-600"
                                                                : "text-green-600"
                                                        }`}
                                                >
                                                    {report.priority}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge status={report.status} />
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`/citizen/reports/${report.id}`}
                                                    aria-label={`View ${report.id}`}
                                                    className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-teal-50 hover:text-[#0F766E]"
                                                >
                                                    <ChevronRight size={19} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredReports.length === 0 && (
                                <div className="p-10 text-center text-sm text-slate-400">
                                    No reports found.
                                </div>
                            )}
                        </div>

                        {/* Mobile Report Cards */}
                        <div className="space-y-3 p-4 md:hidden">
                            {filteredReports.map((report) => (
                                <a
                                    href={`/citizen/reports/${report.id}`}
                                    key={report.id}
                                    className="block rounded-xl border border-slate-200 p-4 transition hover:border-teal-300"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {report.title}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {report.id}
                                            </p>
                                        </div>

                                        <StatusBadge status={report.status} />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={13} />
                                            {report.location}
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={13} />
                                            {report.date}
                                        </span>
                                    </div>
                                </a>
                            ))}

                            {filteredReports.length === 0 && (
                                <p className="p-6 text-center text-sm text-slate-400">
                                    No reports found.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Bottom Sections */}
                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                        {/* Recent Activity */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">Recent Updates</h3>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Latest activity on your reports
                                    </p>
                                </div>

                                <Bell size={19} className="text-[#0F766E]" />
                            </div>

                            <div className="space-y-6">
                                {activities.map((activity, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.color}`}
                                        >
                                            <activity.icon size={19} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-semibold">
                                                {activity.title}
                                            </h4>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {activity.description}
                                            </p>

                                            <p className="mt-2 text-[11px] text-slate-400">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nearby Issues */}
                        <div
                            id="nearby"
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">Nearby Issues</h3>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Reported issues around your area
                                    </p>
                                </div>

                                <Map size={20} className="text-[#0F766E]" />
                            </div>

                            <div className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-xl bg-[#E0F2EE]">
                                <div
                                    className="absolute inset-0 opacity-60"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(35deg, transparent 46%, white 47%, white 50%, transparent 51%), linear-gradient(120deg, transparent 46%, white 47%, white 50%, transparent 51%)",
                                        backgroundSize: "65px 65px",
                                    }}
                                />

                                <div className="absolute left-[25%] top-[25%] h-3 w-3 rounded-full border-2 border-white bg-red-500 shadow-lg" />

                                <div className="absolute right-[28%] top-[35%] h-3 w-3 rounded-full border-2 border-white bg-amber-500 shadow-lg" />

                                <div className="absolute bottom-[25%] left-[55%] h-3 w-3 rounded-full border-2 border-white bg-[#0F766E] shadow-lg" />

                                <div className="relative flex flex-col items-center">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#0F766E] text-white shadow-xl">
                                        <MapPin size={21} />
                                    </div>

                                    <span className="mt-2 rounded-md bg-white px-3 py-1 text-xs font-semibold shadow">
                                        Your Area
                                    </span>
                                </div>

                                <span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] text-slate-500">
                                    Map Preview
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">
                                        12 issues nearby
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Within your surrounding area
                                    </p>
                                </div>

                                <a
                                    href="/citizen/nearby-issues"
                                    className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-[#0F766E] transition hover:bg-teal-100"
                                >
                                    Explore Map
                                    <ArrowUpRight size={14} />
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
