import pool from "../config/db.js";

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

// Get all users with search, filter and pagination
export const getAllUsers = async ({
  search = "",
  role = "",
  page = 1,
  limit = 10,
}: UserFilters) => {
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(name ILIKE $${values.length} OR email ILIKE $${values.length})`
    );
  }

  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM "user"
     ${whereClause}`,
    values
  );

  const total = countResult.rows[0].total;

  const dataValues = [...values, limit, offset];

  const result = await pool.query(
    `SELECT
      id,
      name,
      email,
      image,
      role,
      address,
      is_active,
      "createdAt"
     FROM "user"
     ${whereClause}
     ORDER BY "createdAt" DESC
     LIMIT $${dataValues.length - 1}
     OFFSET $${dataValues.length}`,
    dataValues
  );

  return {
    users: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get user by ID
export const getUserById = async (id: string) => {
  const result = await pool.query(
    `SELECT
      id,
      name,
      email,
      image,
      role,
      address,
      is_active,
      "createdAt"
     FROM "user"
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

// Update user role
export const updateUserRole = async (
  id: string,
  role: string
) => {
  const result = await pool.query(
    `UPDATE "user"
     SET role = $1,
         "updatedAt" = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, is_active`,
    [role, id]
  );

  return result.rows[0] || null;
};

// Update user active status
export const updateUserStatus = async (
  id: string,
  isActive: boolean
) => {
  const result = await pool.query(
    `UPDATE "user"
     SET is_active = $1,
         "updatedAt" = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, is_active`,
    [isActive, id]
  );

  return result.rows[0] || null;
};
