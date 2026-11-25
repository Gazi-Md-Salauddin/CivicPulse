
import pool from "../config/db.js";

// Create Department
export const createDepartment = async (
  name: string,
  description: string
) => {
  const existing = await pool.query(
    `SELECT id FROM departments WHERE LOWER(name) = LOWER($1)`,
    [name.trim()]
  );

  if (existing.rows.length > 0) {
    throw new Error("DEPARTMENT_ALREADY_EXISTS");
  }

  const result = await pool.query(
    `INSERT INTO departments (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [name.trim(), description]
  );

  return result.rows[0];
};

// Get All Departments
export const getAllDepartments = async () => {
    const result = await pool.query(
        `SELECT
       d.*,
       u.name AS manager_name,
       u.email AS manager_email
     FROM departments d
     LEFT JOIN "user" u ON u.id = d.manager_id
     WHERE d.is_active = TRUE
     ORDER BY d.created_at DESC`
    );

    return result.rows;
};

// Get Department By ID
export const getDepartmentById = async (id: string) => {
    const result = await pool.query(
        `SELECT
       d.*,
       u.name AS manager_name,
       u.email AS manager_email
     FROM departments d
     LEFT JOIN "user" u ON u.id = d.manager_id
     WHERE d.id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

// Update Department
export const updateDepartment = async (
    id: string,
    name: string,
    description: string,
    location: string
) => {
    const result = await pool.query(
        `UPDATE departments
     SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       location = COALESCE($4, location),
       updated_at = NOW()
     WHERE id = $1 AND is_active = TRUE
     RETURNING *`,
        [id, name, description, location]
    );

    return result.rows[0] || null;
};

// Assign Department Manager
export const assignDepartmentManager = async (
    departmentId: string,
    managerId: string
) => {
    // Check whether user exists and has manager role
    const managerResult = await pool.query(
        `SELECT id, name, email
     FROM "user"
     WHERE id = $1
       AND role = 'department_manager'
       AND is_active IS TRUE`,
        [managerId]
    );

    if (managerResult.rows.length === 0) {
        return { error: "INVALID_MANAGER" };
    }

    const departmentResult = await pool.query(
        `UPDATE departments
     SET manager_id = $2,
         updated_at = NOW()
     WHERE id = $1 AND is_active = TRUE
     RETURNING *`,
        [departmentId, managerId]
    );

    if (departmentResult.rows.length === 0) {
        return { error: "DEPARTMENT_NOT_FOUND" };
    }

    return {
        department: departmentResult.rows[0],
        manager: managerResult.rows[0],
    };
};

// Deactivate Department
export const deactivateDepartment = async (id: string) => {
    const result = await pool.query(
        `UPDATE departments
     SET is_active = FALSE,
         updated_at = NOW()
     WHERE id = $1 AND is_active = TRUE
     RETURNING *`,
        [id]
    );

    return result.rows[0] || null;
};
