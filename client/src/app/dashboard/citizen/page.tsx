
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/citizen/Dashboardlayout";
import { getIssues } from "@/services/issue.service";
import type { IIssue } from "@/types/issue.types";


export default function CitizenDashboard() {
  const [issues, setIssues] = useState<IIssue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    getIssues()
      .then((response) => {
        if (active) {
          setIssues(response.data);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load your reports."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  if (error) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => {
            setIssues(null);
            setError(null);
            setRetryCount((count) => count + 1);
          }}
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Try again
        </button>
      </main>
    );
  }

  if (!issues) {
    return (
      <main
        className="flex min-h-[50vh] items-center justify-center p-6 text-sm text-slate-600"
        role="status"
      >
        Loading your reports...
      </main>
    );
  }

  return (
    <div className="flex bg-[#F5FAF9] text-slate-800">
      <DashboardLayout issues={issues} />
    </div>
  );
}
