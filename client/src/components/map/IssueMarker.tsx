"use client";

import dynamic from "next/dynamic";
import MapLoading from "./MapLoading";
import type { IssueMarkerProps } from "./types";

const IssueMarker = dynamic(
  () =>
    import("./LeafletMap.client").then(
      (module) => module.PublicIssueMarkerView
    ),
  {
    ssr: false,
    loading: () => <MapLoading label="Loading issue marker..." />,
  }
);

export default function IssueMarkerComponent(props: IssueMarkerProps) {
  return <IssueMarker {...props} />;
}
