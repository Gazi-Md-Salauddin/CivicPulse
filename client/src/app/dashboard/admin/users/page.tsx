"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  parseApiResponse,
} from "@/services/api";
import {
  Search,
  Users,
  ShieldCheck,
  UserRound,
  Wrench,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCog,
  AlertCircle,
  CheckCircle2,
  Ban,
  UserCheck,
  X,
} from "lucide-react";

type UserRole =
  | "admin"
  | "department_manager"
  | "maintenance_staff"
  | "citizen";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  address?: string | null;
  is_active: boolean;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
};


const roles: UserRole[] = [
  "admin",
  "department_manager",
  "maintenance_staff",
  "citizen",
];

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  department_manager: "Department Manager",
  maintenance_staff: "Maintenance Staff",
  citizen: "Citizen",
};

const roleStyles: Record<UserRole, string> = {
  admin: "bg-purple-50 text-purple-700",
  department_manager: "bg-blue-50 text-blue-700",
  maintenance_staff: "bg-amber-50 text-amber-700",
  citizen: "bg-teal-50 text-teal-700",
};

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1,
  });

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const limit = 8;

  // Fetch users with server-side search and pagination
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
      });

      if (selectedRole !== "all") {
        params.set("role", selectedRole);
      }

      const response = await apiRequest(
        `admin/users?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        await parseApiResponse<ApiResponse<User[]>>(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load users");
      }

      setUsers(result.data || []);

      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Statistics for the currently loaded page
  const stats = useMemo(
    () => ({
      total: pagination.total,
      admins: users.filter((u) => u.role === "admin").length,
      managers: users.filter(
        (u) => u.role === "department_manager"
      ).length,
      staff: users.filter(
        (u) => u.role === "maintenance_staff"
      ).length,
      citizens: users.filter((u) => u.role === "citizen").length,
    }),
    [users, pagination.total]
  );

  // Change user role
  const handleRoleChange = async (
    userId: string,
    newRole: UserRole
  ) => {
    try {
      setUpdatingId(userId);
      setError("");
      setSuccess("");

      const response = await apiRequest(
        `admin/users/${userId}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: newRole }),
        }
      );

      const result = await parseApiResponse<ApiResponse<User>>(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update role");
      }

      setSuccess("User role updated successfully.");

      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Role update failed"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Activate / Deactivate user
  const handleUserStatus = async (
    userId: string,
    isActive: boolean
  ) => {
    const action = isActive ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(userId);
      setError("");
      setSuccess("");

      const response = await apiRequest(
        `admin/users/${userId}/${action}`,
        {
          method: "PATCH",
        }
      );

      const result = await parseApiResponse<ApiResponse<User>>(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Failed to ${action} user`
        );
      }

      setSuccess(
        isActive
          ? "User activated successfully."
          : "User deactivated successfully."
      );

      await fetchUsers();

      if (selectedUser?.id === userId) {
        setSelectedUser({
          ...selectedUser,
          is_active: isActive,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status update failed"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Get user details
  const handleViewDetails = async (userId: string) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await apiRequest(
        `admin/users/${userId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await parseApiResponse<ApiResponse<User>>(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to get user");
      }

      setSelectedUser(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedRole]);

  const statCards = [
    {
      label: "Total Users",
      value: stats.total,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Administrators",
      value: stats.admins,
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Department Managers",
      value: stats.managers,
      icon: Building2,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Maintenance Staff",
      value: stats.staff,
      icon: Wrench,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Citizens",
      value: stats.citizens,
      icon: UserRound,
      color: "bg-teal-50 text-teal-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Administration / Users
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              User Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage users, permissions and system access.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-5 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto"
              aria-label="Dismiss error"
            >
              <X size={16} />
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
              aria-label="Dismiss success"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Users Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Users
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage registered CivicPulse accounts.
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
                    placeholder="Search name or email..."
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:w-64"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600"
                >
                  <option value="all">All Roles</option>

                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Joined Date</th>
                  <th className="px-5 py-4 font-semibold">User ID</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      <RefreshCw className="mx-auto mb-3 animate-spin" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Users size={35} className="mx-auto text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-700">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                              {getInitials(user.name)}
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {user.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${roleStyles[user.role]
                            }`}
                        >
                          {roleLabels[user.role]}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${user.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${user.is_active
                              ? "bg-green-500"
                              : "bg-red-500"
                              }`}
                          />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* ID */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-500">
                          {user.id.slice(0, 8)}...
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          {/* View Details */}
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            disabled={detailsLoading}
                            title="View Details"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Role Change */}
                          <div className="relative">
                            <UserCog
                              size={15}
                              className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <select
                              value={user.role}
                              disabled={updatingId === user.id}
                              onChange={(e) =>
                                handleRoleChange(
                                  user.id,
                                  e.target.value as UserRole
                                )
                              }
                              className="rounded-md border border-slate-200 bg-white py-2 pl-7 pr-2 text-xs font-medium outline-none focus:border-teal-600 disabled:opacity-50"
                            >
                              {roles.map((role) => (
                                <option key={role} value={role}>
                                  {roleLabels[role]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Activate / Deactivate */}
                          <button
                            onClick={() =>
                              handleUserStatus(
                                user.id,
                                !user.is_active
                              )
                            }
                            disabled={updatingId === user.id}
                            title={
                              user.is_active
                                ? "Deactivate User"
                                : "Activate User"
                            }
                            className={`rounded-lg p-2 transition disabled:opacity-50 ${user.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                          >
                            {user.is_active ? (
                              <Ban size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>

                          {updatingId === user.id && (
                            <RefreshCw
                              size={14}
                              className="animate-spin text-teal-700"
                            />
                          )}
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
              {pagination.total === 0
                ? 0
                : (page - 1) * limit + 1}
              {" - "}
              {Math.min(page * limit, pagination.total)}
              {" of "}
              {pagination.total} users
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-sm font-medium text-slate-700">
                {page} / {Math.max(1, pagination.totalPages)}
              </span>

              <button
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                User Details
              </h2>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="py-6 text-center">
              {selectedUser.image ? (
                <img
                  src={selectedUser.image}
                  alt={selectedUser.name}
                  className="mx-auto h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
                  {getInitials(selectedUser.name)}
                </div>
              )}

              <h3 className="mt-3 text-lg font-bold text-slate-900">
                {selectedUser.name}
              </h3>

              <p className="text-sm text-slate-500">
                {selectedUser.email}
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">Role</span>
                <span className="text-sm font-semibold text-slate-800">
                  {roleLabels[selectedUser.role]}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">Status</span>
                <span
                  className={`text-sm font-semibold ${selectedUser.is_active
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {selectedUser.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">Address</span>
                <span className="max-w-[60%] text-right text-sm font-medium text-slate-800">
                  {selectedUser.address || "Not provided"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">Joined</span>
                <span className="text-sm font-medium text-slate-800">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-sm text-slate-500">User ID</span>
                <span className="max-w-[60%] break-all text-right text-xs text-slate-600">
                  {selectedUser.id}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-5 w-full rounded-lg bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
