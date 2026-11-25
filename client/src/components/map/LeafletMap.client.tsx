"use client";

import { useEffect, useState } from "react";
import L, { type LeafletEvent } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type {
  BaseMapProps,
  IssueMapItem,
  IssueMarkerProps,
  LocationPickerProps,
  MapCoordinate,
} from "./types";
import { isValidMapCoordinate } from "./types";
import MapError from "./MapError";

const markerIcon = L.icon({
  iconUrl:
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 1C7.72 1 1 7.72 1 16c0 10.5 15 25 15 25s15-14.5 15-25C31 7.72 24.28 1 16 1Z" fill="#0f766e" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#fff"/></svg>'
    ),
  iconSize: [32, 42],
  iconAnchor: [16, 41],
  popupAnchor: [0, -38],
});

function toLeafletPosition(coordinate: MapCoordinate): L.LatLngExpression {
  return [coordinate.latitude, coordinate.longitude];
}

function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

function MapViewport({
  center,
  zoom,
}: {
  center: MapCoordinate;
  zoom: number;
}) {
  const map = useMap();
  const { latitude, longitude } = center;

  useEffect(() => {
    map.setView([latitude, longitude], zoom);
  }, [latitude, longitude, map, zoom]);

  return null;
}

function MapClickHandler({
  onSelectCoordinates,
}: {
  onSelectCoordinates?: (coordinate: MapCoordinate) => void;
}) {
  useMapEvents({
    click(event) {
      onSelectCoordinates?.({
        latitude: event.latlng.lat,
        longitude: normalizeLongitude(event.latlng.lng),
      });
    },
  });

  return null;
}

function MapShell({
  center,
  zoom = 13,
  className = "",
  onSelectCoordinates,
  children,
}: BaseMapProps) {
  const [tileError, setTileError] = useState(false);

  return (
    <div
      className={`relative h-[360px] w-full overflow-hidden rounded-xl sm:h-[440px] ${className}`}
    >
      <MapContainer
        center={toLeafletPosition(center)}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => setTileError(false),
          }}
        />
        <MapViewport center={center} zoom={zoom} />
        <MapClickHandler onSelectCoordinates={onSelectCoordinates} />
        {children}
      </MapContainer>
      {tileError && (
        <div
          className="absolute left-3 right-3 top-3 z-[1000] rounded-lg border border-amber-300 bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow-sm"
          role="status"
        >
          Map tiles could not be loaded. Check your connection.
        </div>
      )}
    </div>
  );
}

export function BaseMapView(props: BaseMapProps) {
  if (!isValidMapCoordinate(props.center)) {
    return <MapError message="A valid map center is required." className={props.className} />;
  }

  return <MapShell {...props} />;
}

function IssueMarkerView({ issue }: IssueMarkerProps) {
  if (!isValidMapCoordinate(issue.coordinate)) {
    return null;
  }

  return (
    <Marker position={toLeafletPosition(issue.coordinate)} icon={markerIcon}>
      <Popup>
        <div className="min-w-40 space-y-1">
          <p className="font-semibold text-slate-900">{issue.title}</p>
          <p className="text-xs text-slate-600">{issue.category}</p>
          <p className="text-xs text-slate-600">Status: {issue.status}</p>
          {issue.locationAddress && (
            <p className="text-xs text-slate-600">{issue.locationAddress}</p>
          )}
          {issue.href && (
            <a
              href={issue.href}
              className="inline-block pt-1 text-xs font-semibold text-teal-700 underline"
            >
              View issue
            </a>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

function DraggableLocationMarker({
  position,
  onChange,
}: {
  position: MapCoordinate;
  onChange: LocationPickerProps["onChange"];
}) {
  const handleDragEnd = (event: LeafletEvent) => {
    if (!(event.target instanceof L.Marker)) {
      return;
    }

    const location = event.target.getLatLng();
    onChange({
      latitude: location.lat,
      longitude: normalizeLongitude(location.lng),
    });
  };

  return (
    <Marker
      position={toLeafletPosition(position)}
      icon={markerIcon}
      draggable
      eventHandlers={{ dragend: handleDragEnd }}
    >
      <Popup>Selected location</Popup>
    </Marker>
  );
}

export function LocationPickerView({
  position,
  center,
  onChange,
  zoom,
  className,
}: LocationPickerProps) {
  if (!isValidMapCoordinate(center)) {
    return <MapError message="Choose a valid location to display the map." className={className} />;
  }

  const selectedPosition = isValidMapCoordinate(position) ? position : null;

  return (
    <MapShell
      center={selectedPosition ?? center}
      zoom={zoom}
      className={className}
      onSelectCoordinates={onChange}
    >
      {selectedPosition && (
        <DraggableLocationMarker
          position={selectedPosition}
          onChange={onChange}
        />
      )}
    </MapShell>
  );
}

export function IssueMapView({
  issues,
  center,
  zoom,
  className,
}: {
  issues: IssueMapItem[];
  center?: MapCoordinate;
  zoom?: number;
  className?: string;
}) {
  const validIssues = issues.filter((issue) =>
    isValidMapCoordinate(issue.coordinate)
  );
  const mapCenter =
    center && isValidMapCoordinate(center)
      ? center
      : validIssues[0]?.coordinate;

  if (!mapCenter || !isValidMapCoordinate(mapCenter)) {
    return (
      <MapError
        message="There are no issues with valid coordinates to display."
        className={className}
      />
    );
  }

  return (
    <MapShell center={mapCenter} zoom={zoom} className={className}>
      {validIssues.map((issue) => (
        <IssueMarkerView key={issue.id} issue={issue} />
      ))}
    </MapShell>
  );
}

export function PublicIssueMarkerView(props: IssueMarkerProps) {
  return <IssueMarkerView {...props} />;
}
