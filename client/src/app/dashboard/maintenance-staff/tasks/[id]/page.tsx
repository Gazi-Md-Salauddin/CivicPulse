"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  Send,
  Upload,
} from "lucide-react";
import {
  addMaintenanceWorkNote,
  getMaintenanceIssue,
  getMaintenanceWorkNotes,
  updateMaintenanceIssueStatus,
  uploadMaintenanceCompletionPhotos,
  type WorkflowIssue,
  type WorkNote,
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

function MaintenanceTaskDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const issueId = params.id;
  const [issue, setIssue] = useState<WorkflowIssue | null>(null);
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [issueResponse, notesResponse] = await Promise.all([
        getMaintenanceIssue(issueId),
        getMaintenanceWorkNotes(issueId),
      ]);
      setIssue(issueResponse.data);
      setNotes(notesResponse.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load this assigned task."
      );
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (issueId) void loadTask();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [issueId, loadTask]);

  const runAction = async (
    action: () => Promise<unknown>,
    message: string
  ) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await action();
      await loadTask();
      setSuccess(message);
      setNote("");
      setFiles([]);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to complete this task operation."
      );
    } finally {
      setSaving(false);
    }
  };

  const onFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const selected = Array.from(selectedFiles);
    if (
      selected.length > 5 ||
      selected.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size <= 0 ||
          file.size > 5 * 1024 * 1024
      )
    ) {
      setError("Choose up to 5 JPEG, PNG, or WEBP images, each no larger than 5 MB.");
      setFiles([]);
      return;
    }
    setError("");
    setFiles(selected);
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center text-gray-500">
          <RefreshCw size={28} className="mx-auto animate-spin text-[#0F766E]" />
          <p className="mt-3 text-sm">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <AlertCircle size={34} className="text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Unable to load task
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {error || "This task is not assigned to your account."}
        </p>
        <button
          onClick={() => void loadTask()}
          className="mt-5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const active = issue.status === "assigned" || issue.status === "in_progress";

  return (
    <main className="min-h-screen bg-[#F5FAF9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto container space-y-6">
        <button
          onClick={() => router.push("/dashboard/maintenance-staff")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0F766E]"
        >
          <ArrowLeft size={17} />
          Back to assigned tasks
        </button>

        <header className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">
                Task ID: {issue.id}
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                {issue.title}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {formatLabel(issue.category)}
              </p>
            </div>
            <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-[#0F766E]">
              {formatLabel(issue.status)}
            </span>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,1fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Issue details</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {issue.description || "No description provided."}
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#0F766E]" />
                {issue.location_address || "No address provided"}
              </p>
              {issue.image_url && (
                <a
                  href={issue.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 block"
                >
                  <img
                    src={issue.image_url}
                    alt={`Issue evidence for ${issue.title}`}
                    className="max-h-96 w-full rounded-xl object-cover"
                  />
                </a>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Work notes</h2>
              {notes.length ? (
                <ul className="mt-4 space-y-3">
                  {notes.map((item) => (
                    <li key={item.id} className="rounded-xl bg-gray-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {item.note}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        {formatDate(item.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  No maintenance notes have been added.
                </p>
              )}
              {active && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <label
                    htmlFor="work-note"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Add a progress note
                  </label>
                  <textarea
                    id="work-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={4000}
                    rows={4}
                    placeholder="Describe the work performed or progress made."
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#0F766E]"
                  />
                  <button
                    disabled={saving || !note.trim()}
                    onClick={() =>
                      void runAction(
                        () => addMaintenanceWorkNote(issue.id, note.trim()),
                        "Progress note added."
                      )
                    }
                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Send size={15} />
                    Save note
                  </button>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Task actions</h2>
              <p className="mt-2 text-sm text-gray-500">
                Update status after performing the work and attach completion
                evidence.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {issue.status === "assigned" && (
                  <button
                    disabled={saving}
                    onClick={() =>
                      void runAction(
                        () =>
                          updateMaintenanceIssueStatus(
                            issue.id,
                            "in_progress"
                          ),
                        "Task moved to in progress."
                      )
                    }
                    className="rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Start work
                  </button>
                )}
                {issue.status === "in_progress" && (
                  <button
                    disabled={saving}
                    onClick={() =>
                      void runAction(
                        () =>
                          updateMaintenanceIssueStatus(issue.id, "resolved"),
                        "Task marked as resolved."
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    Mark resolved
                  </button>
                )}
                {!active && (
                  <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                    This task no longer accepts workflow updates.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Completion photos</h2>
              <p className="mt-2 text-sm text-gray-500">
                JPEG, PNG, or WEBP, up to 5 MB each (maximum 5 photos).
              </p>
              {issue.completion_photos?.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {issue.completion_photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={photo.image_url}
                        alt="Uploaded completion evidence"
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                  <ImageIcon size={22} />
                  <span className="mt-1">No completion photos uploaded</span>
                </div>
              )}
              {active && (
                <div className="mt-4">
                  <input
                    id="completion-photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => onFilesSelected(event.target.files)}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-[#0F766E]"
                  />
                  {files.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      {files.length} photo(s) selected
                    </p>
                  )}
                  <button
                    disabled={saving || files.length === 0}
                    onClick={() =>
                      void runAction(
                        () =>
                          uploadMaintenanceCompletionPhotos(issue.id, files),
                        "Completion photos uploaded."
                      )
                    }
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
                  >
                    <Upload size={16} />
                    Upload photos
                  </button>
                </div>
              )}
            </section>

            {issue.status_history && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-gray-900">Status history</h2>
                {issue.status_history.length ? (
                  <ol className="mt-4 space-y-4">
                    {issue.status_history.map((event) => (
                      <li key={event.id}>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatLabel(event.new_status)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(event.created_at)}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">
                    No status history recorded.
                  </p>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function MaintenanceTaskDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] items-center justify-center text-sm text-gray-500">
          Loading task details...
        </div>
      }
    >
      <MaintenanceTaskDetailsContent />
    </Suspense>
  );
}
