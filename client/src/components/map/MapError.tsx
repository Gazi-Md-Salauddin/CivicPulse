import { AlertCircle } from "lucide-react";
import type { MapErrorProps } from "./types";

export default function MapError({
  message,
  onRetry,
  className = "",
}: MapErrorProps) {
  return (
    <div
      className={`flex min-h-80 w-full flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center ${className}`}
      role="alert"
    >
      <AlertCircle className="size-7 text-red-600" aria-hidden="true" />
      <p className="mt-3 max-w-lg text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
