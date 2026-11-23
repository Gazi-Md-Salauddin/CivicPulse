import { Router } from "express";
import { getAllPublicIssuesController, getPublicIssueByIdController } from "../controllers/publicIssue.controller.js";

const router = Router()


// Public: Get all reported issues
router.get("/", getAllPublicIssuesController);

// Get single issue details
router.get("/:id", getPublicIssueByIdController);

export default router;