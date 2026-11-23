import { Router } from "express";

import {
  getMaintenanceDashboardController,
  getAssignedIssuesController,
  getAssignedIssueByIdController,
  updateAssignedIssueStatusController,
  addIssueWorkNoteController,
  getIssueWorkNotesController,
} from "../controllers/maintenance.controller.js";

import {
  requireAuth,
  requireMaintenanceStaff,
} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require maintenance staff authentication
router.use(requireAuth, requireMaintenanceStaff);

// Dashboard
router.get(
  "/dashboard",
  getMaintenanceDashboardController
);

// Assigned issues
router.get(
  "/issues",
  getAssignedIssuesController
);

// Single assigned issue
router.get(
  "/issues/:id",
  getAssignedIssueByIdController
);

// Update issue status
router.patch(
  "/issues/:id/status",
  updateAssignedIssueStatusController
);

// Add work note
router.post(
  "/issues/:id/notes",
  addIssueWorkNoteController
);

// Get work notes
router.get(
  "/issues/:id/notes",
  getIssueWorkNotesController
);

export default router;
