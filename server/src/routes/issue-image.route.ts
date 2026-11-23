import { Router } from "express";

import upload from "../middlewares/upload.middleware.js";
import {
    uploadIssueImages,
} from "../controllers/issue-image.controller.js";

const router = Router();

router.post(
    "/:issueId/images",
    upload.array("images", 5),
    uploadIssueImages
);

export default router;