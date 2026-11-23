import { Router } from "express";
import { createIssueController, getIssuesController } from "../controllers/reportIssue.controller.js";
import { requireCitizen } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", requireCitizen, createIssueController);

router.get("/", requireCitizen, getIssuesController)


export default router;