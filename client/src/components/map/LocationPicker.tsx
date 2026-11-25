"use client";

import dynamic from "next/dynamic";
import MapLoading from "./MapLoading";
import type { LocationPickerProps } from "./types";

const LocationPicker = dynamic(
  () =>
    import("./LeafletMap.client").then((module) => module.LocationPickerView),
  {
    ssr: false,
    loading: () => <MapLoading label="Loading location picker..." />,
  }
);

export default function LocationPickerComponent(props: LocationPickerProps) {
  return <LocationPicker {...props} />;
}
