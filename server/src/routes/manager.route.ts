import { Router } from "express";

import {
  requireAuth,
  requireDepartmentManager,
} from "../middlewares/auth.middleware.js";

import {
  managerDashboardController,
  managerIssuesController,
  managerIssueDetailsController,
  addManagerDepartmentStaffController,
  assignManagerIssueController,
  closeManagerIssueController,
  deactivateManagerDepartmentStaffController,
  getManagerDepartmentStaffCandidatesController,
  getManagerDepartmentStaffController,
  rejectManagerIssueController,
  setManagerIssuePriorityController,
  verifyManagerIssueController,
} from "../controllers/manager.controller.js";

const router = Router();

router.get(
  "/dashboard",
  requireAuth,
  requireDepartmentManager,
  managerDashboardController
);



router.get(
  "/departmentissues",
  requireAuth,
  requireDepartmentManager,
  managerIssuesController
);

router.get(
  "/departmentissues/:issueId",
  requireAuth,
  requireDepartmentManager,
  managerIssueDetailsController
);

router.post(
  "/departmentissues/:issueId/verify",
  requireAuth,
  requireDepartmentManager,
  verifyManagerIssueController
);

router.post(
  "/departmentissues/:issueId/reject",
  requireAuth,
  requireDepartmentManager,
  rejectManagerIssueController
);

router.patch(
  "/departmentissues/:issueId/priority",
  requireAuth,
  requireDepartmentManager,
  setManagerIssuePriorityController
);

router.post(
  "/departmentissues/:issueId/assign",
  requireAuth,
  requireDepartmentManager,
  assignManagerIssueController
);

router.patch(
  "/departmentissues/:issueId/close",
  requireAuth,
  requireDepartmentManager,
  closeManagerIssueController
);

router.get(
  "/staff/candidates",
  requireAuth,
  requireDepartmentManager,
  getManagerDepartmentStaffCandidatesController
);

router.get(
  "/staff",
  requireAuth,
  requireDepartmentManager,
  getManagerDepartmentStaffController
);

router.post(
  "/staff",
  requireAuth,
  requireDepartmentManager,
  addManagerDepartmentStaffController
);

router.delete(
  "/staff/:staffId",
  requireAuth,
  requireDepartmentManager,
  deactivateManagerDepartmentStaffController
);

export default router;