"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Users,
  Pencil,
  UserRoundCog,
  Power,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  Department,
  DepartmentPayload,
  getDepartments,
  createDepartment,
  updateDepartment,
  assignDepartmentManager,
  deactivateDepartment,
} from "@/services/department.service";

const initialForm: DepartmentPayload = {
  name: "",
  description: "",
  location: "",
};

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [modal, setModal] = useState<
    "create" | "edit" | "manager" | null
  >(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const [form, setForm] = useState<DepartmentPayload>(initialForm);
  const [managerId, setManagerId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getDepartments();

      setDepartments(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load departments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Statistics
  const totalDepartments = departments.length;

  const activeDepartments = departments.filter(
    (department) => department.is_active !== false
  ).length;

  const inactiveDepartments =
    totalDepartments - activeDepartments;

  const assignedManagers = departments.filter(
    (department) => department.manager_id
  ).length;

  // Search and filtering
  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch =
        department.name.toLowerCase().includes(search.toLowerCase()) ||
        (department.location ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const isActive = department.is_active !== false;

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && isActive) ||
        (activeFilter === "inactive" && !isActive);

      return matchesSearch && matchesFilter;
    });
  }, [departments, search, activeFilter]);

  // Open create modal
  const openCreateModal = () => {
    setSelectedDepartment(null);
    setForm(initialForm);
    setModal("create");
    setError("");
  };

  // Open edit modal
  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);

    setForm({
      name: department.name,
      description: department.description ?? "",
      location: department.location ?? "",
    });

    setModal("edit");
    setError("");
  };

  // Open manager modal
  const openManagerModal = (department: Department) => {
    setSelectedDepartment(department);
    setManagerId(department.manager_id || "");
    setModal("manager");
    setError("");
  };

  // Form input handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Create / Update department
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.location.trim()) {
      setError("Department name and location are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (modal === "create") {
        await createDepartment(form);
        setSuccess("Department created successfully.");
      } else if (modal === "edit" && selectedDepartment) {
        await updateDepartment(selectedDepartment.id, form);
        setSuccess("Department updated successfully.");
      }

      setModal(null);
      await fetchDepartments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Operation failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Assign manager
  const handleAssignManager = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDepartment || !managerId.trim()) {
      setError("Please provide a valid manager ID.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await assignDepartmentManager(
        selectedDepartment.id,
        managerId.trim()
      );

      setSuccess("Department manager assigned successfully.");

      setModal(null);
      await fetchDepartments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Manager assignment failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Deactivate department
  const handleDeactivate = async (department: Department) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${department.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deactivateDepartment(department.id);

      setSuccess("Department deactivated successfully.");

      await fetchDepartments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Deactivation failed"
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto container space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-2 text-sm text-teal-700">
              <Building2 size={17} />
              Admin Dashboard
            </div>

            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Department Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage departments and assign department managers.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Plus size={18} />
            Create Department
          </button>

        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
            <button onClick={() => setError("")} className="ml-auto">
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
            <button onClick={() => setSuccess("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Departments"
            value={totalDepartments}
            icon={<Building2 size={21} />}
          />

          <StatCard
            title="Active Departments"
            value={activeDepartments}
            icon={<Power size={21} />}
          />

          <StatCard
            title="Inactive Departments"
            value={inactiveDepartments}
            icon={<AlertCircle size={21} />}
          />

          <StatCard
            title="Assigned Managers"
            value={assignedManagers}
            icon={<Users size={21} />}
          />

        </div>

        {/* Department List */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="font-bold text-slate-900">
                All Departments
              </h2>
              <p className="mt-1 text-xs text-slate-500">
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
                  placeholder="Search departments..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-600 sm:w-64"
                />
              </div>

              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
              >
                <option value="all">All Departments</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={fetchDepartments}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="animate-spin text-teal-700" size={30} />
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <Building2 size={38} className="text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-800">
                No departments found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create a department or change your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Manager</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredDepartments.map((department) => (
                    <tr
                      key={department.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                            <Building2 size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {department.name}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {department.description}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={15} className="text-teal-700" />
                          {department.location}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {department.manager_id ? (
                          <span className="text-xs font-medium text-green-700">
                            Manager Assigned
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            department.is_active !== false
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {department.is_active !== false
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEditModal(department)}
                            disabled={department.is_active === false}
                            title="Edit Department"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-teal-600 hover:text-teal-700 disabled:opacity-40"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => openManagerModal(department)}
                            disabled={department.is_active === false}
                            title="Assign Manager"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-600 hover:text-blue-700 disabled:opacity-40"
                          >
                            <UserRoundCog size={17} />
                          </button>

                          {department.is_active !== false && (
                            <button
                              onClick={() => handleDeactivate(department)}
                              title="Deactivate Department"
                              className="rounded-lg border border-slate-200 p-2 text-red-500 hover:border-red-500 hover:bg-red-50"
                            >
                              <Power size={16} />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            Showing {filteredDepartments.length} of {totalDepartments} departments
          </div>

        </section>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">

            <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">

              <div className="flex items-center justify-between border-b border-slate-100 p-5">

                <div>
                  <h2 className="font-bold text-slate-900">
                    {modal === "create"
                      ? "Create Department"
                      : modal === "edit"
                      ? "Update Department"
                      : "Assign Department Manager"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {modal === "manager"
                      ? selectedDepartment?.name
                      : "Enter department information."}
                  </p>
                </div>

                <button
                  onClick={() => setModal(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>

              </div>

              {modal === "manager" ? (
                <form onSubmit={handleAssignManager} className="space-y-5 p-5">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Department Manager User ID
                    </label>

                    <input
                      value={managerId}
                      onChange={(e) => setManagerId(e.target.value)}
                      placeholder="Enter manager user UUID"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                      required
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Enter the ID of an existing user whose role is department_manager.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={submitting}
                      className="flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      Assign Manager
                    </button>
                  </div>

                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 p-5">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Department Name *
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Road Maintenance"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe department responsibilities..."
                      className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Location *
                    </label>

                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Dhaka"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={submitting}
                      className="flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {submitting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}

                      {modal === "create" ? "Create Department" : "Save Changes"}
                    </button>

                  </div>

                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// Reusable Statistics Card
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          {icon}
        </div>

      </div>
    </div>
  );
}
