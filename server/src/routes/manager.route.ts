import { Router } from "express";

import {
  requireAuth,
  requireDepartmentManager,
} from "../middlewares/auth.middleware.js";

import {
  managerDashboardController,
} from "../controllers/manager.controller.js";

const router = Router();

router.get(
  "/dashboard",
  requireAuth,
  requireDepartmentManager,
  managerDashboardController
);

export default router;