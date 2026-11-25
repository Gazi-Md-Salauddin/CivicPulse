import { apiUrl, parseApiResponse } from "./api";

export interface AddressSearchResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface AddressSearchResponse {
  success: boolean;
  message: string;
  data: AddressSearchResult[];
}

export async function searchIssueLocations(
  query: string,
  signal?: AbortSignal
): Promise<AddressSearchResult[]> {
  const response = await fetch(
    apiUrl(`issue/location/search?q=${encodeURIComponent(query)}`),
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    }
  );
  const result = await parseApiResponse<AddressSearchResponse>(response);
  return result.data;
}
