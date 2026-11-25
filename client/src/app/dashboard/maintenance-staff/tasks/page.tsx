"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  ClipboardList,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import TaskStatusDropdown, {
  type TaskStatusFilter,
} from "@/components/shared/TaskStatusDropdown";
import {
  getMaintenanceIssues,
  type WorkflowIssue,
} from "@/services/issue-workflow.service";

type TaskStatus = "Assigned" | "In Progress" | "Resolved" | "Closed";
type Priority = "Critical" | "High" | "Medium" | "Low";

interface Task {
  id: string;
  title: string;
  category: string;
  location: string;
  status: TaskStatus;
  priority: Priority | null;
  assignedAt: string;
}

const mapTask = (issue: WorkflowIssue): Task => ({
  id: issue.id,
  title: issue.title,
  category: issue.category,
  location: issue.location_address || "Location not provided",
  status:
    issue.status === "in_progress"
      ? "In Progress"
      : issue.status === "resolved"
        ? "Resolved"
        : issue.status === "closed"
          ? "Closed"
          : "Assigned",
  priority: issue.priority
    ? (issue.priority.charAt(0).toUpperCase() +
        issue.priority.slice(1)) as Priority
    : null,
  assignedAt: issue.assigned_at || issue.created_at,
});

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const statusStyles: Record<TaskStatus, string> = {
  Assigned: "bg-blue-50 text-blue-700",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-gray-100 text-gray-600",
};

const priorityStyles: Record<Priority, string> = {
  Critical: "border-red-100 bg-red-50 text-red-700",
  High: "border-orange-100 bg-orange-50 text-orange-700",
  Medium: "border-amber-100 bg-amber-50 text-amber-700",
  Low: "border-gray-200 bg-gray-100 text-gray-600",
};

export default function MaintenanceMyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMaintenanceIssues();
      setTasks(response.data.map(mapTask));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your tasks."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadTasks(), 0);
    return () => window.clearTimeout(timer);
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.id.toLowerCase().includes(normalizedSearch) ||
        task.location.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, tasks]);

  return (
    <main className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto container space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F766E]">
              Maintenance workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              My Tasks
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View and track maintenance tasks assigned to you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadTasks()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh tasks
          </button>
        </header>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, task ID, or location"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <TaskStatusDropdown
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => void loadTasks()}
              className="shrink-0 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-gray-900">Assigned to me</h2>
              <p className="mt-1 text-xs text-gray-500">
                {loading
                  ? "Loading assigned tasks..."
                  : `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"}`}
              </p>
            </div>
            <ClipboardList size={20} className="text-[#0F766E]" />
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-gray-500">
              <RefreshCw size={18} className="animate-spin text-[#0F766E]" />
              Loading your tasks...
            </div>
          ) : !error && filteredTasks.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <ClipboardList size={30} className="text-gray-300" />
              <h3 className="mt-3 font-semibold text-gray-800">
                {tasks.length === 0 ? "No tasks assigned yet" : "No matching tasks"}
              </h3>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                {tasks.length === 0
                  ? "Tasks assigned to you by your department manager will appear here."
                  : "Try changing the search text or status filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <article
                  key={task.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[task.status]}`}
                      >
                        {task.status}
                      </span>
                      {task.priority && (
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {task.id} · {task.category.replace(/_/g, " ")}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin size={15} className="shrink-0 text-[#0F766E]" />
                      <span className="truncate">{task.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-xs text-gray-500">
                      Assigned {formatDate(task.assignedAt)}
                    </p>
                    <Link
                      href={`/dashboard/maintenance-staff/tasks/${task.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white hover:bg-[#115E59]"
                    >
                      View task
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
