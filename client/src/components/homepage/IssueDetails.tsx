"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Copy,
    ExternalLink,
    FileText,
    Flag,
    Image as ImageIcon,
    MapPin,
    Navigation,
    Share2,
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    Camera,
} from "lucide-react";

import { getPublicIssueById } from "@/services/issue.service";

// Types
type IssueStatus =
    | "submitted"
    | "pending"
    | "under_review"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "closed"
    | "rejected";

type Issue = {
    id: string;
    title: string;
    description: string;
    category: string;
    location_address: string;
    latitude: number | null;
    longitude: number | null;
    image_url: string | null;
    status: IssueStatus;
    created_at: string;
    updated_at: string;
    reporter_name?: string;
};

type StatusHistory = {
    id: string;
    status: IssueStatus;
    description: string;
    created_at: string;
};

const statusConfig: Record<
    IssueStatus,
    { label: string; color: string; description: string }
> = {
    submitted: {
        label: "Submitted",
        color: "bg-blue-50 text-blue-700",
        description: "Your report has been submitted.",
    },
    pending: {
        label: "Pending",
        color: "bg-blue-50 text-blue-700",
        description: "Your report is waiting for review.",
    },
    under_review: {
        label: "Under Review",
        color: "bg-amber-50 text-amber-700",
        description: "The report is being reviewed.",
    },
    assigned: {
        label: "Assigned",
        color: "bg-purple-50 text-purple-700",
        description: "The issue has been assigned to a department.",
    },
    in_progress: {
        label: "In Progress",
        color: "bg-cyan-50 text-cyan-700",
        description: "The maintenance team is working on it.",
    },
    resolved: {
        label: "Resolved",
        color: "bg-emerald-50 text-emerald-700",
        description: "The reported issue has been resolved.",
    },
    closed: {
        label: "Closed",
        color: "bg-gray-100 text-gray-600",
        description: "This report has been closed.",
    },
    rejected: {
        label: "Rejected",
        color: "bg-red-50 text-red-700",
        description: "This report was rejected.",
    },
};

const categoryLabels: Record<string, string> = {
    road_damage: "Road Damage",
    streetlight: "Streetlight",
    drainage: "Drainage",
    footpath: "Footpath",
    waste_management: "Waste Management",
    public_infrastructure: "Public Infrastructure",
};

const workflow: IssueStatus[] = [
    "submitted",
    "under_review",
    "assigned",
    "in_progress",
    "resolved",
    "closed",
];

function formatDate(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatDateTime(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleString("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function IssueDetailsPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [issue, setIssue] = useState<Issue | null>(null);
    const [history, setHistory] = useState<StatusHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Fetch issue details from API
    useEffect(() => {
        if (!id) return;

        let isMounted = true;

        const loadIssue = async () => {
            try {
                setLoading(true);
                setError("");
                setIssue(null);
                setImageError(false);

                const response = await getPublicIssueById(id);

                if (!isMounted) return;

                const issueData = response.data;

                // Map database status to UI status
                const normalizedStatus =
                    issueData.status === "pending"
                        ? "submitted"
                        : issueData.status;

                setIssue({
                    ...issueData,
                    status: normalizedStatus as IssueStatus,
                });

                // Status history API is not implemented yet
                setHistory([]);

            } catch (err) {
                console.error("Load Issue Error:", err);

                if (!isMounted) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load issue details."
                );

                setIssue(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadIssue();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Copy Issue ID
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(issue?.id || id);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Copy failed:", error);
            setCopied(false);
        }
    };

    // Share Issue
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: issue?.title || "CivicPulse Issue",
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);

                window.setTimeout(() => {
                    setCopied(false);
                }, 2000);
            }
        } catch (error) {
            // User may cancel sharing.
            console.error("Share cancelled or failed:", error);
        }
    };

    // Loading State
    if (loading) {
        return (
            <main className="min-h-screen bg-[#F5FAF9] px-4 py-10">
                <div className="mx-auto container animate-pulse space-y-6">
                    <div className="h-5 w-40 rounded bg-gray-200" />
                    <div className="h-10 w-2/3 rounded bg-gray-200" />

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="h-[420px] rounded-2xl bg-gray-200 lg:col-span-2" />
                        <div className="h-[420px] rounded-2xl bg-gray-200" />
                    </div>
                </div>
            </main>
        );
    }

    // Error / Not Found State
    if (error || !issue) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F5FAF9] px-4">
                <div className="max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                    <AlertCircle className="mx-auto text-red-500" size={36} />

                    <h1 className="mt-4 text-xl font-bold text-gray-900">
                        Issue not found
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {error || "The requested issue could not be found."}
                    </p>

                    <Link
                        href="/issues"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to All Issues
                    </Link>
                </div>
            </main>
        );
    }

    const currentStatus = statusConfig[issue.status];
    const currentStep = workflow.indexOf(issue.status);
    const isRejected = issue.status === "rejected";

    const images = issue.image_url ? [issue.image_url] : [];

    return (
        <main className="min-h-screen bg-[#F5FAF9]">

            <div className="mx-auto container px-4 py-8 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-[#0F766E]">
                        Home
                    </Link>

                    <ChevronRight size={14} />

                    <Link href="/citizen-all-issue" className="hover:text-[#0F766E]">
                        All Issues
                    </Link>

                    <ChevronRight size={14} />

                    <span className="font-medium text-gray-800">
                        Issue Details
                    </span>
                </div>

                {/* Page Title */}
                <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0F766E]">
                                {categoryLabels[issue.category] || issue.category}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${currentStatus.color}`}
                            >
                                {currentStatus.label}
                            </span>
                        </div>

                        <h1 className="max-w-3xl text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                            {issue.title}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                            <button
                                onClick={handleCopy}
                                className="inline-flex items-center gap-1.5 hover:text-[#0F766E]"
                            >
                                <FileText size={15} />
                                ID: {issue.id}
                                <Copy size={13} />

                                {copied && (
                                    <span className="text-[#0F766E]">
                                        Copied!
                                    </span>
                                )}
                            </button>

                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={15} />
                                Reported {formatDate(issue.created_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#0F766E] hover:text-[#0F766E]"
                        >
                            <Share2 size={16} />
                            Share
                        </button>

                        <Link
                            href="/citizen-all-issue"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Image Gallery */}
                        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                                    <ImageIcon size={18} className="text-[#0F766E]" />
                                    Issue Photos
                                </h2>

                                <span className="text-xs text-gray-400">
                                    {images.length} Photo{images.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {images.length > 0 && !imageError ? (
                                <div>
                                    <div className="h-[280px] bg-gray-100 sm:h-[420px]">
                                        <img
                                            src={images[0]}
                                            alt={issue.title}
                                            onError={() => setImageError(true)}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                                    <Camera size={38} />

                                    <p className="mt-3 text-sm">
                                        No photos attached
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Description */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <FileText size={19} className="text-[#0F766E]" />
                                Issue Description
                            </h2>

                            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
                                {issue.description}
                            </p>
                        </section>

                        {/* Location */}
                        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 p-5">
                                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                                    <MapPin size={19} className="text-[#0F766E]" />
                                    Issue Location
                                </h2>

                                <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-gray-600">
                                    <MapPin size={16} className="mt-1 shrink-0 text-[#0F766E]" />
                                    {issue.location_address}
                                </p>
                            </div>

                            <div className="flex h-64 items-center justify-center bg-[#E7F3F0]">
                                <div className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0F766E] shadow-sm">
                                        <Navigation size={23} />
                                    </div>

                                    <p className="mt-3 font-semibold text-[#134E4A]">
                                        Location Coordinates
                                    </p>

                                    <p className="mt-1 text-sm text-[#0F766E]">
                                        {issue.latitude ?? "N/A"},{" "}
                                        {issue.longitude ?? "N/A"}
                                    </p>

                                    {issue.latitude !== null &&
                                        issue.longitude !== null && (
                                            <a
                                                href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#115E59]"
                                            >
                                                Open in Google Maps
                                                <ExternalLink size={15} />
                                            </a>
                                        )}
                                </div>
                            </div>
                        </section>

                        {/* Status History */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <Clock3 size={19} className="text-[#0F766E]" />
                                    Status History
                                </h2>

                                <span className="text-xs text-gray-400">
                                    {history.length} Updates
                                </span>
                            </div>

                            {history.length > 0 ? (
                                <div className="relative ml-2 space-y-6 border-l-2 border-gray-100 pl-6">
                                    {history.map((item, index) => {
                                        const config = statusConfig[item.status];

                                        return (
                                            <div key={item.id} className="relative">
                                                <div
                                                    className={`absolute -left-[33px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-4 border-white ${index === history.length - 1
                                                        ? "bg-[#0F766E] ring-4 ring-teal-50"
                                                        : "bg-gray-300"
                                                        }`}
                                                />

                                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                                    <div>
                                                        <span
                                                            className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${config.color}`}
                                                        >
                                                            {config.label}
                                                        </span>

                                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                                            {item.description}
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 text-xs text-gray-400">
                                                        {formatDateTime(item.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No status updates available yet.
                                </p>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">

                        {/* Current Status */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h2 className="font-bold text-gray-900">
                                Current Status
                            </h2>

                            <div className="mt-4 rounded-xl bg-[#F0FDFA] p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0F766E]">
                                        {issue.status === "resolved" ||
                                            issue.status === "closed" ? (
                                            <CheckCircle2 size={22} />
                                        ) : (
                                            <Clock3 size={22} />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-[#134E4A]">
                                            {currentStatus.label}
                                        </p>

                                        <p className="mt-1 text-xs text-[#0F766E]">
                                            {currentStatus.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!isRejected && (
                                <div className="mt-6">
                                    <h3 className="mb-4 text-sm font-semibold text-gray-800">
                                        Resolution Progress
                                    </h3>

                                    <div className="space-y-4">
                                        {workflow.map((step, index) => {
                                            const completed =
                                                currentStep >= 0 && index <= currentStep;

                                            return (
                                                <div
                                                    key={step}
                                                    className="flex items-center gap-3"
                                                >
                                                    <div
                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${completed
                                                            ? "bg-[#0F766E] text-white"
                                                            : "bg-gray-100 text-gray-400"
                                                            }`}
                                                    >
                                                        {completed ? (
                                                            <CheckCircle2 size={16} />
                                                        ) : (
                                                            <span className="text-xs font-semibold">
                                                                {index + 1}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`text-sm ${completed
                                                            ? "font-semibold text-gray-800"
                                                            : "text-gray-400"
                                                            }`}
                                                    >
                                                        {statusConfig[step].label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Report Information */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h2 className="font-bold text-gray-900">
                                Report Information
                            </h2>

                            <div className="mt-5 space-y-4">
                                <InfoItem
                                    label="Report ID"
                                    value={issue.id}
                                    icon={<FileText size={17} />}
                                />

                                <InfoItem
                                    label="Category"
                                    value={categoryLabels[issue.category] || issue.category}
                                    icon={<Flag size={17} />}
                                />

                                <InfoItem
                                    label="Submitted On"
                                    value={formatDate(issue.created_at)}
                                    icon={<CalendarDays size={17} />}
                                />

                                <InfoItem
                                    label="Last Updated"
                                    value={formatDate(issue.updated_at)}
                                    icon={<Clock3 size={17} />}
                                />

                                <InfoItem
                                    label="Reporter"
                                    value={issue.reporter_name || "Citizen"}
                                    icon={<ShieldCheck size={17} />}
                                />
                            </div>
                        </section>

                        {/* Help Card */}
                        <section className="rounded-2xl bg-[#134E4A] p-5 text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                <AlertCircle size={21} />
                            </div>

                            <h3 className="mt-4 font-bold">
                                Need Help?
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-teal-100">
                                If you have questions about this report or its progress, contact the CivicPulse support team.
                            </p>

                            <Link
                                href="/contact"
                                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-teal-200"
                            >
                                Contact Support
                                <ArrowUpRight size={16} />
                            </Link>
                        </section>
                    </aside>
                </div>

                {/* Footer Note */}
                <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-teal-100 bg-white p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="shrink-0 text-[#0F766E]" size={22} />

                        <p className="text-sm text-gray-600">
                            CivicPulse promotes transparency in public infrastructure management.
                        </p>
                    </div>

                    <span className="text-xs font-medium text-[#0F766E]">
                        Public Issue Record
                    </span>
                </div>
            </div>
        </main>
    );
}

// Reusable Information Item
function InfoItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[#0F766E]">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-gray-400">{label}</p>

                <p className="mt-1 break-words text-sm font-medium text-gray-800">
                    {value}
                </p>
            </div>
        </div>
    );
}
