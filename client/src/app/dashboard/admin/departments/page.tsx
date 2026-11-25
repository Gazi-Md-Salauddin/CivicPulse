"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Power,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Landmark,
} from "lucide-react";
import { apiUrl, parseApiResponse } from "@/services/api";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type Department = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

type DepartmentForm = {
  name: string;
  description: string;
};

const initialForm: DepartmentForm = {
  name: "",
  description: "",
};

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [form, setForm] = useState<DepartmentForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const limit = 8;

  // Fetch all departments
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(apiUrl("admin/departments"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result =
        await parseApiResponse<ApiResponse<Department[]>>(response);

      if (!result.success) {
        throw new Error(
          result.message || "Failed to fetch departments"
        );
      }

      setDepartments(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: departments.length,
      active: departments.filter((d) => d.is_active).length,
      inactive: departments.filter((d) => !d.is_active).length,
    };
  }, [departments]);

  // Search and filtering
  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch =
        department.name.toLowerCase().includes(search.toLowerCase()) ||
        (department.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && department.is_active) ||
        (filter === "inactive" && !department.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [departments, search, filter]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / limit)
  );

  const paginatedDepartments = filteredDepartments.slice(
    (page - 1) * limit,
    page * limit
  );

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // Open create modal
  const openCreateModal = () => {
    setEditingDepartment(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (department: Department) => {
    setEditingDepartment(department);

    setForm({
      name: department.name,
      description: department.description || "",
    });

    setError("");
    setModalOpen(true);
  };

  // Create or update department
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingDepartment);

      const endpoint = isEditing
        ? `admin/departments/${editingDepartment!.id}`
        : "admin/departments";

      const response = await fetch(apiUrl(endpoint), {
        method: isEditing ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      });

      const result =
        await parseApiResponse<ApiResponse<Department>>(response);

      if (!result.success) {
        throw new Error(
          result.message || "Department operation failed"
        );
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditingDepartment(null);

      setSuccess(
        isEditing
          ? "Department updated successfully."
          : "Department created successfully."
      );

      await fetchDepartments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Activate / deactivate department
  const handleToggleStatus = async (department: Department) => {
    if (!department.is_active) {
      setError("Department activation is not supported by the current API.");
      return;
    }

    const action = "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${department.name}?`
    );

    if (!confirmed) return;

    try {
      setActionId(department.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        apiUrl(`admin/departments/${department.id}`),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await parseApiResponse<ApiResponse<Department>>(response);

      if (!result.success) {
        throw new Error(
          result.message || "Failed to update department status"
        );
      }

      setDepartments((previous) =>
        previous.map((item) =>
          item.id === department.id
            ? { ...item, is_active: !department.is_active }
            : item
        )
      );

      setSuccess(
        `Department ${action}d successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto container space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Administration / Departments
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Department Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create, manage and monitor city departments.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchDepartments}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              <Plus size={18} />
              Add Department
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {success}
            <button
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <StatCard
            title="Total Departments"
            value={stats.total}
            icon={<Building2 size={21} />}
            color="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Active Departments"
            value={stats.active}
            icon={<CheckCircle2 size={21} />}
            color="bg-teal-50 text-teal-700"
          />

          <StatCard
            title="Inactive Departments"
            value={stats.inactive}
            icon={<XCircle size={21} />}
            color="bg-red-50 text-red-700"
          />

        </div>

        {/* Department Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Departments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your municipal departments.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search department..."
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:w-64"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                >
                  <option value="all">All Departments</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Department
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Description
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Created Date
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      <RefreshCw
                        size={25}
                        className="mx-auto animate-spin text-teal-700"
                      />
                      <p className="mt-3 text-sm">
                        Loading departments...
                      </p>
                    </td>
                  </tr>
                ) : paginatedDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Building2
                        size={36}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-semibold text-slate-700">
                        No departments found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Create a department or change your filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedDepartments.map((department) => (
                    <tr
                      key={department.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Department Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                            <Landmark size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {department.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ID: {department.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="max-w-xs px-5 py-4">
                        <p className="line-clamp-2 text-sm text-slate-600">
                          {department.description || "No description provided"}
                        </p>
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {department.created_at
                          ? new Date(
                              department.created_at
                            ).toLocaleDateString("en-BD", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            department.is_active
                              ? "bg-teal-50 text-teal-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              department.is_active
                                ? "bg-teal-600"
                                : "bg-red-600"
                            }`}
                          />
                          {department.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEditModal(department)}
                            title="Edit department"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(department)}
                            disabled={
                              actionId === department.id ||
                              !department.is_active
                            }
                            title={
                              department.is_active
                                ? "Deactivate department"
                                : "Activation is not supported"
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
                              department.is_active
                                ? "border-red-100 text-red-600 hover:bg-red-50"
                                : "border-teal-100 text-teal-700 hover:bg-teal-50"
                            }`}
                          >
                            {actionId === department.id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col justify-between gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">

            <p className="text-sm text-slate-500">
              Showing{" "}
              {filteredDepartments.length === 0
                ? 0
                : (page - 1) * limit + 1}
              {" - "}
              {Math.min(page * limit, filteredDepartments.length)}
              {" of "}
              {filteredDepartments.length} departments
            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-sm font-medium text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>

            </div>
          </div>

        </section>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingDepartment
                    ? "Edit Department"
                    : "Create Department"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your department information.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department Name
                </label>

                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Road Maintenance"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the responsibilities of this department..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.description.length}/1000
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  {submitting && (
                    <RefreshCw size={15} className="animate-spin" />
                  )}

                  {editingDepartment
                    ? "Save Changes"
                    : "Create Department"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// Reusable Statistics Card
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {title}
      </p>
    </div>
  );
}
