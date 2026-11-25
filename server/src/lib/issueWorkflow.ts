import type { PoolClient } from "pg";
import pool from "../config/db.js";

export const ISSUE_STATUSES = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
  "rejected",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface IssueWorkflowSchemaFeatures {
  statusHistoryAvailable: boolean;
  membershipAvailable: boolean;
  completionPhotosAvailable: boolean;
  priorityAvailable: boolean;
}

export const getIssueWorkflowSchemaFeatures =
  async (): Promise<IssueWorkflowSchemaFeatures> => {
    const result = await pool.query(
      `SELECT
         to_regclass('public.issue_status_history') IS NOT NULL
           AS status_history_available,
         to_regclass('public.department_staff_members') IS NOT NULL
           AS membership_available,
         to_regclass('public.issue_completion_photos') IS NOT NULL
           AS completion_photos_available,
         EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'reportissues'
             AND column_name = 'priority'
         ) AS priority_available`
    );

    return {
      statusHistoryAvailable: result.rows[0].status_history_available,
      membershipAvailable: result.rows[0].membership_available,
      completionPhotosAvailable: result.rows[0].completion_photos_available,
      priorityAvailable: result.rows[0].priority_available,
    };
  };

export const requireWorkflowFeature = (
  available: boolean,
  feature: string
) => {
  if (!available) {
    throw new IssueWorkflowError(
      `The ${feature} feature requires the issue workflow database migration.`,
      409
    );
  }
};

const allowedTransitions: Record<string, readonly IssueStatus[]> = {
  pending: ["under_review", "rejected"],
  submitted: ["under_review", "rejected"],
  under_review: ["assigned", "rejected"],
  assigned: ["in_progress"],
  in_progress: ["resolved"],
  resolved: ["closed"],
  closed: [],
  rejected: [],
};

const publicMessages: Record<IssueStatus, string> = {
  submitted: "Your report was submitted.",
  under_review: "Your report is under review.",
  assigned: "Your report was assigned to a maintenance team.",
  in_progress: "Work has started on your report.",
  resolved: "Work on your report is marked resolved.",
  closed: "Your report has been closed.",
  rejected: "Your report was rejected. Contact the department for more information.",
};

export class IssueWorkflowError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 404 | 409
  ) {
    super(message);
    this.name = "IssueWorkflowError";
  }
}

export const validateIssueTransition = (
  currentStatus: string | null,
  nextStatus: IssueStatus
) => {
  const current = currentStatus ?? "";

  if (!allowedTransitions[current]?.includes(nextStatus)) {
    throw new IssueWorkflowError(
      `Cannot transition issue from ${current || "unknown"} to ${nextStatus}.`,
      409
    );
  }
};

export const isIssuePriority = (
  value: unknown
): value is IssuePriority =>
  value === "low" ||
  value === "medium" ||
  value === "high" ||
  value === "critical";

export const insertIssueStatusHistory = async (
  client: PoolClient,
  history: {
    issueId: string;
    previousStatus: string | null;
    newStatus: IssueStatus;
    changedBy: string;
    internalReason?: string | null;
  }
) => {
  await client.query(
    `INSERT INTO issue_status_history (
       issue_id,
       previous_status,
       new_status,
       changed_by,
       public_message,
       internal_reason
     )
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      history.issueId,
      history.previousStatus,
      history.newStatus,
      history.changedBy,
      publicMessages[history.newStatus],
      history.internalReason ?? null,
    ]
  );
};

export const withTransaction = async <T>(
  operation: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const result = await operation(client);

    await client.query("COMMIT");
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Issue workflow transaction rollback failed:", rollbackError);
      }
    }

    throw error;
  } finally {
    client.release();
  }
};
