const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Department = {
  id: string;
  name: string;
  description: string;
  location: string;
  is_active: boolean;
  manager_id?: string | null;
};

export type DepartmentPayload = {
  name: string;
  description: string;
  location: string;
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}/admin/departments${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

// Get all departments
export const getDepartments = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/departments`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch public issues");
  }

  return result;

};

// Create department
export const createDepartment = async (data: DepartmentPayload) => {
  return request("", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Get department details
export const getDepartmentDetails = async (id: string) => {
  return request(`/${id}`);
};

// Update department
export const updateDepartment = async (
  id: string,
  data: DepartmentPayload
) => {
  return request(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// Assign department manager
export const assignDepartmentManager = async (
  id: string,
  manager_id: string
) => {
  return request(`/${id}/manager`, {
    method: "PATCH",
    body: JSON.stringify({ manager_id }),
  });
};

// Deactivate department
export const deactivateDepartment = async (id: string) => {
  return request(`/${id}`, {
    method: "DELETE",
  });
};
