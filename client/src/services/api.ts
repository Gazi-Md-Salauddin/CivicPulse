
import { authClient } from "@/lib/auth-client";

export const apiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  return `${baseUrl}/${endpoint.replace(/^\/+/, "")}`;
};

export const getAccessToken = async (): Promise<string> => {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication required. Please login again.");
  }

  return data.token;
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await getAccessToken();

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(endpoint), {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });
};

export const parseApiResponse = async <T>(
  response: Response
): Promise<T> => {
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

// Reusable API client
export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await apiRequest(endpoint, {
      method: "GET",
    });

    return parseApiResponse<T>(response);
  },

  post: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await apiRequest(endpoint, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return parseApiResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await apiRequest(endpoint, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return parseApiResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await apiRequest(endpoint, {
      method: "DELETE",
    });

    return parseApiResponse<T>(response);
  },
};
