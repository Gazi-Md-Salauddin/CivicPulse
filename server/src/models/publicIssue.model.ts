import pool from "../config/db.js";


export const getAllPublicIssues = async () => {
  const result = await pool.query(
    `SELECT
      id,
      title,
      description,
      category,
      image_url,
      location_address,
      latitude,
      longitude,
      status,
      created_at,
      updated_at
    FROM reportissues
    WHERE status != 'rejected'
    ORDER BY created_at DESC`
  );

  return result.rows;
};


export const getPublicIssueById = async (id: string) => {
  const result = await pool.query(
    `SELECT
      id,
      title,
      description,
      category,
      image_url,
      location_address,
      latitude,
      longitude,
      status,
      created_at,
      updated_at
    FROM reportissues
    WHERE id = $1
      AND status IS DISTINCT FROM 'rejected'
    LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
};
