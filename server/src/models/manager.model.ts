
import pool from "../config/db.js";

// Get department manager dashboard statistics
export const getManagerDashboard = async (managerId: string) => {
  // 1. Find manager's department
  const departmentResult = await pool.query(
    `SELECT id, name, description, location
     FROM departments
     WHERE manager_id = $1
       AND is_active IS TRUE
     LIMIT 1`,
    [managerId]
  );

  if (departmentResult.rows.length === 0) {
    return null;
  }

  const department = departmentResult.rows[0];

  // 2. Get issue statistics for the manager's department
  const statsResult = await pool.query(
    `WITH department_issues AS (
       SELECT DISTINCT ri.id, ri.status
       FROM reportissues ri
       INNER JOIN issue_category_departments icd
         ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
            LOWER(TRIM(ri.category))
       WHERE icd.department_id = $1
     )

     SELECT
       COUNT(*)::int AS "totalIssues",

       COUNT(*) FILTER (
         WHERE status = 'submitted'
       )::int AS "pendingIssues",

       COUNT(*) FILTER (
         WHERE status = 'under_review'
       )::int AS "underReviewIssues",

       COUNT(*) FILTER (
         WHERE status = 'assigned'
       )::int AS "assignedIssues",

       COUNT(*) FILTER (
         WHERE status = 'in_progress'
       )::int AS "inProgressIssues",

       COUNT(*) FILTER (
         WHERE status = 'resolved'
       )::int AS "resolvedIssues",

       COUNT(*) FILTER (
         WHERE status = 'closed'
       )::int AS "closedIssues",

       COUNT(*) FILTER (
         WHERE status = 'rejected'
       )::int AS "rejectedIssues"

     FROM department_issues`,
    [department.id]
  );

  // 3. Get assigned staff statistics for the manager's department
  const staffResult = await pool.query(
    `SELECT
       COUNT(DISTINCT ia.staff_id)::int AS "assignedStaffCount",

       COUNT(DISTINCT ia.issue_id) FILTER (
         WHERE ri.status IN ('assigned', 'in_progress')
       )::int AS "activeTasks",

       COUNT(DISTINCT ia.issue_id) FILTER (
         WHERE ri.status = 'resolved'
       )::int AS "completedTasks"

     FROM issue_assignments ia

     INNER JOIN reportissues ri
       ON ri.id = ia.issue_id
     INNER JOIN issue_category_departments icd
       ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
          LOWER(TRIM(ri.category))

     WHERE icd.department_id = $1`,
    [department.id]
  );

  // 4. Get recent issues in the manager's department
  const recentIssuesResult = await pool.query(
    `SELECT
       ri.id,
       ri.title,
       ri.category,
       ri.status,
       ri.location_address,
       ri.created_at,
       (
         SELECT string_agg(DISTINCT u.name, ', ')
         FROM issue_assignments ia
         INNER JOIN "user" u ON u.id = ia.staff_id
         WHERE ia.issue_id = ri.id
       ) AS assigned_staff_name

     FROM reportissues ri

     INNER JOIN issue_category_departments icd
       ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
          LOWER(TRIM(ri.category))

     WHERE icd.department_id = $1

     ORDER BY ri.created_at DESC NULLS LAST
     LIMIT 5`,
    [department.id]
  );

  // 5. Return dashboard data
  return {
    department,

    statistics: {
      ...statsResult.rows[0],
      ...staffResult.rows[0],
    },

    recentIssues: recentIssuesResult.rows,
  };
};




// Get all issues assigned to the manager's department
export const getManagerIssues = async (
  managerId: string,
  page = 1,
  limit = 10,
  status?: string,
  search?: string
) => {
  const departmentResult = await pool.query(
    `SELECT id, name
     FROM departments
     WHERE manager_id = $1
       AND is_active = true
     LIMIT 1`,
    [managerId]
  );

  if (departmentResult.rows.length === 0) {
    return {
      issues: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const department = departmentResult.rows[0];
  const offset = (page - 1) * limit;

  const statusFilter = status?.trim() || null;
  const searchFilter = search?.trim() || null;

  const filterValues = [
    department.id,
    statusFilter,
    searchFilter ? `%${searchFilter}%` : null,
  ];

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM reportissues ri
     INNER JOIN issue_category_departments icd
    ON LOWER(
        REPLACE(TRIM(icd.category), ' ', '_')
    ) = LOWER(TRIM(ri.category))
     WHERE icd.department_id = $1
       AND ($2::text IS NULL OR ri.status = $2)
       AND (
         $3::text IS NULL
         OR ri.title ILIKE $3
         OR ri.description ILIKE $3
         OR ri.location_address ILIKE $3
       )`,
    filterValues
  );

  const total = countResult.rows[0].total;

  const issuesResult = await pool.query(
    `SELECT
       ri.id,
       ri.title,
       ri.description,
       ri.category,
       ri.image_url,
       ri.location_address,
       ri.latitude,
       ri.longitude,
       ri.reporter_id,
       ri.status,
       ri.created_at,
       ri.updated_at,

       COALESCE(
         (
           SELECT jsonb_agg(
             jsonb_build_object(
               'id', u.id,
               'name', u.name,
               'email', u.email,
               'image', u.image,
               'assignedAt', ia.assigned_at
             )
           )
           FROM issue_assignments ia
           INNER JOIN "user" u ON u.id = ia.staff_id
           WHERE ia.issue_id = ri.id
         ),
         '[]'::jsonb
       ) AS assigned_staff

     FROM reportissues ri
     INNER JOIN issue_category_departments icd
       ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
          LOWER(TRIM(ri.category))

     WHERE icd.department_id = $1
       AND ($2::text IS NULL OR ri.status = $2)
       AND (
         $3::text IS NULL
         OR ri.title ILIKE $3
         OR ri.description ILIKE $3
         OR ri.location_address ILIKE $3
       )

     ORDER BY ri.created_at DESC
     LIMIT $4 OFFSET $5`,
    [...filterValues, limit, offset]
  );

  return {
    department,
    issues: issuesResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// Get a single issue's details
export const getManagerIssueDetails = async (
  managerId: string,
  issueId: string
) => {
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
       ri.reporter_id,
       ri.status,
       ri.created_at,
       ri.updated_at,

       d.id AS department_id,
       d.name AS department_name,

       COALESCE(
         (
           SELECT jsonb_agg(
             jsonb_build_object(
               'id', u.id,
               'name', u.name,
               'email', u.email,
               'image', u.image,
               'assignedAt', ia.assigned_at
             )
           )
           FROM issue_assignments ia
           INNER JOIN "user" u ON u.id = ia.staff_id
           WHERE ia.issue_id = ri.id
         ),
         '[]'::jsonb
       ) AS assigned_staff

     FROM reportissues ri
     INNER JOIN issue_category_departments icd
    ON LOWER(
        REPLACE(TRIM(icd.category), ' ', '_')
    ) = LOWER(TRIM(ri.category))
     INNER JOIN departments d
       ON d.id = icd.department_id

     WHERE ri.id = $1
       AND d.manager_id = $2
       AND d.is_active = true

     LIMIT 1`,
    [issueId, managerId]
  );

  return result.rows[0] || null;
};