
import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
} from "jose";

import pool from "../config/db.js";

// Supported user roles
export type UserRole =
  | "admin"
  | "department_manager"
  | "maintenance_staff"
  | "citizen";

// Authenticated user information
export interface AuthUser extends JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

// Extend Express Locals
declare global {
  namespace Express {
    interface Locals {
      user: AuthUser;
    }
  }
}

// Better Auth JWKS endpoint
const JWKS = createRemoteJWKSet(
  new URL(process.env.AUTH_JWKS_URL!)
);

// Verify JWT and account status
export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract JWT
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // 2. Verify JWT
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.AUTH_URL,
      audience: process.env.AUTH_URL,
    });

    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // 3. Check account status and get trusted role
    const userResult = await pool.query(
      `SELECT id, email, role, is_active
       FROM "user"
       WHERE id = $1`,
      [payload.id]
    );

    const user = userResult.rows[0];

    if (!user || user.is_active !== true) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated or does not exist.",
      });
    }

    // 4. Store authenticated user
    res.locals.user = {
      ...payload,
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "JWTExpired" ||
        error.name === "JWSSignatureVerificationFailed" ||
        error.name === "JWTClaimValidationFailed" ||
        error.name === "JWSInvalid" ||
        error.name === "JWKSNoMatchingKey")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    console.error("Authentication Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// Check user roles
export const authorizeRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = res.locals.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    if (!allowedRoles.includes(user.role)) {
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
