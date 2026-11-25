import pool from "../config/db.js";
import {
  getIssueWorkflowSchemaFeatures,
  insertIssueStatusHistory,
  IssueWorkflowError,
  requireWorkflowFeature,
  validateIssueTransition,
  withTransaction,
  type IssueStatus,
} from "../lib/issueWorkflow.js";

// Dashboard statistics
export const getMaintenanceDashboard = async (staffId: string) => {
  const result = await pool.query(
    `SELECT
      COUNT(*)::int AS total_assigned,

      COUNT(*) FILTER (
        WHERE ri.status = 'assigned'
      )::int AS pending,

      COUNT(*) FILTER (
        WHERE ri.status = 'in_progress'
      )::int AS in_progress,

      COUNT(*) FILTER (
        WHERE ri.status = 'resolved'
      )::int AS resolved

    FROM issue_assignments ia

    JOIN reportissues ri
      ON ri.id = ia.issue_id
    JOIN issue_category_departments icd
      ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
         LOWER(TRIM(ri.category))
    JOIN department_staff_members dsm
      ON dsm.department_id = icd.department_id
     AND dsm.staff_id = ia.staff_id
     AND dsm.is_active IS TRUE

    WHERE ia.staff_id = $1`,
    [staffId]
  );

  return result.rows[0];
};


// Get assigned issues
export const getAssignedIssues = async (staffId: string) => {
  const result = await pool.query(
    `SELECT
      ri.*,
      ia.id AS assignment_id,
      ia.assigned_at

    FROM issue_assignments ia

    JOIN reportissues ri
      ON ri.id = ia.issue_id
    JOIN issue_category_departments icd
      ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
         LOWER(TRIM(ri.category))
    JOIN department_staff_members dsm
      ON dsm.department_id = icd.department_id
     AND dsm.staff_id = ia.staff_id
     AND dsm.is_active IS TRUE

    WHERE ia.staff_id = $1

    ORDER BY ia.assigned_at DESC`,
    [staffId]
  );

  return result.rows;
};


// Get single assigned issue
export const getAssignedIssueById = async (
  issueId: string,
  staffId: string
) => {
  const result = await pool.query(
    `SELECT
      ri.*,
      ia.id AS assignment_id,
      ia.assigned_at

    FROM issue_assignments ia

    JOIN reportissues ri
      ON ri.id = ia.issue_id
    JOIN issue_category_departments icd
      ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
         LOWER(TRIM(ri.category))
    JOIN department_staff_members dsm
      ON dsm.department_id = icd.department_id
     AND dsm.staff_id = ia.staff_id
     AND dsm.is_active IS TRUE

    WHERE ri.id = $1
      AND ia.staff_id = $2

    LIMIT 1`,
    [issueId, staffId]
  );

  return result.rows[0] || null;
};

export const getAssignedIssueDetails = async (
  issueId: string,
  staffId: string
) => {
  const issue = await getAssignedIssueById(issueId, staffId);

  if (!issue) {
    return null;
  }

  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const [historyResult, photosResult] = await Promise.all([
    workflowSchema.statusHistoryAvailable
      ? pool.query(
          `SELECT
             id,
             previous_status,
             new_status,
             public_message,
             created_at
           FROM issue_status_history
           WHERE issue_id = $1
           ORDER BY created_at ASC, id ASC`,
          [issueId]
        )
      : Promise.resolve({ rows: [] }),
    workflowSchema.completionPhotosAvailable
      ? pool.query(
          `SELECT
             id,
             image_url,
             mime_type,
             file_size_bytes,
             created_at
           FROM issue_completion_photos
           WHERE issue_id = $1
           ORDER BY created_at DESC`,
          [issueId]
        )
      : Promise.resolve({ rows: [] }),
  ]);

  return {
    ...issue,
    status_history: historyResult.rows,
    completion_photos: photosResult.rows,
  };
};

// Update issue status
export const updateAssignedIssueStatus = async (
  issueId: string,
  staffId: string,
  status: IssueStatus
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(workflowSchema.statusHistoryAvailable, "status history");

  return withTransaction(async (client) => {
    const issueResult = await client.query(
      `SELECT ri.id, ri.status
       FROM reportissues ri
       INNER JOIN issue_assignments ia ON ia.issue_id = ri.id
       INNER JOIN issue_category_departments icd
         ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
            LOWER(TRIM(ri.category))
       INNER JOIN department_staff_members dsm
         ON dsm.department_id = icd.department_id
        AND dsm.staff_id = ia.staff_id
        AND dsm.is_active IS TRUE
       WHERE ri.id = $1
         AND ia.staff_id = $2
       FOR UPDATE OF ri, dsm`,
      [issueId, staffId]
    );

    const issue = issueResult.rows[0];

    if (!issue) {
      throw new IssueWorkflowError(
        "Assigned issue not found.",
        404
      );
    }

    validateIssueTransition(issue.status, status);

    const result = await client.query(
      `UPDATE reportissues
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, issueId]
    );

    await insertIssueStatusHistory(client, {
      issueId,
      previousStatus: issue.status,
      newStatus: status,
      changedBy: staffId,
    });

    return result.rows[0];
  });
};


// Add work note
export const addIssueWorkNote = async (
  issueId: string,
  staffId: string,
  note: string
) => {
  return withTransaction(async (client) => {
    const issueResult = await client.query(
      `SELECT ri.status
       FROM reportissues ri
       INNER JOIN issue_assignments ia ON ia.issue_id = ri.id
       INNER JOIN issue_category_departments icd
         ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
            LOWER(TRIM(ri.category))
       INNER JOIN department_staff_members dsm
         ON dsm.department_id = icd.department_id
        AND dsm.staff_id = ia.staff_id
        AND dsm.is_active IS TRUE
       WHERE ri.id = $1
         AND ia.staff_id = $2
       FOR UPDATE OF ri, dsm`,
      [issueId, staffId]
    );

    const issue = issueResult.rows[0];

    if (!issue) {
      throw new IssueWorkflowError(
        "Assigned issue not found.",
        404
      );
    }

    if (issue.status !== "assigned" && issue.status !== "in_progress") {
      throw new IssueWorkflowError(
        "Work notes can only be added to active tasks.",
        409
      );
    }

    const result = await client.query(
      `INSERT INTO issue_work_notes (issue_id, staff_id, note)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [issueId, staffId, note]
    );

    return result.rows[0];
  });
};

export interface CompletionPhotoInput {
  imageUrl: string;
  publicId: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  fileSizeBytes: number;
}

export const saveCompletionPhotos = async (
  issueId: string,
  staffId: string,
  photos: CompletionPhotoInput[]
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(
    workflowSchema.completionPhotosAvailable,
    "completion photo storage"
  );

  return withTransaction(async (client) => {
    const issueResult = await client.query(
      `SELECT ri.status
       FROM reportissues ri
       INNER JOIN issue_assignments ia ON ia.issue_id = ri.id
       INNER JOIN issue_category_departments icd
         ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
            LOWER(TRIM(ri.category))
       INNER JOIN department_staff_members dsm
         ON dsm.department_id = icd.department_id
        AND dsm.staff_id = ia.staff_id
        AND dsm.is_active IS TRUE
       WHERE ri.id = $1
         AND ia.staff_id = $2
       FOR UPDATE OF ri, dsm`,
      [issueId, staffId]
    );

    const issue = issueResult.rows[0];

    if (!issue) {
      throw new IssueWorkflowError(
        "Assigned issue not found.",
        404
      );
    }

    if (issue.status !== "in_progress" && issue.status !== "resolved") {
      throw new IssueWorkflowError(
        "Completion photos can only be uploaded to active or resolved tasks.",
        409
      );
    }

    const savedPhotos = [];

    for (const photo of photos) {
      const result = await client.query(
        `INSERT INTO issue_completion_photos (
           issue_id,
           uploaded_by,
           image_url,
           public_id,
           mime_type,
           file_size_bytes
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, issue_id, image_url, mime_type,
                   file_size_bytes, created_at`,
        [
          issueId,
          staffId,
          photo.imageUrl,
          photo.publicId,
          photo.mimeType,
          photo.fileSizeBytes,
        ]
      );

      savedPhotos.push(result.rows[0]);
    }

    return savedPhotos;
  });
};


// Get work notes
export const getIssueWorkNotes = async (
  issueId: string,
  staffId: string
) => {
  const result = await pool.query(
    `SELECT
      n.id,
      n.issue_id,
      n.staff_id,
      n.note,
      n.created_at,
      u.name AS staff_name

    FROM issue_work_notes n

    JOIN "user" u
      ON u.id = n.staff_id

    WHERE n.issue_id = $1

      AND EXISTS (
        SELECT 1
        FROM issue_assignments ia
        INNER JOIN reportissues ri ON ri.id = ia.issue_id
        INNER JOIN issue_category_departments icd
          ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
             LOWER(TRIM(ri.category))
        INNER JOIN department_staff_members dsm
          ON dsm.department_id = icd.department_id
         AND dsm.staff_id = ia.staff_id
         AND dsm.is_active IS TRUE
        WHERE ia.issue_id = n.issue_id
          AND ia.staff_id = $2
      )

    ORDER BY n.created_at DESC`,
    [issueId, staffId]
  );

  return result.rows;
};
