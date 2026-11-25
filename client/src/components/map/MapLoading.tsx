import { LoaderCircle } from "lucide-react";
import type { MapLoadingProps } from "./types";

export default function MapLoading({
  label = "Loading interactive map...",
  className = "",
}: MapLoadingProps) {
  return (
    <div
      className={`flex min-h-80 w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-600 ${className}`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="mr-2 size-5 animate-spin text-teal-700" />
      {label}
    </div>
  );
}
