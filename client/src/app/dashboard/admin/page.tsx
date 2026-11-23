
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Building2,
  HardHat,
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Search,
  MoreHorizontal,
  MapPin,
  CalendarDays,
  Activity,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Settings,
  Eye,
  CircleDot,
  XCircle,
} from "lucide-react";

type IssueStatus =
  | "Submitted"
  | "Under Review"
  | "Assigned"
  | "In Progress"
  | "Resolved";

type Priority = "Critical" | "High" | "Medium" | "Low";

type Issue = {
  id: string;
  title: string;
  category: string;
  location: string;
  department: string;
  status: IssueStatus;
  priority: Priority;
  date: string;
};

const initialIssues: Issue[] = [
  {
    id: "CP-1024",
    title: "Large pothole on main road",
    category: "Road Damage",
    location: "Dhanmondi, Dhaka",
    department: "Road & Infrastructure",
    status: "In Progress",
    priority: "Critical",
    date: "Nov 23, 2026",
  },
  {
    id: "CP-1023",
    title: "Streetlight not working",
    category: "Streetlight",
    location: "Mirpur 10, Dhaka",
    department: "Electrical Services",
    status: "Submitted",
    priority: "High",
    date: "Nov 23, 2026",
  },
  {
    id: "CP-1022",
    title: "Water drainage blockage",
    category: "Drainage",
    location: "Uttara, Dhaka",
    department: "Water & Drainage",
    status: "Under Review",
    priority: "High",
    date: "Nov 22, 2026",
  },
  {
    id: "CP-1021",
    title: "Broken public footpath",
    category: "Footpath",
    location: "Mohammadpur, Dhaka",
    department: "Road & Infrastructure",
    status: "Assigned",
    priority: "Medium",
    date: "Nov 22, 2026",
  },
  {
    id: "CP-1020",
    title: "Garbage not collected",
    category: "Waste Management",
    location: "Banani, Dhaka",
    department: "Waste Management",
    status: "Resolved",
    priority: "Low",
    date: "Nov 21, 2026",
  },
];

const departments = [
  {
    name: "Road & Infrastructure",
    manager: "Rahim Ahmed",
    issues: 248,
    resolved: 186,
    color: "bg-teal-600",
  },
  {
    name: "Water & Drainage",
    manager: "Nusrat Jahan",
    issues: 184,
    resolved: 132,
    color: "bg-blue-600",
  },
  {
    name: "Electrical Services",
    manager: "Sabbir Hasan",
    issues: 156,
    resolved: 118,
    color: "bg-amber-500",
  },
  {
    name: "Waste Management",
    manager: "Tanvir Islam",
    issues: 126,
    resolved: 105,
    color: "bg-violet-600",
  },
];

const activities = [
  {
    title: "New department manager registered",
    description: "Rahim Ahmed joined Road & Infrastructure",
    time: "12 minutes ago",
    icon: UserPlus,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Issue marked as resolved",
    description: "CP-1020 · Garbage not collected",
    time: "35 minutes ago",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "New issue submitted",
    description: "CP-1023 · Streetlight not working",
    time: "1 hour ago",
    icon: FileText,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Department updated",
    description: "Electrical Services information updated",
    time: "2 hours ago",
    icon: Building2,
    color: "bg-violet-50 text-violet-600",
  },
];

const statusStyles: Record<IssueStatus, string> = {
  Submitted: "bg-blue-50 text-blue-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Assigned: "bg-violet-50 text-violet-700",
  "In Progress": "bg-orange-50 text-orange-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-red-50 text-red-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

export default function AdminDashboardPage() {
  const [issues] = useState<Issue[]>(initialIssues);
  const [search, setSearch] = useState("");

  const filteredIssues = useMemo(() => {
    const query = search.toLowerCase();

    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        issue.id.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query)
    );
  }, [issues, search]);

  const stats = [
    {
      title: "Total Users",
      value: "12,845",
      change: "+12.8%",
      description: "Compared to last month",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Issues",
      value: "2,486",
      change: "+8.4%",
      description: "Compared to last month",
      icon: FileText,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-700",
    },
    {
      title: "Departments",
      value: "12",
      change: "+2 new",
      description: "Active departments",
      icon: Building2,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Field Staff",
      value: "348",
      change: "+18",
      description: "Registered staff members",
      icon: HardHat,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const issueStats = [
    { label: "Submitted", value: 386, color: "bg-blue-500" },
    { label: "Under Review", value: 245, color: "bg-amber-500" },
    { label: "Assigned", value: 318, color: "bg-violet-500" },
    { label: "In Progress", value: 412, color: "bg-orange-500" },
    { label: "Resolved", value: 1125, color: "bg-emerald-500" },
  ];

  const totalIssues = issueStats.reduce(
    (total, item) => total + item.value,
    0
  );

  const priorityStats = [
    { label: "Critical", value: 86, color: "bg-red-500" },
    { label: "High", value: 324, color: "bg-orange-500" },
    { label: "Medium", value: 782, color: "bg-amber-500" },
    { label: "Low", value: 1294, color: "bg-slate-400" },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
              Admin Panel
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System operational
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage your entire CivicPulse platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
            <CalendarDays size={16} />
            November 23, 2026
          </div>

          <Link
            href="/dashboard/admin/reports"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
          >
            <ClipboardList size={17} />
            View Reports
          </Link>
        </div>
      </div>

      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#134E4A] to-[#0F766E] p-6 text-white sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={20} className="text-teal-200" />
            <span className="text-sm font-medium text-teal-100">
              Platform Administration
            </span>
          </div>

          <h2 className="text-2xl font-bold sm:text-3xl">
            Welcome back, Administrator!
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/90">
            Here is what is happening across CivicPulse. Track citizen
            reports, monitor departments, and keep public services running
            smoothly.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#134E4A] transition hover:bg-teal-50"
            >
              Manage Users
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/dashboard/admin/departments"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Manage Departments
            </Link>
          </div>
        </div>

        <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
        <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full border-[30px] border-white/5" />

        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <ShieldCheck size={76} strokeWidth={1.2} className="text-white/90" />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </h3>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon size={21} className={stat.iconColor} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <TrendingUp size={14} />
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400">
                  {stat.description}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Issue Analytics */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Issue Status */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Issue Overview</h3>
              <p className="mt-1 text-sm text-slate-500">
                Current status of all reported issues
              </p>
            </div>

            <Link
              href="/dashboard/admin/reports"
              className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="mt-7 flex flex-col items-center gap-8 sm:flex-row">
            <div className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #10b981 0% 45.25%,
                  #f97316 45.25% 61.82%,
                  #8b5cf6 61.82% 74.61%,
                  #f59e0b 74.61% 84.47%,
                  #3b82f6 84.47% 100%
                )`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-900">
                  {totalIssues.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">Total Issues</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              {issueStats.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                      />
                      <span className="text-sm text-slate-600">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width: `${(item.value / totalIssues) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Overview */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h3 className="font-bold text-slate-900">Priority Overview</h3>
            <p className="mt-1 text-sm text-slate-500">
              Issues grouped by priority level
            </p>
          </div>

          <div className="mt-7 space-y-6">
            {priorityStats.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {item.value.toLocaleString()}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.value / 2486) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-xl bg-red-50 p-3">
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-red-600"
            />
            <div>
              <p className="text-sm font-semibold text-red-800">
                86 Critical Issues
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700">
                These issues need immediate administrative attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Department Performance */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">
              Department Performance
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Issue resolution performance across departments
            </p>
          </div>

          <Link
            href="/dashboard/admin/departments"
            className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Manage Departments
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {departments.map((department) => {
            const percentage = Math.round(
              (department.resolved / department.issues) * 100
            );

            return (
              <div
                key={department.name}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-teal-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Building2 size={19} />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {department.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Manager: {department.manager}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`More options for ${department.name}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Resolved issues</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {department.resolved}
                      <span className="ml-1 text-sm font-normal text-slate-400">
                        / {department.issues}
                      </span>
                    </p>
                  </div>

                  <span className="text-sm font-bold text-teal-700">
                    {percentage}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${department.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Issues */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h3 className="font-bold text-slate-900">Recent Issues</h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest reports submitted by citizens across the platform
            </p>
          </div>

          <Link
            href="/dashboard/admin/reports"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 sm:self-auto"
          >
            All Issues
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="border-y border-slate-100 px-5 py-3 sm:px-6">
          <div className="relative max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {issue.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{issue.id}</span>
                      <span>·</span>
                      <span>{issue.category}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {issue.location}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {issue.department}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[issue.priority]}`}
                    >
                      {issue.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[issue.status]}`}
                    >
                      {issue.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {issue.date}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/admin/reports/${issue.id}`}
                      aria-label={`View ${issue.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
                    >
                      <Eye size={17} />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredIssues.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Activities */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Recent Activities</h3>
              <p className="mt-1 text-sm text-slate-500">
                Latest platform activities
              </p>
            </div>

            <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
              <Activity size={19} />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {activities.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div key={index} className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.color}`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.description}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                      <Clock3 size={12} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h3 className="font-bold text-slate-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-slate-500">
              Common administrative operations
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/admin/users"
              className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 hover:bg-teal-50/50"
            >
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Users size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Manage Users
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  User accounts and roles
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-slate-400 transition group-hover:text-teal-700"
              />
            </Link>

            <Link
              href="/dashboard/admin/departments"
              className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 hover:bg-teal-50/50"
            >
              <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                <Building2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Departments
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Manage departments
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-slate-400 transition group-hover:text-teal-700"
              />
            </Link>

            <Link
              href="/dashboard/admin/reports"
              className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 hover:bg-teal-50/50"
            >
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  All Reports
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Review citizen issues
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-slate-400 transition group-hover:text-teal-700"
              />
            </Link>

            <Link
              href="/dashboard/admin/analytics"
              className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 hover:bg-teal-50/50"
            >
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Analytics
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Platform performance
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-slate-400 transition group-hover:text-teal-700"
              />
            </Link>

            <Link
              href="/dashboard/admin/settings"
              className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 hover:bg-teal-50/50 sm:col-span-2"
            >
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                <Settings size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Platform Settings
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Configure platform preferences and system settings
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-slate-400 transition group-hover:text-teal-700"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row">
        <p>CivicPulse Admin Dashboard</p>
        <p className="flex items-center gap-1">
          <CircleDot size={12} className="text-emerald-500" />
          System status: Operational
        </p>
      </div>
    </div>
  );
}
