import type { Request, Response } from "express";
import {
  getAdminDepartmentIssueOverview,
  getAdminIssueDetails,
  getAdminIssues,
} from "../models/adminIssue.model.js";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const VALID_STATUSES = [
  "pending",
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
  "rejected",
];

export const getAdminIssuesController = async (
  req: Request,
  res: Response
) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const status =
    typeof req.query.status === "string"
      ? req.query.status
      : undefined;
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : undefined;

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Page and limit must be positive integers.",
    });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid issue status filter.",
    });
  }

  if (search && search.length > 200) {
    return res.status(400).json({
      success: false,
      message: "Search text must be 200 characters or fewer.",
    });
  }

  try {
    const data = await getAdminIssues({
      page,
      limit: Math.min(limit, 100),
      status,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "System issue list retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Admin Issues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve system issues.",
    });
  }
};

export const getAdminIssueDetailsController = async (
  req: Request,
  res: Response
) => {
  const issueId = req.params.issueId;

  if (typeof issueId !== "string" || !isUuid(issueId)) {
    return res.status(400).json({
      success: false,
      message: "A valid issue ID is required.",
    });
  }

  try {
    const issue = await getAdminIssueDetails(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "System issue details retrieved successfully.",
      data: issue,
    });
  } catch (error) {
    console.error("Get Admin Issue Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve issue details.",
    });
  }
};

export const getAdminDepartmentIssueOverviewController = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getAdminDepartmentIssueOverview();

    return res.status(200).json({
      success: true,
      message: "Department issue overview retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Admin Department Issue Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department issue overview.",
    });
  }
};
