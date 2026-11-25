import type { Request, Response } from "express";
import {
  createIssue,
  getCitizenIssueDetails,
  getCitizenIssueStatusHistory,
  getIssues,
} from "../models/reportIssue.model.js";
import { IssueWorkflowError } from "../lib/issueWorkflow.js";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export const createIssueController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      description,
      category,
      image_url,
      location_address,
      latitude,
      longitude,
    } = req.body;

    // Validation
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof location_address !== "string" ||
      !location_address.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    if (
      (latitude !== undefined &&
        (typeof latitude !== "number" ||
          !Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90)) ||
      (longitude !== undefined &&
        (typeof longitude !== "number" ||
          !Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid GPS coordinates.",
      });
    }

    const issue = await createIssue({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      image_url,
      location_address: location_address.trim(),
      latitude,
      longitude,
      reporter_id: res.locals.session.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Issue reported successfully.",
      data: issue,
    });

  } catch (error) {
    if (error instanceof IssueWorkflowError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create Issue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report issue.",
    });
  }
};

// Get citizen own reports
export const getIssuesController = async (
  req: Request,
  res: Response
) => {
  try {
    const issues = await getIssues(res.locals.session.user.id);

    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: issues,
    });
  } catch (error) {
    console.error("Get Issues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve issues",
    });
  }
}

export const getCitizenIssueDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const issueId = req.params.issueId;

    if (typeof issueId !== "string" || !isUuid(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required.",
      });
    }

    const reporterId = res.locals.session.user.id;
    const issue = await getCitizenIssueDetails(issueId, reporterId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    const statusHistory = await getCitizenIssueStatusHistory(
      issueId,
      reporterId
    );

    return res.status(200).json({
      success: true,
      message: "Issue details retrieved successfully.",
      data: { ...issue, statusHistory },
    });
  } catch (error) {
    console.error("Get Citizen Issue Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve issue details.",
    });
  }
};

export const getCitizenIssueHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const issueId = req.params.issueId;

    if (typeof issueId !== "string" || !isUuid(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required.",
      });
    }

    const reporterId = res.locals.session.user.id;
    const issue = await getCitizenIssueDetails(issueId, reporterId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    const statusHistory = await getCitizenIssueStatusHistory(
      issueId,
      reporterId
    );

    return res.status(200).json({
      success: true,
      message: "Issue status history retrieved successfully.",
      data: statusHistory,
    });
  } catch (error) {
    console.error("Get Citizen Issue History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve issue history.",
    });
  }
};

