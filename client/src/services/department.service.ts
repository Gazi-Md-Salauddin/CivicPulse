
import { apiRequest, parseApiResponse } from "./api";

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
  const response = await apiRequest(
    `admin/departments${endpoint}`,
    options
  );

  return parseApiResponse<T>(response);
};

export const getDepartments = () =>
  request<DepartmentResponse<Department[]>>("");

export const createDepartment = (data: DepartmentPayload) =>
  request<DepartmentResponse<Department>>("", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getDepartmentDetails = (id: string) =>
  request<DepartmentResponse<Department>>(`/${id}`);

export const updateDepartment = (
  id: string,
  data: DepartmentPayload
) =>
  request<DepartmentResponse<Department>>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const assignDepartmentManager = (
  id: string,
  manager_id: string
) =>
  request<DepartmentResponse<Department>>(`/${id}/manager`, {
    method: "PATCH",
    body: JSON.stringify({ manager_id }),
  });

export const deactivateDepartment = (id: string) =>
  request<DepartmentResponse<Department>>(`/${id}`, {
    method: "DELETE",
  });
