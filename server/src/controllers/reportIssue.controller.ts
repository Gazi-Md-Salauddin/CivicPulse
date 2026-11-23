import type { Request, Response } from "express";
import { createIssue } from "../models/reportIssue.model.js";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { getIssues } from "../models/reportIssue.model.js";


export const createIssueController = async (
  req: Request,
  res: Response
) => {
  try {
    // Verify logged-in user
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

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
      !title ||
      !description ||
      !category ||
      !location_address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const issue = await createIssue({
      title,
      description,
      category,
      image_url,
      location_address,
      latitude,
      longitude,
      reporter_id: session.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Issue reported successfully.",
      data: issue,
    });

  } catch (error) {
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
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }
    // Get logged-in user's issues
    const issues = await getIssues(session.user.id);

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

