import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import pool from "../config/db.js";

// Supported user roles
export type UserRole =
  | "admin"
  | "department_manager"
  | "maintenance_staff"
  | "citizen";

// Better Auth session type
type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

// Extend Express Locals
declare global {
  namespace Express {
    interface Locals {
      session: AuthSession;
    }
  }
}

// Check authentication and account status
export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Verify Better Auth session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // 2. Check whether account is active
    const userResult = await pool.query(
      `SELECT is_active
       FROM "user"
       WHERE id = $1`,
      [session.user.id]
    );

    if (
      !userResult.rows[0] ||
      userResult.rows[0].is_active !== true
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated.",
      });
    }

    // 3. Store authenticated session
    res.locals.session = session;

    next();
  } catch (error) {
    console.error("Authentication Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// Check user roles
export const authorizeRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (req, res, next) => {
    const session = res.locals.session;

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    const userRole = (
      session.user as typeof session.user & {
        role?: string;
      }
    ).role;

    if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission.",
      });
    }

    next();
  };
};

// Role-specific middleware
export const requireAdmin = authorizeRoles("admin");

export const requireDepartmentManager =
  authorizeRoles("department_manager");

export const requireMaintenanceStaff =
  authorizeRoles("maintenance_staff");

export const requireCitizen = authorizeRoles("citizen");
