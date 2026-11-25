
import type { Request, Response } from "express";

import {
  addManagerDepartmentStaff,
  assignManagerIssue,
  deactivateManagerDepartmentStaff,
  getManagerDashboard,
  getManagerDepartmentStaff,
  getManagerDepartmentStaffCandidates,
  getManagerIssues,
  getManagerIssueDetails,
  transitionManagerIssue,
  updateManagerIssuePriority,
} from "../models/manager.model.js";
import {
  IssueWorkflowError,
  isIssuePriority,
} from "../lib/issueWorkflow.js";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const sendWorkflowError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  if (error instanceof IssueWorkflowError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({
    success: false,
    message: "Failed to process department operation.",
  });
};

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

    const requestedPage = Number(req.query.page ?? 1);
    const requestedLimit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1 ||
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers.",
      });
    }

    const page = requestedPage;
    const limit = Math.min(
      100,
      requestedLimit
    );

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;
    const validStatuses = [
      "pending",
      "submitted",
      "under_review",
      "assigned",
      "in_progress",
      "resolved",
      "closed",
      "rejected",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue status filter.",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    if (search && search.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Search text must be 200 characters or fewer.",
      });
    }

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
    const issueId = req.params.issueId;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (typeof issueId !== "string" || !isUuid(issueId)) {
      return res.status(400).json({
        success: false,
        message: "A valid issue ID is required.",
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

const transitionDepartmentIssue = async (
  req: Request,
  res: Response,
  nextStatus: "under_review" | "rejected" | "closed"
) => {
  const issueId = req.params.issueId;

  if (typeof issueId !== "string" || !isUuid(issueId)) {
    return res.status(400).json({
      success: false,
      message: "A valid issue ID is required.",
    });
  }

  const reason =
    typeof req.body?.reason === "string"
      ? req.body.reason.trim()
      : undefined;

  if (
    nextStatus === "rejected" &&
    (!reason || reason.length > 2000)
  ) {
    return res.status(400).json({
      success: false,
      message: "A rejection reason between 1 and 2000 characters is required.",
    });
  }

  try {
    const issue = await transitionManagerIssue(
      res.locals.session.user.id,
      issueId,
      nextStatus,
      reason
    );

    return res.status(200).json({
      success: true,
      message: `Issue ${nextStatus === "under_review" ? "verified" : nextStatus}.`,
      data: issue,
    });
  } catch (error) {
    return sendWorkflowError(res, error, "Manager issue transition failed:");
  }
};

export const verifyManagerIssueController = (
  req: Request,
  res: Response
) => transitionDepartmentIssue(req, res, "under_review");

export const rejectManagerIssueController = (
  req: Request,
  res: Response
) => transitionDepartmentIssue(req, res, "rejected");

export const closeManagerIssueController = (
  req: Request,
  res: Response
) => transitionDepartmentIssue(req, res, "closed");

export const setManagerIssuePriorityController = async (
  req: Request,
  res: Response
) => {
  const issueId = req.params.issueId;
  const { priority } = req.body ?? {};

  if (typeof issueId !== "string" || !isUuid(issueId)) {
    return res.status(400).json({
      success: false,
      message: "A valid issue ID is required.",
    });
  }

  if (!isIssuePriority(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be low, medium, high, or critical.",
    });
  }

  try {
    const issue = await updateManagerIssuePriority(
      res.locals.session.user.id,
      issueId,
      priority
    );

    return res.status(200).json({
      success: true,
      message: "Issue priority updated successfully.",
      data: issue,
    });
  } catch (error) {
    return sendWorkflowError(res, error, "Manager issue priority update failed:");
  }
};

export const assignManagerIssueController = async (
  req: Request,
  res: Response
) => {
  const issueId = req.params.issueId;
  const { staffId } = req.body ?? {};

  if (typeof issueId !== "string" || !isUuid(issueId)) {
    return res.status(400).json({
      success: false,
      message: "A valid issue ID is required.",
    });
  }

  if (typeof staffId !== "string" || !staffId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A staff ID is required.",
    });
  }

  try {
    const issue = await assignManagerIssue(
      res.locals.session.user.id,
      issueId,
      staffId.trim()
    );

    return res.status(200).json({
      success: true,
      message: "Maintenance staff assigned successfully.",
      data: issue,
    });
  } catch (error) {
    return sendWorkflowError(res, error, "Manager issue assignment failed:");
  }
};

export const getManagerDepartmentStaffController = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getManagerDepartmentStaff(
      res.locals.session.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Department staff retrieved successfully.",
      data,
    });
  } catch (error) {
    return sendWorkflowError(res, error, "Manager staff retrieval failed:");
  }
};

export const getManagerDepartmentStaffCandidatesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const staff = await getManagerDepartmentStaffCandidates(
      res.locals.session.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Available maintenance staff retrieved successfully.",
      data: staff,
    });
  } catch (error) {
    return sendWorkflowError(res, error, "Manager staff candidate retrieval failed:");
  }
};

export const addManagerDepartmentStaffController = async (
  req: Request,
  res: Response
) => {
  const { staffId } = req.body ?? {};

  if (typeof staffId !== "string" || !staffId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A staff ID is required.",
    });
  }

  try {
    const staff = await addManagerDepartmentStaff(
      res.locals.session.user.id,
      staffId.trim()
    );

    return res.status(201).json({
      success: true,
      message: "Staff member added to the department.",
      data: staff,
    });
  } catch (error) {
    return sendWorkflowError(res, error, "Manager staff addition failed:");
  }
};

export const deactivateManagerDepartmentStaffController = async (
  req: Request,
  res: Response
) => {
  const staffId = req.params.staffId;

  if (typeof staffId !== "string" || !staffId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A staff ID is required.",
    });
  }

  try {
    const staff = await deactivateManagerDepartmentStaff(
      res.locals.session.user.id,
      staffId
    );

    return res.status(200).json({
      success: true,
      message: "Department membership deactivated.",
      data: staff,
    });
  } catch (error) {
    return sendWorkflowError(res, error, "Manager staff deactivation failed:");
  }
};