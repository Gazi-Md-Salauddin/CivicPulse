import { authClient } from "@/lib/auth-client";
import { apiUrl, parseApiResponse } from "./api";

export type IssuePriority = "low" | "medium" | "high" | "critical";

export type IssueStatus =
  | "pending"
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected";

export interface IssueHistoryEntry {
  id: string;
  previous_status: string | null;
  new_status: string;
  public_message: string | null;
  internal_reason?: string | null;
  changed_by?: string;
  changed_by_name?: string;
  created_at: string;
}

export interface CompletionPhoto {
  id: string;
  image_url: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
}

export interface WorkNote {
  id: string;
  note: string;
  staff_id: string;
  staff_name?: string;
  created_at: string;
}

export interface AssignedStaff {
  id: string;
  name: string;
  email: string;
  image: string | null;
  assignedAt: string;
}

export interface WorkflowIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  reporter_id?: string;
  reporter_name?: string;
  reporter_email?: string;
  status: IssueStatus | string;
  priority: IssuePriority | null;
  created_at: string;
  updated_at: string;
  department_id?: string | null;
  department_name?: string | null;
  assigned_staff?: AssignedStaff[];
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  assigned_at?: string | null;
  assignment_id?: string | null;
  status_history?: IssueHistoryEntry[];
  work_notes?: WorkNote[];
  completion_photos?: CompletionPhoto[];
}

export interface StaffMember {
  id: string;
  staff_id?: string;
  name: string;
  email: string;
  image: string | null;
  is_active?: boolean;
  active_task_count?: number;
  completed_task_count?: number;
}

export interface ManagerIssueDetails extends WorkflowIssue {
  reporter_id: string;
  department_id: string;
  department_name: string;
  assigned_staff: AssignedStaff[];
  status_history: IssueHistoryEntry[];
  work_notes: WorkNote[];
  completion_photos: CompletionPhoto[];
}

export interface ManagerStaffList {
  department: {
    id: string;
    name: string;
  };
  staff: StaffMember[];
  membershipSupported: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}



const request = async <T>(
  endpoint: string,
  init: RequestInit = {}
): Promise<ApiEnvelope<T>> => {
  // Get JWT from Better Auth
  const result = await authClient.token();

  if (result.error || !result.data?.token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const headers = new Headers(init.headers);

  // Attach JWT
  headers.set("Authorization", `Bearer ${result.data.token}`);

  // JSON content type for non-FormData requests
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(endpoint), {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseApiResponse<ApiEnvelope<T>>(response);
};



const postJson = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
});

const patchJson = (body: unknown): RequestInit => ({
  method: "PATCH",
  body: JSON.stringify(body),
});

export const getManagerIssueDetails = (issueId: string) =>
  request<ManagerIssueDetails>(`manager/departmentissues/${issueId}`);

export const verifyManagerIssue = (issueId: string) =>
  request<WorkflowIssue>(
    `manager/departmentissues/${issueId}/verify`,
    postJson({})
  );

export const rejectManagerIssue = (issueId: string, reason: string) =>
  request<WorkflowIssue>(
    `manager/departmentissues/${issueId}/reject`,
    postJson({ reason })
  );

export const setManagerIssuePriority = (
  issueId: string,
  priority: IssuePriority
) =>
  request<WorkflowIssue>(
    `manager/departmentissues/${issueId}/priority`,
    patchJson({ priority })
  );

export const assignManagerIssue = (issueId: string, staffId: string) =>
  request<WorkflowIssue>(
    `manager/departmentissues/${issueId}/assign`,
    postJson({ staffId })
  );

export const closeManagerIssue = (issueId: string) =>
  request<WorkflowIssue>(
    `manager/departmentissues/${issueId}/close`,
    patchJson({})
  );

export const getManagerStaff = () =>
  request<ManagerStaffList>("manager/staff");

export const getManagerStaffCandidates = () =>
  request<StaffMember[]>("manager/staff/candidates");

export const addManagerStaff = (staffId: string) =>
  request<StaffMember>("manager/staff", postJson({ staffId }));

export const deactivateManagerStaff = (staffId: string) =>
  request<StaffMember>(`manager/staff/${staffId}`, {
    method: "DELETE",
  });

export const getMaintenanceDashboard = () =>
  request<{
    total_assigned: number;
    pending: number;
    in_progress: number;
    resolved: number;
    recentIssues: WorkflowIssue[];
  }>("maintenance/dashboard");

export const getMaintenanceIssues = () =>
  request<WorkflowIssue[]>("maintenance/issues");

export const getMaintenanceIssue = (issueId: string) =>
  request<WorkflowIssue>(`maintenance/issues/${issueId}`);

export const updateMaintenanceIssueStatus = (
  issueId: string,
  status: "in_progress" | "resolved"
) =>
  request<WorkflowIssue>(
    `maintenance/issues/${issueId}/status`,
    patchJson({ status })
  );

export const addMaintenanceWorkNote = (issueId: string, note: string) =>
  request<WorkNote>(
    `maintenance/issues/${issueId}/notes`,
    postJson({ note })
  );

export const getMaintenanceWorkNotes = (issueId: string) =>
  request<WorkNote[]>(`maintenance/issues/${issueId}/notes`);

export const uploadMaintenanceCompletionPhotos = (
  issueId: string,
  files: File[]
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));

  return request<CompletionPhoto[]>(
    `maintenance/issues/${issueId}/completion-photos`,
    {
      method: "POST",
      body: formData,
    }
  );
};

export interface CitizenIssueDetails extends WorkflowIssue {
  statusHistory: IssueHistoryEntry[];
}

export const getCitizenIssueDetails = (issueId: string) =>
  request<CitizenIssueDetails>(`issue/${issueId}`);

export const getCitizenIssueHistory = (issueId: string) =>
  request<IssueHistoryEntry[]>(`issue/${issueId}/history`);

export interface AdminIssueList {
  issues: WorkflowIssue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getAdminIssues = (options: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) => {
  const query = new URLSearchParams({
    page: String(options.page),
    limit: String(options.limit),
  });
  if (options.status) query.set("status", options.status);
  if (options.search?.trim()) query.set("search", options.search.trim());

  return request<AdminIssueList>(`admin/issues?${query.toString()}`);
};

export const getAdminIssueDetails = (issueId: string) =>
  request<WorkflowIssue>(`admin/issues/${issueId}`);

export interface AdminDepartmentOverview {
  department_id: string;
  department_name: string;
  is_active: boolean;
  total_issues: number;
  submitted_issues: number;
  under_review_issues: number;
  assigned_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  closed_issues: number;
  rejected_issues: number;
}

export const getAdminDepartmentIssueOverview = () =>
  request<AdminDepartmentOverview[]>("admin/issues/departments/overview");
