import { Router } from "express";
import {
  createIssueController,
  getCitizenIssueDetailsController,
  getCitizenIssueHistoryController,
  getIssuesController,
} from "../controllers/reportIssue.controller.js";
import { requireAuth, requireCitizen } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireCitizen);

router.post("/", createIssueController);

router.get("/", getIssuesController);
router.get("/:issueId/history", getCitizenIssueHistoryController);
router.get("/:issueId", getCitizenIssueDetailsController);


export default router;