"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ClipboardList,
  Filter,
  MapPin,
  Menu,
  Search,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import {
  getMaintenanceDashboard,
  getMaintenanceIssues,
  updateMaintenanceIssueStatus,
  type WorkflowIssue,
} from "@/services/issue-workflow.service";

type TaskStatus = "Assigned" | "In Progress" | "Resolved" | "Closed";

type Priority = "Critical" | "High" | "Medium" | "Low";

type Task = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: Priority | null;
  status: TaskStatus;
  assignedDate: string;
  assignedAt: string;
};

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-red-50 text-red-700 border-red-100",
  High: "bg-orange-50 text-orange-700 border-orange-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusStyles: Record<TaskStatus, string> = {
  Assigned: "bg-blue-50 text-blue-700",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-gray-100 text-gray-600",
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const mapTask = (issue: WorkflowIssue): Task => ({
  id: issue.id,
  title: issue.title,
  category: issue.category,
  location: issue.location_address || "Location not provided",
  priority: issue.priority
    ? (issue.priority.charAt(0).toUpperCase() +
        issue.priority.slice(1)) as Priority
    : null,
  status:
    issue.status === "in_progress"
      ? "In Progress"
      : issue.status === "resolved"
        ? "Resolved"
        : issue.status === "closed"
          ? "Closed"
        : "Assigned",
  assignedDate: formatDate(issue.assigned_at || issue.created_at),
  assignedAt: issue.assigned_at || issue.created_at,
});

export default function MaintenanceStaffDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_assigned: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingTaskId, setSavingTaskId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [dashboardResponse, issuesResponse] = await Promise.all([
        getMaintenanceDashboard(),
        getMaintenanceIssues(),
      ]);
      setDashboardStats(dashboardResponse.data);
      setTasks(issuesResponse.data.map(mapTask));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load assigned maintenance tasks."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchDashboard]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.id.toLowerCase().includes(search.toLowerCase()) ||
        task.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort(
          (first, second) =>
            new Date(second.assignedAt).getTime() -
            new Date(first.assignedAt).getTime()
        )
        .slice(0, 3),
    [tasks]
  );

  const stats = [
    {
      title: "Assigned Tasks",
      value: dashboardStats.pending + dashboardStats.in_progress,
      description: "Total active assignments",
      icon: <ClipboardList size={21} />,
      color: "bg-teal-50 text-[#0F766E]",
      trend: "Your workload",
    },
    {
      title: "Pending Tasks",
      value: dashboardStats.pending,
      description: "Waiting to be started",
      icon: <Clock3 size={21} />,
      color: "bg-amber-50 text-amber-600",
      trend: "Needs attention",
    },
    {
      title: "In Progress",
      value: dashboardStats.in_progress,
      description: "Currently working",
      icon: <Wrench size={21} />,
      color: "bg-blue-50 text-blue-600",
      trend: "Ongoing work",
    },
    {
      title: "Completed Tasks",
      value: dashboardStats.resolved,
      description: "Successfully resolved",
      icon: <CheckCircle2 size={21} />,
      color: "bg-emerald-50 text-emerald-600",
      trend: "Completed work",
    },
  ];

  const handleTaskStatus = async (
    task: Task,
    status: "in_progress" | "resolved"
  ) => {
    try {
      setSavingTaskId(task.id);
      setActionError("");
      await updateMaintenanceIssueStatus(task.id, status);
      await fetchDashboard();
    } catch (actionFailure) {
      setActionError(
        actionFailure instanceof Error
          ? actionFailure.message
          : "Unable to update this task."
      );
    } finally {
      setSavingTaskId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAF9]">

      <div className="relative flex">
        

        {mobileMenu && (
          <button
            onClick={() => setMobileMenu(false)}
            className="fixed inset-16 z-10 bg-black/30 lg:hidden"
            aria-label="Close navigation"
          />
        )}

        {/* Main Content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">

          <div className="container mx-auto">

            {/* Welcome Header */}
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                  <span>Dashboard</span>
                  <ChevronRight size={14} />
                  <span className="font-medium text-[#0F766E]">
                    Overview
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Maintenance dashboard
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Here is an overview of your maintenance activities.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                  <CalendarDays size={17} className="text-[#0F766E]" />
                  {new Date().toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <button
                  onClick={() => void fetchDashboard()}
                  disabled={loading}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => void fetchDashboard()}
                  className="shrink-0 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}
            {actionError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {actionError}
              </div>
            )}

            {/* Statistics */}
            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Priority Overview */}
            <div className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-3">

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Priority Overview
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Active assigned task distribution
                    </p>
                  </div>
                  <AlertCircle size={20} className="text-[#0F766E]" />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(["Critical", "High", "Medium", "Low"] as Priority[]).map(
                    (priority) => {
                      const count = tasks.filter(
                        (task) =>
                          task.priority === priority &&
                          task.status !== "Resolved" &&
                          task.status !== "Closed"
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
                            Active tasks
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Quick Summary */}
              <div className="rounded-2xl bg-[#134E4A] p-5 text-white shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">Work Summary</h2>
                  <TrendingUp size={20} className="text-teal-300" />
                </div>

                <p className="mt-5 text-4xl font-bold">
                  {tasks.length === 0
                    ? 0
                    : Math.round(
                        (tasks.filter((t) => t.status === "Resolved").length /
                          tasks.length) *
                          100
                      )}
                  %
                </p>

                <p className="mt-1 text-sm text-teal-100">
                  Tasks completed
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#14B8A6]"
                    style={{
                      width: `${
                        tasks.length === 0
                          ? 0
                          : (tasks.filter((t) => t.status === "Resolved").length /
                              tasks.length) *
                            100
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-4 text-xs text-teal-200">
                  Based on your assigned tasks.
                </p>
              </div>
            </div>

            {/* Tasks Table */}
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

              <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    My Assigned Tasks
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your assigned maintenance work.
                  </p>
                </div>

                <span className="text-sm font-semibold text-gray-500">
                  {tasks.length} assigned
                </span>
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
                    placeholder="Search task, ID or location..."
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#0F766E] focus:bg-white"
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
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
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

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Task Details</th>
                      <th className="px-5 py-4 font-semibold">Priority</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Assigned Date</th>
                      <th className="px-5 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {task.id} · {task.category}
                          </p>
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={13} className="text-[#0F766E]" />
                            {task.location}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {task.priority ? (
                            <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
                              {task.priority}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not set
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[task.status]}`}>
                            {task.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-700">
                            {task.assignedDate}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Assigned
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/maintenance-staff/tasks/${task.id}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-[#0F766E] hover:text-[#0F766E]"
                              title="View task"
                            >
                              <ArrowUpRight size={16} />
                            </Link>

                            {task.status === "Assigned" && (
                              <button
                                disabled={savingTaskId === task.id}
                                onClick={() => void handleTaskStatus(task, "in_progress")}
                                className="rounded-lg bg-[#0F766E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#115E59]"
                              >
                                Start Work
                              </button>
                            )}

                            {task.status === "In Progress" && (
                              <button
                                disabled={savingTaskId === task.id}
                                onClick={() => void handleTaskStatus(task, "resolved")}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {loading && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
                          Loading assigned tasks...
                        </td>
                      </tr>
                    )}
                    {!loading && filteredTasks.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No tasks found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Task Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0F766E]">
                          {task.id}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-gray-900">
                          {task.title}
                        </h3>
                      </div>

                      {task.priority ? (
                        <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${priorityStyles[task.priority]}`}>
                          {task.priority}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] text-gray-400">
                          Not set
                        </span>
                      )}
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={14} />
                      {task.location}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[task.status]}`}>
                        {task.status}
                      </span>

                      {task.status === "Assigned" && (
                        <button
                          disabled={savingTaskId === task.id}
                          onClick={() => void handleTaskStatus(task, "in_progress")}
                          className="rounded-lg bg-[#0F766E] px-3 py-2 text-xs font-semibold text-white"
                        >
                          Start Work
                        </button>
                      )}

                      {task.status === "In Progress" && (
                        <button
                          disabled={savingTaskId === task.id}
                          onClick={() => void handleTaskStatus(task, "resolved")}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Complete
                        </button>
                      )}

                      <Link
                        href={`/dashboard/maintenance-staff/tasks/${task.id}`}
                        className="text-xs font-semibold text-[#0F766E]"
                      >
                        Details <ArrowUpRight size={14} className="inline" />
                      </Link>
                    </div>
                  </div>
                ))}

                {loading ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Loading assigned tasks...
                  </div>
                ) : filteredTasks.length === 0 && (
                  <div className="py-10 text-center text-sm text-gray-500">
                    No tasks found.
                  </div>
                )}
              </div>
            </section>

            <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Recently assigned
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Latest work from your assigned task list
                  </p>
                </div>
                <Activity size={19} className="text-[#0F766E]" />
              </div>
              {recentTasks.length ? (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/dashboard/maintenance-staff/tasks/${task.id}`}
                      className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {task.location} · Assigned {task.assignedDate}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[task.status]}`}
                      >
                        {task.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                  No assigned tasks are available yet.
                </p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
