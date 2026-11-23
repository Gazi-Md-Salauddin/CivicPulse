import pool from "../config/db.js";

// Get department manager dashboard statistics
export const getManagerDashboard = async (managerId: string) => {
  // Find manager's department
  const departmentResult = await pool.query(
    `SELECT id, name
     FROM departments
     WHERE manager_id = $1
     LIMIT 1`,
    [managerId]
  );

  if (departmentResult.rows.length === 0) {
    return null;
  }

  const department = departmentResult.rows[0];

  // Get issue statistics
  const statsResult = await pool.query(
    `SELECT
       COUNT(*)::int AS total_issues,

       COUNT(*) FILTER (
         WHERE status IN ('submitted', 'under_review')
       )::int AS pending_verification,

       COUNT(*) FILTER (
         WHERE status = 'assigned'
       )::int AS assigned_issues,

       COUNT(*) FILTER (
         WHERE status = 'in_progress'
       )::int AS in_progress_issues,

       COUNT(*) FILTER (
         WHERE status = 'resolved'
       )::int AS resolved_issues,

       COUNT(*) FILTER (
         WHERE status = 'closed'
       )::int AS closed_issues,

       COUNT(*) FILTER (
         WHERE status = 'rejected'
       )::int AS rejected_issues

     FROM reportissues
     WHERE department_id = $1`,
    [department.id]
  );

  // Get maintenance staff and task statistics
  const staffResult = await pool.query(
    `SELECT
       COUNT(DISTINCT ia.staff_id)::int AS total_staff,

       COUNT(DISTINCT ia.issue_id) FILTER (
         WHERE ri.status IN ('assigned', 'in_progress')
       )::int AS active_tasks,

       COUNT(DISTINCT ia.issue_id) FILTER (
         WHERE ri.status = 'resolved'
       )::int AS completed_tasks

     FROM issue_assignments ia

     INNER JOIN reportissues ri
       ON ri.id = ia.issue_id

     WHERE ri.department_id = $1`,
    [department.id]
  );

  // Get recent department issues
  const recentIssuesResult = await pool.query(
    `SELECT
       id,
       title,
       category,
       status,
       priority,
       location_address,
       created_at

     FROM reportissues
     WHERE department_id = $1

     ORDER BY created_at DESC
     LIMIT 5`,
    [department.id]
  );

  return {
    department,
    statistics: {
      ...statsResult.rows[0],
      ...staffResult.rows[0],
    },
    recentIssues: recentIssuesResult.rows,
  };
};
