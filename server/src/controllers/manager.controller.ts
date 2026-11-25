
import type { Request, Response } from "express";

import {
  getManagerDashboard, getManagerIssues,
  getManagerIssueDetails,
} from "../models/manager.model.js";

export const managerDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const managerId = res.locals.session?.user?.id;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    const dashboard = await getManagerDashboard(managerId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "No department assigned to this manager.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Manager dashboard retrieved successfully.",
      data: dashboard,
    });

  } catch (error) {
    console.error("Manager Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve manager dashboard.",
    });
  }
};




// Get manager's department issues
export const managerIssuesController = async (
  req: Request,
  res: Response
) => {
  try {
    const managerId = res.locals.session?.user?.id;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const data = await getManagerIssues(
      managerId,
      page,
      limit,
      status,
      search
    );

    return res.status(200).json({
      success: true,
      message: "Department issues retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Manager Issues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department issues",
    });
  }
};


// Get manager issue details
export const managerIssueDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const managerId = res.locals.session?.user?.id;
    const issueId = Array.isArray(req.params.issueId)
      ? req.params.issueId[0]
      : req.params.issueId;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required",
      });
    }

    const issue = await getManagerIssueDetails(managerId, issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found in your department",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue details retrieved successfully",
      data: issue,
    });
  } catch (error) {
    console.error("Manager Issue Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve issue details",
    });
  }
};