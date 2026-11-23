
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ClipboardList,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

type IssueStatus =
  | "Submitted"
  | "Under Review"
  | "Assigned"
  | "In Progress"
  | "Resolved";

type Priority = "Critical" | "High" | "Medium" | "Low";

type DepartmentIssue = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: Priority;
  status: IssueStatus;
  reporter: string;
  assignedTo: string | null;
  date: string;
};

type StaffMember = {
  id: string;
  name: string;
  role: string;
  activeTasks: number;
  completedTasks: number;
  availability: "Available" | "Busy";
  initials: string;
};

const initialIssues: DepartmentIssue[] = [
  {
    id: "CP-00124",
    title: "Repair damaged road near Main Market",
    category: "Road Damage",
    location: "Mirpur 10, Dhaka",
    priority: "Critical",
    status: "In Progress",
    reporter: "Rahim Ahmed",
    assignedTo: "Abdullah Karim",
    date: "23 Nov 2026",
  },
  {
    id: "CP-00121",
    title: "Streetlight not working",
    category: "Streetlight",
    location: "Uttara Sector 7, Dhaka",
    priority: "High",
    status: "Submitted",
    reporter: "Nusrat Jahan",
    assignedTo: null,
    date: "22 Nov 2026",
  },
  {
    id: "CP-00118",
    title: "Blocked drainage system",
    category: "Drainage",
    location: "Dhanmondi 27, Dhaka",
    priority: "High",
    status: "Assigned",
    reporter: "Sakib Hasan",
    assignedTo: "Abdullah Karim",
    date: "21 Nov 2026",
  },
  {
    id: "CP-00115",
    title: "Broken footpath tiles",
    category: "Footpath",
    location: "Mohammadpur, Dhaka",
    priority: "Medium",
    status: "Under Review",
    reporter: "Farzana Akter",
    assignedTo: null,
    date: "20 Nov 2026",
  },
  {
    id: "CP-00110",
    title: "Garbage collection point cleanup",
    category: "Waste Management",
    location: "Banani, Dhaka",
    priority: "Low",
    status: "Resolved",
    reporter: "Tanvir Hossain",
    assignedTo: "Abdullah Karim",
    date: "19 Nov 2026",
  },
];

const initialStaff: StaffMember[] = [
  {
    id: "ST-001",
    name: "Abdullah Karim",
    role: "Field Technician",
    activeTasks: 3,
    completedTasks: 12,
    availability: "Busy",
    initials: "AK",
  },
  {
    id: "ST-002",
    name: "Mahmud Hasan",
    role: "Maintenance Staff",
    activeTasks: 1,
    completedTasks: 9,
    availability: "Available",
    initials: "MH",
  },
  {
    id: "ST-003",
    name: "Sabbir Ahmed",
    role: "Field Technician",
    activeTasks: 2,
    completedTasks: 15,
    availability: "Busy",
    initials: "SA",
  },
  {
    id: "ST-004",
    name: "Rakib Hossain",
    role: "Maintenance Staff",
    activeTasks: 0,
    completedTasks: 7,
    availability: "Available",
    initials: "RH",
  },
];

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-red-50 text-red-700 border-red-100",
  High: "bg-orange-50 text-orange-700 border-orange-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusStyles: Record<IssueStatus, string> = {
  Submitted: "bg-blue-50 text-blue-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Assigned: "bg-violet-50 text-violet-700",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

export default function DepartmentManagerDashboard() {
  const [issues, setIssues] =
    useState<DepartmentIssue[]>(initialIssues);

  const [staff] = useState<StaffMember[]>(initialStaff);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.id.toLowerCase().includes(search.toLowerCase()) ||
        issue.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || issue.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || issue.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [issues, search, statusFilter, priorityFilter]);

  const stats = [
    {
      title: "Department Issues",
      value: issues.length,
      description: "Total department issues",
      icon: <ClipboardList size={21} />,
      color: "bg-teal-50 text-[#0F766E]",
    },
    {
      title: "Pending Review",
      value: issues.filter(
        (issue) =>
          issue.status === "Submitted" ||
          issue.status === "Under Review"
      ).length,
      description: "Waiting for verification",
      icon: <Clock3 size={21} />,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Assigned Tasks",
      value: issues.filter(
        (issue) => issue.status === "Assigned"
      ).length,
      description: "Assigned to maintenance staff",
      icon: <Users size={21} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "In Progress",
      value: issues.filter(
        (issue) => issue.status === "In Progress"
      ).length,
      description: "Currently being resolved",
      icon: <Wrench size={21} />,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Resolved",
      value: issues.filter(
        (issue) => issue.status === "Resolved"
      ).length,
      description: "Successfully resolved",
      icon: <CheckCircle2 size={21} />,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const updateIssueStatus = (
    id: string,
    status: IssueStatus
  ) => {
    setIssues((previous) =>
      previous.map((issue) =>
        issue.id === id ? { ...issue, status } : issue
      )
    );
  };

  const activeIssues = issues.filter(
    (issue) => issue.status !== "Resolved"
  );

  const resolvedCount = issues.filter(
    (issue) => issue.status === "Resolved"
  ).length;

  const resolutionRate =
    issues.length > 0
      ? Math.round((resolvedCount / issues.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#F5FAF9]">
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto">

          {/* Page Header */}
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
                November 23, 2026
              </div>

              <Link
                href="/dashboard/manager/assign-tasks"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59]"
              >
                <Users size={17} />
                Assign Task
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
                  Road & Infrastructure Department
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-teal-100">
                  Manage infrastructure issues, coordinate maintenance
                  staff and ensure timely resolution of citizen reports.
                </p>
              </div>

              <div className="flex gap-5 sm:gap-7">
                <div>
                  <p className="text-3xl font-bold">{staff.length}</p>
                  <p className="mt-1 text-xs text-teal-200">
                    Team Members
                  </p>
                </div>

                <div className="h-12 w-px bg-white/20" />

                <div>
                  <p className="text-3xl font-bold">
                    {activeIssues.length}
                  </p>
                  <p className="mt-1 text-xs text-teal-200">
                    Active Issues
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
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

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                  >
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

            {/* Priority Overview */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Issue Priority Overview
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Active issue distribution by priority
                  </p>
                </div>

                <AlertCircle size={20} className="text-[#0F766E]" />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(
                  ["Critical", "High", "Medium", "Low"] as Priority[]
                ).map((priority) => {
                  const count = activeIssues.filter(
                    (issue) => issue.priority === priority
                  ).length;

                  return (
                    <div
                      key={priority}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            priority === "Critical"
                              ? "bg-red-500"
                              : priority === "High"
                                ? "bg-orange-500"
                                : priority === "Medium"
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                          }`}
                        />

                        <span className="text-xs font-medium text-gray-500">
                          {priority}
                        </span>
                      </div>

                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        {count}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Active issues
                      </p>
                    </div>
                  );
                })}
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
                    <p className="text-[10px] text-gray-400">
                      Resolved
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-gray-500">
                {resolvedCount} out of {issues.length} issues resolved
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
                  Review and manage the latest reported issues.
                </p>
              </div>

              <Link
                href="/dashboard/manager/issues"
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
                  </select>
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-[#0F766E]"
                >
                  <option value="All">All Priority</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Issues Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Issue Details
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Priority
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Assigned Staff
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Reported
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {issue.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {issue.id} · {issue.category}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin
                            size={13}
                            className="text-[#0F766E]"
                          />
                          {issue.location}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${priorityStyles[issue.priority]}`}
                        >
                          {issue.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[issue.status]}`}
                        >
                          {issue.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {issue.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#CCFBF1] text-[10px] font-bold text-[#0F766E]">
                              {issue.assignedTo
                                .split(" ")
                                .map((word) => word[0])
                                .join("")}
                            </div>

                            <span className="text-xs font-medium text-gray-700">
                              {issue.assignedTo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-500">
                        {issue.date}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Link
                            href={`/dashboard/manager/issues/${issue.id}`}
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-[#0F766E] hover:text-[#0F766E]"
                            title="View issue details"
                          >
                            <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredIssues.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        No issues found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Issue Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0F766E]">
                        {issue.id}
                      </p>

                      <h3 className="mt-1 text-sm font-bold text-gray-900">
                        {issue.title}
                      </h3>
                    </div>

                    <span
                      className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${priorityStyles[issue.priority]}`}
                    >
                      {issue.priority}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={14} />
                    {issue.location}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[issue.status]}`}
                    >
                      {issue.status}
                    </span>

                    <Link
                      href={`/dashboard/manager/issues/${issue.id}`}
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

          {/* Staff Management + Activity */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* Staff Overview */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Maintenance Team
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Staff workload and availability
                  </p>
                </div>

                <Link
                  href="/dashboard/manager/staff"
                  className="text-sm font-semibold text-[#0F766E] hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCFBF1] text-xs font-bold text-[#0F766E]">
                      {member.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {member.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {member.role}
                      </p>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {member.activeTasks} Active
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {member.completedTasks} Completed
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        member.availability === "Available"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {member.availability}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Recent Activities
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Latest department updates
                  </p>
                </div>

                <Activity size={20} className="text-[#0F766E]" />
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: <CheckCircle2 size={16} />,
                    color: "bg-emerald-50 text-emerald-600",
                    title: "Issue marked as resolved",
                    description: "CP-00110 · Garbage collection cleanup",
                    time: "Today",
                  },
                  {
                    icon: <Wrench size={16} />,
                    color: "bg-blue-50 text-blue-600",
                    title: "Maintenance work started",
                    description: "CP-00118 · Blocked drainage system",
                    time: "Yesterday",
                  },
                  {
                    icon: <Users size={16} />,
                    color: "bg-violet-50 text-violet-600",
                    title: "New task assigned",
                    description: "CP-00124 · Road damage",
                    time: "2 days ago",
                  },
                  {
                    icon: <AlertCircle size={16} />,
                    color: "bg-amber-50 text-amber-600",
                    title: "New issue reported",
                    description: "CP-00121 · Streetlight",
                    time: "2 days ago",
                  },
                ].map((activity) => (
                  <div
                    key={activity.title}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.color}`}
                    >
                      {activity.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {activity.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-400">
                        {activity.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
