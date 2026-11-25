export function isValidIssueCoordinatePair(
  latitude: unknown,
  longitude: unknown
): boolean {
  const hasLatitude = latitude !== undefined && latitude !== null;
  const hasLongitude = longitude !== undefined && longitude !== null;

  if (!hasLatitude && !hasLongitude) {
    return true;
  }

  if (!hasLatitude || !hasLongitude) {
    return false;
  }

  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}
