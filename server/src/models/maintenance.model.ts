import pool from "../config/db.js";

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

    WHERE ri.id = $1
      AND ia.staff_id = $2

    LIMIT 1`,
    [issueId, staffId]
  );

  return result.rows[0] || null;
};


// Update issue status
export const updateAssignedIssueStatus = async (
  issueId: string,
  staffId: string,
  status: string
) => {
  const result = await pool.query(
    `UPDATE reportissues ri

    SET
      status = $1,
      updated_at = NOW()

    WHERE ri.id = $2

      AND EXISTS (
        SELECT 1
        FROM issue_assignments ia
        WHERE ia.issue_id = ri.id
          AND ia.staff_id = $3
      )

    RETURNING ri.*`,
    [status, issueId, staffId]
  );

  return result.rows[0] || null;
};


// Add work note
export const addIssueWorkNote = async (
  issueId: string,
  staffId: string,
  note: string
) => {
  const result = await pool.query(
    `INSERT INTO issue_work_notes (
      issue_id,
      staff_id,
      note
    )

    SELECT $1, $2, $3

    WHERE EXISTS (
      SELECT 1
      FROM issue_assignments
      WHERE issue_id = $1
        AND staff_id = $2
    )

    RETURNING *`,
    [issueId, staffId, note]
  );

  return result.rows[0] || null;
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
        WHERE ia.issue_id = n.issue_id
          AND ia.staff_id = $2
      )

    ORDER BY n.created_at DESC`,
    [issueId, staffId]
  );

  return result.rows;
};
