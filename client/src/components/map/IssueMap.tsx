"use client";

import dynamic from "next/dynamic";
import MapLoading from "./MapLoading";
import type { IssueMapProps } from "./types";

const IssueMap = dynamic(
  () => import("./LeafletMap.client").then((module) => module.IssueMapView),
  {
    ssr: false,
    loading: () => <MapLoading label="Loading issue map..." />,
  }
);

export default function IssueMapComponent(props: IssueMapProps) {
  return <IssueMap {...props} />;
}
