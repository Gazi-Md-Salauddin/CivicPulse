import pool from "../config/db.js";

export interface NominatimSearchResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

export class AddressSearchError extends Error {
  constructor(
    message: string,
    readonly statusCode: 502 | 504
  ) {
    super(message);
    this.name = "AddressSearchError";
  }
}

const cache = new Map<
  string,
  { expiresAt: number; results: NominatimSearchResult[] }
>();
const cacheTtlMs = 24 * 60 * 60 * 1000;
const maxCacheEntries = 500;
const requestTimeoutMs = 8000;
const advisoryLockKeys = [1129730131, 1313819977] as const;
const nominatimUserAgent =
  "CivicPulse/1.0 (+https://github.com/Gazi-Md-Salauddin/CivicPulse)";

function getCachedResults(key: string) {
  const entry = cache.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  cache.delete(key);
  cache.set(key, entry);
  return entry.results;
}

function cacheResults(key: string, results: NominatimSearchResult[]) {
  cache.set(key, { expiresAt: Date.now() + cacheTtlMs, results });

  if (cache.size > maxCacheEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }
}

function parseResults(payload: unknown): NominatimSearchResult[] {
  if (!Array.isArray(payload)) {
    throw new AddressSearchError(
      "The address search service returned an invalid response.",
      502
    );
  }

  return payload.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const record = item as Record<string, unknown>;
    if (
      typeof record.lat !== "string" ||
      typeof record.lon !== "string" ||
      !record.lat.trim() ||
      !record.lon.trim()
    ) {
      return [];
    }

    const latitude = Number(record.lat);
    const longitude = Number(record.lon);

    if (
      typeof record.display_name !== "string" ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return [];
    }

    return [{ displayName: record.display_name, latitude, longitude }];
  });
}

export async function searchNominatim(
  query: string
): Promise<NominatimSearchResult[]> {
  const normalizedQuery = query.trim().replace(/\s+/g, " ").toLowerCase();

  if (normalizedQuery.length < 3 || normalizedQuery.length > 200) {
    throw new AddressSearchError(
      "Search text must be between 3 and 200 characters.",
      502
    );
  }

  const cachedResults = getCachedResults(normalizedQuery);
  if (cachedResults) {
    return cachedResults;
  }

  const client = await pool.connect();
  let lockAcquired = false;
  let sentUpstreamRequest = false;

  try {
    await client.query("SET statement_timeout = '15000ms'");
    try {
      await client.query(
        "SELECT pg_advisory_lock($1::integer, $2::integer)",
        [...advisoryLockKeys]
      );
      lockAcquired = true;
    } finally {
      await client.query("RESET statement_timeout");
    }

    const resultsAfterLock = getCachedResults(normalizedQuery);
    if (resultsAfterLock) {
      return resultsAfterLock;
    }

    sentUpstreamRequest = true;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      requestTimeoutMs
    );
    const queryParameters = new URLSearchParams({
      q: query.trim().replace(/\s+/g, " "),
      format: "jsonv2",
      limit: "5",
    });
    const baseUrl = new URL((
      process.env.NOMINATIM_BASE_URL ||
      "https://nominatim.openstreetmap.org"
    ).replace(/\/+$/, ""));

    if (baseUrl.protocol !== "https:") {
      throw new AddressSearchError(
        "Address search requires a secure geocoding service.",
        502
      );
    }

    try {
      const response = await fetch(
        `${baseUrl.toString()}/search?${queryParameters.toString()}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "User-Agent": nominatimUserAgent,
          },
          signal: controller.signal,
        }
      );
      if (!response.ok) {
        throw new AddressSearchError(
          "Address search is temporarily unavailable.",
          502
        );
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new AddressSearchError(
          "The address search service returned an invalid response.",
          502
        );
      }

      const results = parseResults(payload);
      cacheResults(normalizedQuery, results);
      return results;
    } catch (error) {
      if (error instanceof AddressSearchError) {
        throw error;
      }

      if (controller.signal.aborted) {
        throw new AddressSearchError(
          "Address search timed out. Please try again.",
          504
        );
      }

      throw new AddressSearchError(
        "Address search is temporarily unavailable.",
        502
      );
    } finally {
      clearTimeout(timeout);
    }
  } finally {
    try {
      if (lockAcquired) {
        try {
          if (sentUpstreamRequest) {
            await client.query("SELECT pg_sleep(1)");
          }
        } finally {
          await client.query(
            "SELECT pg_advisory_unlock($1::integer, $2::integer)",
            [...advisoryLockKeys]
          );
        }
      }
    } finally {
      client.release();
    }
  }
}
