import { Router } from "express";
import { createIssueController, getIssuesController } from "../controllers/reportIssue.controller.js";
import { requireAuth, requireCitizen } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireCitizen);

router.post("/", requireCitizen, createIssueController);

router.get("/", getIssuesController)


export default router;