import { Router } from "express";
import {
  getAdminDepartmentIssueOverviewController,
  getAdminIssueDetailsController,
  getAdminIssuesController,
} from "../controllers/adminIssue.controller.js";
import {
  requireAdmin,
  requireAuth,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/departments/overview", getAdminDepartmentIssueOverviewController);
router.get("/", getAdminIssuesController);
router.get("/:issueId", getAdminIssueDetailsController);

export default router;
