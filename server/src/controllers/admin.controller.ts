import type { Request, Response } from "express";

import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  assignDepartmentManager,
  deactivateDepartment,
} from "../models/admin.model.js";

// Create Department
export const createDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description, location } = req.body;

    if (!name || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, description and location are required.",
      });
    }

    const department = await createDepartment(
      name.trim(),
      description.trim(),
      location.trim()
    );

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Create Department Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create department.",
    });
  }
};

// Get All Departments
export const getAllDepartmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const departments = await getAllDepartments();

    return res.status(200).json({
      success: true,
      total: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error("Get Departments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve departments.",
    });
  }
};

// Get Department Details
export const getDepartmentDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    const department = await getDepartmentById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Department Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department details.",
    });
  }
};

// Update Department
export const updateDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, description, location } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    if (
      name === undefined &&
      description === undefined &&
      location === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    if (
      (name !== undefined && (typeof name !== "string" || !name.trim())) ||
      (description !== undefined && typeof description !== "string") ||
      (location !== undefined && typeof location !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department information.",
      });
    }

    const department = await updateDepartment(
      id,
      name === undefined ? null : name.trim(),
      description === undefined ? null : description.trim(),
      location === undefined ? null : location.trim()
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found or inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Update Department Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update department.",
    });
  }
};

// Assign Department Manager
export const assignDepartmentManagerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { manager_id } = req.body;

    if (!manager_id || typeof manager_id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Manager ID is required.",
      });
    }

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    const result = await assignDepartmentManager(id, manager_id);

    if ("error" in result) {
      if (result.error === "INVALID_MANAGER") {
        return res.status(400).json({
          success: false,
          message: "Invalid manager. User must have department_manager role.",
        });
      }

      return res.status(404).json({
        success: false,
        message: "Department not found or inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department manager assigned successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Assign Manager Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign department manager.",
    });
  }
};

// Deactivate Department
export const deactivateDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    const department = await deactivateDepartment(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found or already inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department deactivated successfully.",
      data: department,
    });
  } catch (error) {
    console.error("Deactivate Department Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate department.",
    });
  }
};
