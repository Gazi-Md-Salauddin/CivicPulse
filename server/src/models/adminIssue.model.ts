import pool from "../config/db.js";
import { getIssueWorkflowSchemaFeatures } from "../lib/issueWorkflow.js";

export interface AdminIssueFilters {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

export const getAdminIssues = async ({
  page,
  limit,
  status,
  search,
}: AdminIssueFilters) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const prioritySelect = workflowSchema.priorityAvailable
    ? "ri.priority"
    : "NULL::text AS priority";
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (status) {
    values.push(status);
    conditions.push(
      `(ri.status = $${values.length} OR ($${values.length} = 'submitted' AND ri.status = 'pending'))`
    );
  }

  if (search) {
    values.push(`%${search}%`);
    const searchParameter = `$${values.length}`;
    conditions.push(
      `(ri.title ILIKE ${searchParameter}
        OR ri.description ILIKE ${searchParameter}
        OR ri.location_address ILIKE ${searchParameter}
        OR ri.id::text ILIKE ${searchParameter}
        OR reporter.name ILIKE ${searchParameter}
        OR reporter.email ILIKE ${searchParameter})`
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM reportissues ri
     LEFT JOIN "user" reporter ON reporter.id = ri.reporter_id
     ${whereClause}`,
    values
  );
  const total = countResult.rows[0].total as number;
  const offset = (page - 1) * limit;
  const dataValues = [...values, limit, offset];

  const result = await pool.query(
    `SELECT
       ri.id,
       ri.title,
       ri.description,
       ri.category,
       ri.image_url,
       ri.location_address,
       ri.latitude,
       ri.longitude,
       ri.status,
       ${prioritySelect},
       ri.created_at,
       ri.updated_at,
       reporter.id AS reporter_id,
       reporter.name AS reporter_name,
       reporter.email AS reporter_email,
       d.id AS department_id,
       d.name AS department_name,
       ia.staff_id AS assigned_staff_id,
       staff.name AS assigned_staff_name
     FROM reportissues ri
     LEFT JOIN "user" reporter ON reporter.id = ri.reporter_id
     LEFT JOIN issue_category_departments icd
       ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
          LOWER(TRIM(ri.category))
     LEFT JOIN departments d ON d.id = icd.department_id
     LEFT JOIN issue_assignments ia ON ia.issue_id = ri.id
     LEFT JOIN "user" staff ON staff.id = ia.staff_id
     ${whereClause}
     ORDER BY ri.created_at DESC NULLS LAST, ri.id DESC
     LIMIT $${dataValues.length - 1}
     OFFSET $${dataValues.length}`,
    dataValues
  );

  return {
    issues: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminIssueDetails = async (issueId: string) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const missingPrioritySelect = workflowSchema.priorityAvailable
    ? ""
    : "NULL::text AS priority,";
  const issueResult = await pool.query(
    `SELECT
       ri.*,
       ${missingPrioritySelect}
       reporter.name AS reporter_name,
       reporter.email AS reporter_email,
       d.id AS department_id,
       d.name AS department_name,
       ia.staff_id AS assigned_staff_id,
       staff.name AS assigned_staff_name
     FROM reportissues ri
     LEFT JOIN "user" reporter ON reporter.id = ri.reporter_id
     LEFT JOIN issue_category_departments icd
       ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
          LOWER(TRIM(ri.category))
     LEFT JOIN departments d ON d.id = icd.department_id
     LEFT JOIN issue_assignments ia ON ia.issue_id = ri.id
     LEFT JOIN "user" staff ON staff.id = ia.staff_id
     WHERE ri.id = $1
     LIMIT 1`,
    [issueId]
  );
  const issue = issueResult.rows[0];

  if (!issue) {
    return null;
  }

  const [historyResult, notesResult, photosResult] = await Promise.all([
    workflowSchema.statusHistoryAvailable
      ? pool.query(
          `SELECT
             h.id,
             h.previous_status,
             h.new_status,
             h.public_message,
             h.internal_reason,
             h.changed_by,
             actor.name AS changed_by_name,
             h.created_at
           FROM issue_status_history h
           INNER JOIN "user" actor ON actor.id = h.changed_by
           WHERE h.issue_id = $1
           ORDER BY h.created_at ASC, h.id ASC`,
          [issueId]
        )
      : Promise.resolve({ rows: [] }),
    pool.query(
      `SELECT
         n.id,
         n.note,
         n.staff_id,
         staff.name AS staff_name,
         n.created_at
       FROM issue_work_notes n
       INNER JOIN "user" staff ON staff.id = n.staff_id
       WHERE n.issue_id = $1
       ORDER BY n.created_at DESC`,
      [issueId]
    ),
    workflowSchema.completionPhotosAvailable
      ? pool.query(
          `SELECT
             p.id,
             p.image_url,
             p.mime_type,
             p.file_size_bytes,
             p.uploaded_by,
             staff.name AS uploaded_by_name,
             p.created_at
           FROM issue_completion_photos p
           INNER JOIN "user" staff ON staff.id = p.uploaded_by
           WHERE p.issue_id = $1
           ORDER BY p.created_at DESC`,
          [issueId]
        )
      : Promise.resolve({ rows: [] }),
  ]);

  return {
    ...issue,
    status_history: historyResult.rows,
    work_notes: notesResult.rows,
    completion_photos: photosResult.rows,
  };
};

export const getAdminDepartmentIssueOverview = async () => {
  const result = await pool.query(
    `SELECT
       d.id AS department_id,
       d.name AS department_name,
       d.is_active,
       COUNT(ri.id)::int AS total_issues,
       COUNT(ri.id) FILTER (
         WHERE ri.status IN ('pending', 'submitted')
       )::int AS submitted_issues,
       COUNT(ri.id) FILTER (
         WHERE ri.status = 'under_review'
       )::int AS under_review_issues,
       COUNT(ri.id) FILTER (
         WHERE ri.status = 'assigned'
       )::int AS assigned_issues,
       COUNT(ri.id) FILTER (
         WHERE ri.status = 'in_progress'
       )::int AS in_progress_issues,
       COUNT(ri.id) FILTER (
         WHERE ri.status = 'resolved'
       )::int AS resolved_issues,
       COUNT(ri.id) FILTER (
         WHERE ri.status = 'closed'
       )::int AS closed_issues,
       COUNT(ri.id) FILTER (
         WHERE ri.status = 'rejected'
       )::int AS rejected_issues
     FROM departments d
     LEFT JOIN issue_category_departments icd
       ON icd.department_id = d.id
     LEFT JOIN reportissues ri
       ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
          LOWER(TRIM(ri.category))
     GROUP BY d.id, d.name, d.is_active
     ORDER BY d.name ASC`
  );

  return result.rows;
};
