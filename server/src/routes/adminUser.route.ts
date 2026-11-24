import { Router } from "express";

import {
  requireAuth,
  requireAdmin,
} from "../middlewares/auth.middleware.js";

import {
  getAllUsersController,
  getUserDetailsController,
  updateUserRoleController,
  deactivateUserController,
  activateUserController,
} from "../controllers/adminUser.controller.js";

const router = Router();

// Admin authentication and authorization
router.use(requireAuth, requireAdmin);

// User management routes
router.get("/", getAllUsersController);
router.get("/:id", getUserDetailsController);
router.patch("/:id/role", updateUserRoleController);
router.patch("/:id/deactivate", deactivateUserController);
router.patch("/:id/activate", activateUserController);

export default router;
