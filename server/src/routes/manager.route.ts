import { Router } from "express";

import {
  requireAuth,
  requireDepartmentManager,
} from "../middlewares/auth.middleware.js";

import {
  managerDashboardController,
  managerIssuesController,
  managerIssueDetailsController,
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

export default router;