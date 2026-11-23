import { Router } from "express";

import {
  requireAuth,
  requireAdmin,
} from "../middlewares/auth.middleware.js";

import {
  createDepartmentController,
  getAllDepartmentsController,
  getDepartmentDetailsController,
  updateDepartmentController,
  assignDepartmentManagerController,
  deactivateDepartmentController,
} from "../controllers/admin.controller.js";

const router = Router();

// All routes require Admin authentication
router.use(requireAuth, requireAdmin);

router.post("/", createDepartmentController);

router.get("/", getAllDepartmentsController);

router.get("/:id", getDepartmentDetailsController);

router.patch("/:id", updateDepartmentController);

router.patch("/:id/manager", assignDepartmentManagerController);

router.delete("/:id", deactivateDepartmentController);

export default router;
