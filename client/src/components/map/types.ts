import type { ReactNode } from "react";

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface IssueMapItem {
  id: string;
  title: string;
  category: string;
  status: string;
  locationAddress?: string | null;
  coordinate: MapCoordinate;
  href?: string;
}

export interface BaseMapProps {
  center: MapCoordinate;
  zoom?: number;
  className?: string;
  onSelectCoordinates?: (coordinate: MapCoordinate) => void;
  children?: ReactNode;
}

export interface LocationPickerProps {
  position: MapCoordinate;
  onChange: (coordinate: MapCoordinate) => void;
  zoom?: number;
  className?: string;
}

export interface IssueMarkerProps {
  issue: IssueMapItem;
}

export interface IssueMapProps {
  issues: IssueMapItem[];
  center?: MapCoordinate;
  zoom?: number;
  className?: string;
}

export interface MapLoadingProps {
  label?: string;
  className?: string;
}

export interface MapErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function isValidMapCoordinate(
  coordinate: MapCoordinate | null | undefined
): coordinate is MapCoordinate {
  return (
    coordinate !== null &&
    coordinate !== undefined &&
    Number.isFinite(coordinate.latitude) &&
    Number.isFinite(coordinate.longitude) &&
    coordinate.latitude >= -90 &&
    coordinate.latitude <= 90 &&
    coordinate.longitude >= -180 &&
    coordinate.longitude <= 180
  );
}
