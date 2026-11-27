import type { Request, Response } from "express";

import {
  getMaintenanceDashboard,
  getAssignedIssues,
  getAssignedIssueById,
  getAssignedIssueDetails,
  updateAssignedIssueStatus,
  addIssueWorkNote,
  getIssueWorkNotes,
  saveCompletionPhotos,
  type CompletionPhotoInput,
} from "../models/maintenance.model.js";
import { getIssueWorkflowSchemaFeatures } from "../lib/issueWorkflow.js";
import {
  deleteCloudinaryImages,
  uploadImageBuffer,
} from "../lib/cloudinaryImages.js";
import {
  IssueWorkflowError,
} from "../lib/issueWorkflow.js";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const respondMaintenanceError = (
  res: Response,
  error: unknown,
  message: string
) => {
  if (error instanceof IssueWorkflowError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(message, error);
  return res.status(500).json({
    success: false,
    message: "Failed to process maintenance request.",
  });
};


// Dashboard
export const getMaintenanceDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.user.id;

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
    const staffId = res.locals.user.id;

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
    const staffId = res.locals.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string" || !isUuid(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await getAssignedIssueDetails(issueId, staffId);

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
    const staffId = res.locals.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string" || !isUuid(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const status = req.body?.status;

    if (status !== "in_progress" && status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: in_progress, resolved",
      });
    }

    try {
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
      return respondMaintenanceError(
        res,
        error,
        "Update Issue Status Error:"
      );
    }
  } catch (error) {
    console.error("Update Issue Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update issue status",
    });
  }
};

const detectImageMimeType = (
  file: Express.Multer.File
): "image/jpeg" | "image/png" | "image/webp" | null => {
  const buffer = file.buffer;

  if (
    file.mimetype === "image/jpeg" &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    file.mimetype === "image/png" &&
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "image/png";
  }

  if (
    file.mimetype === "image/webp" &&
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
};

export const uploadCompletionPhotosController = async (
  req: Request,
  res: Response
) => {
  const issueId = req.params.id;
  const staffId = res.locals.user.id;

  if (typeof issueId !== "string" || !isUuid(issueId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid issue ID.",
    });
  }

  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Select at least one completion photo.",
    });
  }

  const validFiles: Array<{
    file: Express.Multer.File;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  }> = [];

  for (const file of files) {
    const mimeType = detectImageMimeType(file);

    if (
      !mimeType ||
      file.size <= 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      return res.status(400).json({
        success: false,
        message: "Photos must be valid JPEG, PNG, or WEBP images up to 5 MB.",
      });
    }

    validFiles.push({ file, mimeType });
  }

  const uploadedPublicIds: string[] = [];

  try {
    const workflowSchema = await getIssueWorkflowSchemaFeatures();

    if (!workflowSchema.completionPhotosAvailable) {
      return res.status(409).json({
        success: false,
        message:
          "Completion photo storage requires the issue workflow database migration.",
      });
    }

    const issue = await getAssignedIssueById(issueId, staffId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Assigned issue not found.",
      });
    }

    if (issue.status !== "in_progress" && issue.status !== "resolved") {
      return res.status(409).json({
        success: false,
        message: "Completion photos can only be uploaded to active or resolved tasks.",
      });
    }

    const photos: CompletionPhotoInput[] = [];

    for (const { file, mimeType } of validFiles) {
      const uploaded = await uploadImageBuffer(
        file.buffer,
        "civicpulse/completions"
      );

      uploadedPublicIds.push(uploaded.public_id);
      photos.push({
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        mimeType,
        fileSizeBytes: file.size,
      });
    }

    const savedPhotos = await saveCompletionPhotos(
      issueId,
      staffId,
      photos
    );

    return res.status(201).json({
      success: true,
      message: "Completion photos uploaded successfully.",
      data: savedPhotos,
    });
  } catch (error) {
    await deleteCloudinaryImages(uploadedPublicIds);
    return respondMaintenanceError(
      res,
      error,
      "Completion photo upload failed:"
    );
  }
};


// Add work note
export const addIssueWorkNoteController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string" || !isUuid(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const { note } = req.body;

    if (
      typeof note !== "string" ||
      !note.trim() ||
      note.trim().length > 4000
    ) {
      return res.status(400).json({
        success: false,
        message: "A work note of 1 to 4000 characters is required.",
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
    return respondMaintenanceError(
      res,
      error,
      "Add Work Note Error:"
    );
  }
};


// Get work notes
export const getIssueWorkNotesController = async (
  req: Request,
  res: Response
) => {
  try {
    const staffId = res.locals.user.id;
    const issueId = req.params.id;

    if (typeof issueId !== "string" || !isUuid(issueId)) {
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
