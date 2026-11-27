
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

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

import {
  apiRequest,
  parseApiResponse,
} from "@/services/api";

// ==============================
// Types
// ==============================

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

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// ==============================
// Initial Form
// ==============================

const initialForm: DepartmentForm = {
  name: "",
  description: "",
};

const LIMIT = 8;

// ==============================
// Component
// ==============================

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [form, setForm] = useState<DepartmentForm>(initialForm);

  const [actionId, setActionId] = useState<string | null>(null);

  // ==============================
  // Fetch Departments
  // ==============================

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("admin/departments", {
        method: "GET",
        cache: "no-store",
      });

      const result =
        await parseApiResponse<ApiResponse<Department[]>>(response);

      setDepartments(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ==============================
  // Statistics
  // ==============================

  const stats = useMemo(() => {
    const total = departments.length;

    const active = departments.filter(
      (department) => department.is_active
    ).length;

    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [departments]);

  // ==============================
  // Search & Filtering
  // ==============================

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        department.name.toLowerCase().includes(searchValue) ||
        (department.description || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && department.is_active) ||
        (filter === "inactive" && !department.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [departments, search, filter]);

  // ==============================
  // Pagination
  // ==============================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / LIMIT)
  );

  const paginatedDepartments = useMemo(() => {
    const startIndex = (page - 1) * LIMIT;

    return filteredDepartments.slice(
      startIndex,
      startIndex + LIMIT
    );
  }, [filteredDepartments, page]);

  // Reset pagination on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // Keep page within valid range
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // ==============================
  // Open Create Modal
  // ==============================

  const openCreateModal = () => {
    setEditingDepartment(null);
    setForm(initialForm);

    setError("");
    setModalOpen(true);
  };

  // ==============================
  // Open Edit Modal
  // ==============================

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);

    setForm({
      name: department.name,
      description: department.description || "",
    });

    setError("");
    setModalOpen(true);
  };

  // ==============================
  // Close Modal
  // ==============================

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingDepartment(null);
    setForm(initialForm);
    setError("");
  };

  // ==============================
  // Create / Update Department
  // ==============================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
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

      const response = await apiRequest(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          name,
          description,
        }),
      });

      await parseApiResponse<ApiResponse<Department>>(response);

      setSuccess(
        isEditing
          ? "Department updated successfully."
          : "Department created successfully."
      );

      setModalOpen(false);
      setEditingDepartment(null);
      setForm(initialForm);

      await fetchDepartments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Department operation failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // Deactivate Department
  // ==============================

  const handleDeactivate = async (department: Department) => {
    if (!department.is_active) return;

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${department.name}?`
    );

    if (!confirmed) return;

    try {
      setActionId(department.id);

      setError("");
      setSuccess("");

      const response = await apiRequest(
        `admin/departments/${department.id}`,
        {
          method: "DELETE",
        }
      );

      await parseApiResponse<ApiResponse<Department>>(response);

      setSuccess("Department deactivated successfully.");

      await fetchDepartments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate department."
      );
    } finally {
      setActionId(null);
    }
  };

  // ==============================
  // Refresh
  // ==============================

  const handleRefresh = async () => {
    setSuccess("");
    await fetchDepartments();
  };

  // ==============================
  // Render
  // ==============================

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="container mx-auto space-y-7">

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
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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

        {/* Error Notification */}

        {error && !modalOpen && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertCircle size={18} />

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-auto"
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* Success Notification */}

        {success && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">

            <CheckCircle2 size={18} />

            <span>{success}</span>

            <button
              onClick={() => setSuccess("")}
              className="ml-auto"
              aria-label="Dismiss success"
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

                {/* Search */}

                <div className="relative">

                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search department..."
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:w-64"
                  />

                </div>

                {/* Filter */}

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

                  <th className="px-5 py-4 text-right font-semibold">
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
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center"
                    >
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

                      {/* Department */}

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
                          {department.description ||
                            "No description provided"}
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

                          {department.is_active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          {/* Edit */}

                          <button
                            onClick={() => openEditModal(department)}
                            title="Edit department"
                            disabled={!department.is_active}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Deactivate */}

                          <button
                            onClick={() => handleDeactivate(department)}
                            disabled={
                              actionId === department.id ||
                              !department.is_active
                            }
                            title="Deactivate department"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >

                            {actionId === department.id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
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
                : (page - 1) * LIMIT + 1}

              {" - "}

              {Math.min(
                page * LIMIT,
                filteredDepartments.length
              )}

              {" of "}

              {filteredDepartments.length} departments

            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-sm font-medium text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>

            </div>

          </div>

        </section>

      </div>

      {/* ==============================
          Create / Edit Modal
      ============================== */}

      {modalOpen && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">

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
                onClick={closeModal}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* Name */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department Name *
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
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

              </div>

              {/* Description */}

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
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.description.length}/1000
                </p>

              </div>

              {/* Modal Error */}

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              {/* Actions */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {submitting && (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
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

// ==============================
// Reusable Statistics Card
// ==============================

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: ReactNode;
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
