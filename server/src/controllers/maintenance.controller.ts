
import type { Request, Response } from "express";

import {
  getMaintenanceDashboard,
  getAssignedIssues,
  getAssignedIssueById,
  updateAssignedIssueStatus,
  addIssueWorkNote,
  getIssueWorkNotes,
} from "../models/maintenance.model.js";


// Dashboard
export const getMaintenanceDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.session.user.id;

    const stats = await getMaintenanceDashboard(staffId);

    const recentIssues = await getAssignedIssues(staffId);

    return res.status(200).json({
      success: true,
      message: "Maintenance dashboard fetched successfully",
      data: {
        ...stats,
        recentIssues: recentIssues.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Maintenance Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance dashboard",
    });
  }
};


// Assigned issues
export const getAssignedIssuesController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.session.user.id;

    const issues = await getAssignedIssues(staffId);

    return res.status(200).json({
      success: true,
      message: "Assigned issues fetched successfully",
      data: issues,
    });
  } catch (error) {
    console.error("Get Assigned Issues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned issues",
    });
  }
};


// Single issue details
export const getAssignedIssueByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.session.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await getAssignedIssueById(issueId, staffId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Assigned issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue details fetched successfully",
      data: issue,
    });
  } catch (error) {
    console.error("Get Assigned Issue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issue details",
    });
  }
};


// Update status
export const updateAssignedIssueStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.session.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const { status } = req.body;

    const allowedStatuses = ["in_progress", "resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: in_progress, resolved",
      });
    }

    const issue = await getAssignedIssueById(issueId, staffId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Assigned issue not found",
      });
    }

    if (
      status === "in_progress" &&
      issue.status !== "assigned"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only assigned issues can be started",
      });
    }

    if (
      status === "resolved" &&
      issue.status !== "in_progress"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only in-progress issues can be resolved",
      });
    }

    const updatedIssue = await updateAssignedIssueStatus(
      issueId,
      staffId,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    console.error("Update Issue Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update issue status",
    });
  }
};


// Add work note
export const addIssueWorkNoteController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.session.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const { note } = req.body;

    if (typeof note !== "string" || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    const newNote = await addIssueWorkNote(
      issueId,
      staffId,
      note.trim()
    );

    if (!newNote) {
      return res.status(404).json({
        success: false,
        message: "Assigned issue not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Work note added successfully",
      data: newNote,
    });
  } catch (error) {
    console.error("Add Work Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add work note",
    });
  }
};


// Get work notes
export const getIssueWorkNotesController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.session.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await getAssignedIssueById(issueId, staffId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Assigned issue not found",
      });
    }

    const notes = await getIssueWorkNotes(issueId, staffId);

    return res.status(200).json({
      success: true,
      message: "Work notes fetched successfully",
      data: notes,
    });
  } catch (error) {
    console.error("Get Work Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch work notes",
    });
  }
};
