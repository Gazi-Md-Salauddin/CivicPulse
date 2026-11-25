import pool from "../config/db.js";
import {
  getIssueWorkflowSchemaFeatures,
  insertIssueStatusHistory,
  requireWorkflowFeature,
  withTransaction,
} from "../lib/issueWorkflow.js";

interface IIssue {
  title: string;
  description: string;
  category: string;
  image_url?: string;
  location_address: string;
  latitude?: number;
  longitude?: number;
  reporter_id: string;
}

export const createIssue = async (issue: IIssue) => {
  const {
    title,
    description,
    category,
    image_url,
    location_address,
    latitude,
    longitude,
    reporter_id,
  } = issue;

  const workflowSchema = await getIssueWorkflowSchemaFeatures();
  requireWorkflowFeature(workflowSchema.statusHistoryAvailable, "status history");

  return withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO reportissues (
        title,
        description,
        category,
        image_url,
        location_address,
        latitude,
        longitude,
        reporter_id,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted')
      RETURNING *`,
      [
        title,
        description,
        category,
        image_url ?? null,
        location_address,
        latitude ?? null,
        longitude ?? null,
        reporter_id,
      ]
    );

    const issue = result.rows[0];

    await insertIssueStatusHistory(client, {
      issueId: issue.id,
      previousStatus: null,
      newStatus: "submitted",
      changedBy: reporter_id,
    });

    return issue;
  });
};



export const getIssues = async (reporterId: string) => {
  const result = await pool.query(
    `SELECT * FROM reportissues WHERE reporter_id = $1 ORDER BY created_at DESC`,
    [reporterId]
  );

  return result.rows;
}

export const getCitizenIssueDetails = async (
  issueId: string,
  reporterId: string
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
       ri.status,
       ${prioritySelect},
       ri.created_at,
       ri.updated_at
     FROM reportissues ri
     WHERE ri.id = $1
       AND ri.reporter_id = $2
     LIMIT 1`,
    [issueId, reporterId]
  );

  const issue = result.rows[0];

  if (!issue) {
    return null;
  }

  const photosResult = workflowSchema.completionPhotosAvailable
    ? await pool.query(
        `SELECT id, image_url, mime_type, created_at
         FROM issue_completion_photos
         WHERE issue_id = $1
         ORDER BY created_at DESC`,
        [issueId]
      )
    : { rows: [] };

  return {
    ...issue,
    completion_photos: photosResult.rows,
  };
};

export const getCitizenIssueStatusHistory = async (
  issueId: string,
  reporterId: string
) => {
  const workflowSchema = await getIssueWorkflowSchemaFeatures();

  if (!workflowSchema.statusHistoryAvailable) {
    return [];
  }

  const result = await pool.query(
    `SELECT
       h.id,
       h.previous_status,
       h.new_status,
       h.public_message,
       h.created_at
     FROM issue_status_history h
     INNER JOIN reportissues ri
       ON ri.id = h.issue_id
     WHERE h.issue_id = $1
       AND ri.reporter_id = $2
     ORDER BY h.created_at ASC, h.id ASC`,
    [issueId, reporterId]
  );

  return result.rows;
};


