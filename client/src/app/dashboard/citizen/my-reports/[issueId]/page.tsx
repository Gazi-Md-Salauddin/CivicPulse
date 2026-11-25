"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  getCitizenIssueDetails,
  type IssueHistoryEntry,
  type WorkflowIssue,
} from "@/services/issue-workflow.service";

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function CitizenIssueDetailsContent() {
  const params = useParams<{ issueId: string }>();
  const router = useRouter();
  const issueId = params.issueId;
  const [issue, setIssue] = useState<WorkflowIssue | null>(null);
  const [history, setHistory] = useState<IssueHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIssue = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const issueResponse = await getCitizenIssueDetails(issueId);
      setIssue(issueResponse.data);
      setHistory(issueResponse.data.statusHistory);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load this report."
      );
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (issueId) void loadIssue();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [issueId, loadIssue]);

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center text-gray-500">
          <RefreshCw className="mx-auto animate-spin text-[#0F766E]" size={28} />
          <p className="mt-3 text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <AlertCircle size={34} className="text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Unable to load report
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {error || "This report could not be found."}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
          >
            Go back
          </button>
          <button
            onClick={() => void loadIssue()}
            className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={() => router.push("/dashboard/citizen/my-reports")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0F766E]"
        >
          <ArrowLeft size={17} />
          Back to my reports
        </button>

        <header className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0F766E]">
                {formatLabel(issue.category)}
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                {issue.title}
              </h1>
              <p className="mt-2 break-all text-xs text-gray-400">
                Report ID: {issue.id}
              </p>
            </div>
            <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-[#0F766E]">
              {formatLabel(issue.status)}
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Report details</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {issue.description || "No description provided."}
              </p>
              {issue.image_url ? (
                <a
                  className="mt-5 block"
                  href={issue.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={issue.image_url}
                    alt={`Photo for ${issue.title}`}
                    className="max-h-96 w-full rounded-xl object-cover"
                  />
                </a>
              ) : (
                <div className="mt-5 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                  <ImageIcon size={25} />
                  <span className="mt-2">No photo attached</span>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Status history</h2>
              {history.length ? (
                <ol className="mt-5 space-y-5">
                  {history.map((entry) => (
                    <li key={entry.id} className="flex gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#0F766E]">
                        {entry.new_status === "resolved" ||
                        entry.new_status === "closed" ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <Clock3 size={17} />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatLabel(entry.new_status)}
                        </p>
                        {entry.public_message && (
                          <p className="mt-1 text-sm text-gray-600">
                            {entry.public_message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                  Status history will appear as your report is reviewed.
                </p>
              )}
            </section>

            {issue.completion_photos && issue.completion_photos.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-gray-900">
                  Resolution photos
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {issue.completion_photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={photo.image_url}
                        alt="Photo showing completed maintenance work"
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Location</h2>
              <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#0F766E]" />
                {issue.location_address || "No address provided"}
              </p>
              {issue.latitude !== null && issue.longitude !== null && (
                <a
                  href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-[#0F766E] hover:underline"
                >
                  View on map
                </a>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Report information</h2>
              <div className="mt-4 space-y-4 text-sm">
                <p>
                  <span className="block text-xs text-gray-400">Priority</span>
                  <span className="mt-1 block font-medium text-gray-800">
                    {issue.priority
                      ? formatLabel(issue.priority)
                      : "Not assigned"}
                  </span>
                </p>
                <p>
                  <span className="block text-xs text-gray-400">Department</span>
                  <span className="mt-1 block font-medium text-gray-800">
                    {issue.department_name || "Not assigned"}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CalendarDays size={16} className="mt-0.5 text-[#0F766E]" />
                  <span>
                    <span className="block text-xs text-gray-400">
                      Submitted
                    </span>
                    <span className="mt-1 block font-medium text-gray-800">
                      {formatDate(issue.created_at)}
                    </span>
                  </span>
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CitizenIssueDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] items-center justify-center text-sm text-gray-500">
          Loading report...
        </div>
      }
    >
      <CitizenIssueDetailsContent />
    </Suspense>
  );
}
