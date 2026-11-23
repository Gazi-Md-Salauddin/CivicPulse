import type { Request, Response } from "express";
import { getAllPublicIssues } from "../models/publicIssue.model.js";
import { getPublicIssueById } from "../models/publicIssue.model.js";

// Get all citizen reports
export const getAllPublicIssuesController = async (
  req: Request,
  res: Response
) => {
  try {
    const issues = await getAllPublicIssues();

    return res.status(200).json({
      success: true,
      message: "Public issues retrieved successfully",
      total: issues.length,
      data: issues,
    });
  } catch (error) {
    console.error("Get Public Issues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve public issues",
    });
  }
};


// Get issue by id
export const getPublicIssueByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required.",
      });
    }

    const issue = await getPublicIssueById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue details retrieved successfully.",
      data: issue,
    });

  } catch (error) {
    console.error("Get Public Issue Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve issue details.",
    });
  }
};