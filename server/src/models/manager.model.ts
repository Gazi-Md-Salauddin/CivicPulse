
import pool from "../config/db.js";
import type { PoolClient } from "pg";
import {
  getIssueWorkflowSchemaFeatures,
  insertIssueStatusHistory,
  IssueWorkflowError,
  requireWorkflowFeature,
  validateIssueTransition,
  withTransaction,
  type IssuePriority,
  type IssueStatus,
} from "../lib/issueWorkflow.js";

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
         WHERE status IN ('pending', 'submitted')
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
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const assignedStaffCount = workflowSchema.membershipAvailable
    ? `(SELECT COUNT(*)::int
        FROM department_staff_members dsm
        WHERE dsm.department_id = $1
          AND dsm.is_active IS TRUE)`
    : "COUNT(DISTINCT ia.staff_id)::int";
  const recentIssuePriority = workflowSchema.priorityAvailable
    ? "ri.priority"
    : "NULL::text";

  const staffResult = await pool.query(
    `SELECT
       ${assignedStaffCount} AS "assignedStaffCount",
       COUNT(DISTINCT ri.id) FILTER (
         WHERE ri.status IN ('assigned', 'in_progress')
       )::int AS "activeTasks",
       COUNT(DISTINCT ri.id) FILTER (
         WHERE ri.status IN ('resolved', 'closed')
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
       ${recentIssuePriority} AS priority,
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
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const prioritySelect = workflowSchema.priorityAvailable
    ? "ri.priority"
    : "NULL::text";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM reportissues ri
     INNER JOIN issue_category_departments icd
    ON LOWER(
        REPLACE(TRIM(icd.category), ' ', '_')
    ) = LOWER(TRIM(ri.category))
     WHERE icd.department_id = $1
       AND (
         $2::text IS NULL
         OR ri.status = $2
         OR ($2 = 'submitted' AND ri.status = 'pending')
       )
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
       ${prioritySelect} AS priority,
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
       AND (
         $2::text IS NULL
         OR ri.status = $2
         OR ($2 = 'submitted' AND ri.status = 'pending')
       )
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
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const prioritySelect = workflowSchema.priorityAvailable
    ? "ri.priority"
    : "NULL::text AS priority";
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
       ${prioritySelect},
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

  const issue = result.rows[0];

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
             h.created_at,
             u.name AS changed_by_name
           FROM issue_status_history h
           INNER JOIN "user" u ON u.id = h.changed_by
           WHERE h.issue_id = $1
           ORDER BY h.created_at ASC, h.id ASC`,
          [issueId]
        )
      : Promise.resolve({ rows: [] }),
    pool.query(
      `SELECT
         n.id,
         n.note,
         n.created_at,
         n.staff_id,
         u.name AS staff_name
       FROM issue_work_notes n
       INNER JOIN "user" u ON u.id = n.staff_id
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
             p.created_at,
             p.uploaded_by,
             u.name AS uploaded_by_name
           FROM issue_completion_photos p
           INNER JOIN "user" u ON u.id = p.uploaded_by
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

const getManagerDepartment = async (
  client: PoolClient,
  managerId: string
) => {
  const result = await client.query(
    `SELECT id, name
     FROM departments
     WHERE manager_id = $1
       AND is_active IS TRUE
     LIMIT 1`,
    [managerId]
  );

  return result.rows[0] || null;
};

const lockManagerIssue = async (
  client: PoolClient,
  managerId: string,
  issueId: string
) => {
  const result = await client.query(
    `SELECT ri.id, ri.status, icd.department_id
     FROM reportissues ri
     INNER JOIN issue_category_departments icd
       ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
          LOWER(TRIM(ri.category))
     INNER JOIN departments d
       ON d.id = icd.department_id
     WHERE ri.id = $1
       AND d.manager_id = $2
       AND d.is_active IS TRUE
     FOR UPDATE OF ri`,
    [issueId, managerId]
  );

  return result.rows[0] || null;
};

export const transitionManagerIssue = async (
  managerId: string,
  issueId: string,
  nextStatus: IssueStatus,
  internalReason?: string
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(workflowSchema.statusHistoryAvailable, "status history");

  return withTransaction(async (client) => {
    const issue = await lockManagerIssue(client, managerId, issueId);

    if (!issue) {
      throw new IssueWorkflowError(
        "Issue not found in your department.",
        404
      );
    }

    if (nextStatus === "rejected" && !internalReason?.trim()) {
      throw new IssueWorkflowError(
        "A rejection reason is required.",
        409
      );
    }

    validateIssueTransition(issue.status, nextStatus);

    const updateResult = await client.query(
      `UPDATE reportissues
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [nextStatus, issueId]
    );

    await insertIssueStatusHistory(client, {
      issueId,
      previousStatus: issue.status,
      newStatus: nextStatus,
      changedBy: managerId,
      internalReason,
    });

    return updateResult.rows[0];
  });
};

export const updateManagerIssuePriority = async (
  managerId: string,
  issueId: string,
  priority: IssuePriority
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(workflowSchema.priorityAvailable, "issue priority");

  return withTransaction(async (client) => {
    const issue = await lockManagerIssue(client, managerId, issueId);

    if (!issue) {
      throw new IssueWorkflowError(
        "Issue not found in your department.",
        404
      );
    }

    if (issue.status === "closed" || issue.status === "rejected") {
      throw new IssueWorkflowError(
        "Closed or rejected issues cannot be modified.",
        409
      );
    }

    const result = await client.query(
      `UPDATE reportissues
       SET priority = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [priority, issueId]
    );

    return result.rows[0];
  });
};

export const assignManagerIssue = async (
  managerId: string,
  issueId: string,
  staffId: string
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(workflowSchema.statusHistoryAvailable, "status history");
  requireWorkflowFeature(workflowSchema.membershipAvailable, "department staff membership");

  return withTransaction(async (client) => {
    const issue = await lockManagerIssue(client, managerId, issueId);

    if (!issue) {
      throw new IssueWorkflowError(
        "Issue not found in your department.",
        404
      );
    }

    if (issue.status !== "under_review" && issue.status !== "assigned") {
      throw new IssueWorkflowError(
        "Only issues under review or already assigned can be assigned.",
        409
      );
    }

    const department = await getManagerDepartment(client, managerId);

    if (!department || department.id !== issue.department_id) {
      throw new IssueWorkflowError(
        "Issue not found in your department.",
        404
      );
    }

    const eligibleStaff = await client.query(
      `SELECT u.id, u.name, u.email, u.image
       FROM department_staff_members dsm
       INNER JOIN "user" u ON u.id = dsm.staff_id
       WHERE dsm.department_id = $1
         AND dsm.staff_id = $2
         AND dsm.is_active IS TRUE
         AND u.role = 'maintenance_staff'
         AND u.is_active IS TRUE
       FOR UPDATE OF dsm, u`,
      [department.id, staffId]
    );

    if (eligibleStaff.rows.length === 0) {
      throw new IssueWorkflowError(
        "Staff member is not active in your department.",
        404
      );
    }

    const currentAssignment = await client.query(
      `SELECT staff_id
       FROM issue_assignments
       WHERE issue_id = $1
       FOR UPDATE`,
      [issueId]
    );

    if (
      issue.status === "assigned" &&
      currentAssignment.rows.length === 0
    ) {
      throw new IssueWorkflowError(
        "Assigned issue is missing its assignment record.",
        409
      );
    }

    if (currentAssignment.rows[0]?.staff_id !== staffId) {
      await client.query(
        `INSERT INTO issue_assignments (
           issue_id,
           staff_id,
           assigned_by
         )
         VALUES ($1, $2, $3)
         ON CONFLICT (issue_id)
         DO UPDATE SET
           staff_id = EXCLUDED.staff_id,
           assigned_by = EXCLUDED.assigned_by,
           assigned_at = NOW()`,
        [issueId, staffId, managerId]
      );
    }

    if (issue.status === "under_review") {
      validateIssueTransition(issue.status, "assigned");

      await client.query(
        `UPDATE reportissues
         SET status = 'assigned', updated_at = NOW()
         WHERE id = $1`,
        [issueId]
      );

      await insertIssueStatusHistory(client, {
        issueId,
        previousStatus: issue.status,
        newStatus: "assigned",
        changedBy: managerId,
      });
    }

    const result = await client.query(
      `SELECT ri.*, u.id AS assigned_staff_id, u.name AS assigned_staff_name
       FROM reportissues ri
       INNER JOIN issue_assignments ia ON ia.issue_id = ri.id
       INNER JOIN "user" u ON u.id = ia.staff_id
       WHERE ri.id = $1`,
      [issueId]
    );

    return result.rows[0];
  });
};

export const getManagerDepartmentStaff = async (managerId: string) => {
  const departmentResult = await pool.query(
    `SELECT id, name
     FROM departments
     WHERE manager_id = $1
       AND is_active IS TRUE
     LIMIT 1`,
    [managerId]
  );

  const department = departmentResult.rows[0];

  if (!department) {
    throw new IssueWorkflowError(
      "No active department is assigned to this manager.",
      404
    );
  }

  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const result = workflowSchema.membershipAvailable
    ? await pool.query(
        `SELECT
           dsm.department_id,
           dsm.staff_id,
           dsm.staff_id AS id,
           dsm.is_active,
           dsm.created_at,
           dsm.updated_at,
           dsm.deactivated_at,
           u.name,
           u.email,
           u.image,
           COUNT(DISTINCT ri.id) FILTER (
             WHERE icd.department_id = $1
               AND ri.status IN ('assigned', 'in_progress')
           )::int AS active_task_count,
           COUNT(DISTINCT ri.id) FILTER (
             WHERE icd.department_id = $1
               AND ri.status IN ('resolved', 'closed')
           )::int AS completed_task_count
         FROM department_staff_members dsm
         INNER JOIN "user" u ON u.id = dsm.staff_id
         LEFT JOIN issue_assignments ia ON ia.staff_id = dsm.staff_id
         LEFT JOIN reportissues ri ON ri.id = ia.issue_id
         LEFT JOIN issue_category_departments icd
           ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
              LOWER(TRIM(ri.category))
         WHERE dsm.department_id = $1
         GROUP BY
           dsm.department_id,
           dsm.staff_id,
           dsm.is_active,
           dsm.created_at,
           dsm.updated_at,
           dsm.deactivated_at,
           u.name,
           u.email,
           u.image
         ORDER BY dsm.is_active DESC, u.name ASC`,
        [department.id]
      )
    : await pool.query(
        `SELECT
           icd.department_id,
           u.id AS staff_id,
           u.id,
           TRUE AS is_active,
           NULL::timestamptz AS created_at,
           NULL::timestamptz AS updated_at,
           NULL::timestamptz AS deactivated_at,
           u.name,
           u.email,
           u.image,
           COUNT(DISTINCT ri.id) FILTER (
             WHERE ri.status IN ('assigned', 'in_progress')
           )::int AS active_task_count,
           COUNT(DISTINCT ri.id) FILTER (
             WHERE ri.status IN ('resolved', 'closed')
           )::int AS completed_task_count
         FROM issue_assignments ia
         INNER JOIN reportissues ri ON ri.id = ia.issue_id
         INNER JOIN issue_category_departments icd
           ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
              LOWER(TRIM(ri.category))
         INNER JOIN "user" u ON u.id = ia.staff_id
         WHERE icd.department_id = $1
           AND u.role = 'maintenance_staff'
           AND u.is_active IS TRUE
         GROUP BY icd.department_id, u.id, u.name, u.email, u.image
         ORDER BY u.name ASC`,
        [department.id]
      );

  return {
    department,
    staff: result.rows,
    membershipSupported: workflowSchema.membershipAvailable,
  };
};

export const getManagerDepartmentStaffCandidates = async (
  managerId: string
) => {
  const departmentResult = await pool.query(
    `SELECT id
     FROM departments
     WHERE manager_id = $1
       AND is_active IS TRUE
     LIMIT 1`,
    [managerId]
  );

  const department = departmentResult.rows[0];

  if (!department) {
    throw new IssueWorkflowError(
      "No active department is assigned to this manager.",
      404
    );
  }

  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  const result = workflowSchema.membershipAvailable
    ? await pool.query(
        `SELECT u.id, u.name, u.email, u.image
         FROM "user" u
         WHERE u.role = 'maintenance_staff'
           AND u.is_active IS TRUE
           AND NOT EXISTS (
             SELECT 1
             FROM department_staff_members dsm
             WHERE dsm.staff_id = u.id
               AND dsm.is_active IS TRUE
           )
           AND NOT EXISTS (
             SELECT 1
             FROM issue_assignments ia
             INNER JOIN reportissues ri ON ri.id = ia.issue_id
             INNER JOIN issue_category_departments icd
               ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
                  LOWER(TRIM(ri.category))
             WHERE ia.staff_id = u.id
               AND icd.department_id <> $1
               AND ri.status NOT IN ('closed', 'rejected')
           )
         ORDER BY u.name ASC
         LIMIT 200`,
        [department.id]
      )
    : await pool.query(
        `SELECT DISTINCT u.id, u.name, u.email, u.image
         FROM issue_assignments ia
         INNER JOIN reportissues ri ON ri.id = ia.issue_id
         INNER JOIN issue_category_departments icd
           ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
              LOWER(TRIM(ri.category))
         INNER JOIN "user" u ON u.id = ia.staff_id
         WHERE icd.department_id = $1
           AND u.role = 'maintenance_staff'
           AND u.is_active IS TRUE
         ORDER BY u.name ASC
         LIMIT 200`,
        [department.id]
      );

  return result.rows;
};

export const addManagerDepartmentStaff = async (
  managerId: string,
  staffId: string
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(
    workflowSchema.membershipAvailable,
    "department staff membership"
  );

  return withTransaction(async (client) => {
    const department = await getManagerDepartment(client, managerId);

    if (!department) {
      throw new IssueWorkflowError(
        "No active department is assigned to this manager.",
        404
      );
    }

    const staffResult = await client.query(
      `SELECT id, name, email, image
       FROM "user"
       WHERE id = $1
         AND role = 'maintenance_staff'
         AND is_active IS TRUE
       FOR UPDATE`,
      [staffId]
    );

    if (staffResult.rows.length === 0) {
      throw new IssueWorkflowError(
        "Active maintenance staff member not found.",
        404
      );
    }

    const otherDepartmentMembership = await client.query(
      `SELECT department_id
       FROM department_staff_members
       WHERE staff_id = $1
         AND department_id <> $2
         AND is_active IS TRUE
       FOR UPDATE`,
      [staffId, department.id]
    );

    if (otherDepartmentMembership.rows.length > 0) {
      throw new IssueWorkflowError(
        "Staff member already belongs to another department.",
        409
      );
    }

    const otherDepartmentTask = await client.query(
      `SELECT ri.id
       FROM issue_assignments ia
       INNER JOIN reportissues ri ON ri.id = ia.issue_id
       INNER JOIN issue_category_departments icd
         ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
            LOWER(TRIM(ri.category))
       WHERE ia.staff_id = $1
         AND icd.department_id <> $2
         AND ri.status NOT IN ('closed', 'rejected')
       LIMIT 1
       FOR UPDATE OF ri`,
      [staffId, department.id]
    );

    if (otherDepartmentTask.rows.length > 0) {
      throw new IssueWorkflowError(
        "Staff member has an active task in another department.",
        409
      );
    }

    const result = await client.query(
      `INSERT INTO department_staff_members (
         department_id,
         staff_id,
         added_by
       )
       VALUES ($1, $2, $3)
       ON CONFLICT (department_id, staff_id)
       DO UPDATE SET
         added_by = EXCLUDED.added_by,
         is_active = TRUE,
         deactivated_by = NULL,
         deactivated_at = NULL,
         updated_at = NOW()
       RETURNING *`,
      [department.id, staffId, managerId]
    );

    return {
      ...result.rows[0],
      ...staffResult.rows[0],
    };
  });
};

export const deactivateManagerDepartmentStaff = async (
  managerId: string,
  staffId: string
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(
    workflowSchema.membershipAvailable,
    "department staff membership"
  );

  return withTransaction(async (client) => {
    const department = await getManagerDepartment(client, managerId);

    if (!department) {
      throw new IssueWorkflowError(
        "No active department is assigned to this manager.",
        404
      );
    }

    const membership = await client.query(
      `SELECT staff_id
       FROM department_staff_members
       WHERE department_id = $1
         AND staff_id = $2
         AND is_active IS TRUE
       FOR UPDATE`,
      [department.id, staffId]
    );

    if (membership.rows.length === 0) {
      throw new IssueWorkflowError(
        "Active department membership not found.",
        404
      );
    }

    const activeTask = await client.query(
      `SELECT ri.id
       FROM issue_assignments ia
       INNER JOIN reportissues ri ON ri.id = ia.issue_id
       INNER JOIN issue_category_departments icd
         ON LOWER(REPLACE(TRIM(icd.category), ' ', '_')) =
            LOWER(TRIM(ri.category))
       WHERE ia.staff_id = $1
         AND icd.department_id = $2
         AND ri.status IN ('assigned', 'in_progress', 'resolved')
       LIMIT 1`,
      [staffId, department.id]
    );

    if (activeTask.rows.length > 0) {
      throw new IssueWorkflowError(
        "Reassign or finish the staff member's active tasks before deactivation.",
        409
      );
    }

    const result = await client.query(
      `UPDATE department_staff_members
       SET
         is_active = FALSE,
         deactivated_by = $3,
         deactivated_at = NOW(),
         updated_at = NOW()
       WHERE department_id = $1
         AND staff_id = $2
         AND is_active IS TRUE
       RETURNING *`,
      [department.id, staffId, managerId]
    );

    if (result.rows.length === 0) {
      throw new IssueWorkflowError(
        "Active department membership not found.",
        404
      );
    }

    return result.rows[0];
  });
};