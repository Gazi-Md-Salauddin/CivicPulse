import { apiUrl, parseApiResponse } from "./api";

export type Department = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  is_active: boolean;
  manager_id?: string | null;
};

export type DepartmentPayload = {
  name: string;
  description: string;
  location: string;
};

type DepartmentResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(apiUrl(`admin/departments${endpoint}`), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return parseApiResponse<T>(response);
};

// Get all departments
export const getDepartments = () =>
  request<DepartmentResponse<Department[]>>("");

// Create department
export const createDepartment = (data: DepartmentPayload) => {
  return request<DepartmentResponse<Department>>("", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Get department details
export const getDepartmentDetails = (id: string) =>
  request<DepartmentResponse<Department>>(`/${id}`);

// Update department
export const updateDepartment = async (
  id: string,
  data: DepartmentPayload
) => {
  return request<DepartmentResponse<Department>>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// Assign department manager
export const assignDepartmentManager = async (
  id: string,
  manager_id: string
) => {
  return request<DepartmentResponse<Department>>(`/${id}/manager`, {
    method: "PATCH",
    body: JSON.stringify({ manager_id }),
  });
};

// Deactivate department
export const deactivateDepartment = (id: string) => {
  return request<DepartmentResponse<Department>>(`/${id}`, {
    method: "DELETE",
  });
};
