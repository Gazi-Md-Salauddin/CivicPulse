"use client";

import dynamic from "next/dynamic";
import MapLoading from "./MapLoading";
import type { BaseMapProps } from "./types";

const BaseMap = dynamic(
  () => import("./LeafletMap.client").then((module) => module.BaseMapView),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function BaseMapComponent(props: BaseMapProps) {
  return <BaseMap {...props} />;
}
