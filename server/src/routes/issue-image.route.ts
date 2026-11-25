import { Router } from "express";

import upload from "../middlewares/upload.middleware.js";
import {
    uploadIssueImages,
} from "../controllers/issue-image.controller.js";
import {
    requireAuth,
    requireCitizen,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/:issueId/images",
    requireAuth,
    requireCitizen,
    upload.array("images", 5),
    uploadIssueImages
);

export default router;