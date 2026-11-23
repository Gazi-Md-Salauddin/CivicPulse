import pool from "../config/db.js";

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

  const result = await pool.query(
    `INSERT INTO reportissues (
      title,
      description,
      category,
      image_url,
      location_address,
      latitude,
      longitude,
      reporter_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

  return result.rows[0];
};



export const getIssues = async (reporterId: string) => {
  const result = await pool.query(
    `SELECT * FROM reportissues WHERE reporter_id = $1 ORDER BY created_at DESC`,
    [reporterId]
  );

  return result.rows;
}


