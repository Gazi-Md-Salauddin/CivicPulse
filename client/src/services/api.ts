
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export const apiUrl = (endpoint: string): string => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return `${API_URL}/${endpoint.replace(/^\/+/, "")}`;
};

const getErrorMessage = (payload: unknown): string | undefined => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return undefined;
};

export const parseApiResponse = async <T>(
  response: Response
): Promise<T> => {
  const contentType = response.headers.get("content-type")?.toLowerCase();

  if (!contentType?.includes("json")) {
    throw new Error(
      response.ok
        ? "The server returned a non-JSON response."
        : `The request failed (${response.status}).`
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an invalid JSON response.");
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) || `The request failed (${response.status}).`
    );
  }

  return payload as T;
}

export const api = {
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(apiUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return parseApiResponse<T>(response);
  },
};
