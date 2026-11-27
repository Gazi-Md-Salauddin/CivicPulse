import type {
  Request,
  Response,
} from "express";

import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
} from "../models/adminUser.model.js";

const VALID_ROLES = [
  "admin",
  "department_manager",
  "maintenance_staff",
  "citizen",
] as const;


// Get all users
export const getAllUsersController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const search = String(req.query.search || "").trim();
const role = String(req.query.role || "").trim();

    if (
      role &&
      !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    const result = await getAllUsers({
      search,
      role,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};

// Get user details
export const getUserDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get User Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user.",
    });
  }
};

// Update user role
export const updateUserRoleController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);
    const { role } = req.body;

    if (
      typeof role !== "string" ||
      !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Prevent admin from changing their own role
    if (res.locals.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const existingUser = await getUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = await updateUserRole(id, role);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Update User Role Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role.",
    });
  }
};

// Deactivate user
export const deactivateUserController = async (
  req: Request,
  res: Response
) => {
  return updateUserStatusController(req, res, false);
};

// Activate user
export const activateUserController = async (
  req: Request,
  res: Response
) => {
  return updateUserStatusController(req, res, true);
};

const updateUserStatusController = async (
  req: Request,
  res: Response,
  isActive: boolean
) => {
  try {
    const id = String(req.params.id);

    if (res.locals.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status.",
      });
    }

    const existingUser = await getUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = await updateUserStatus(id, isActive);

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully."
        : "User deactivated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Update User Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};
