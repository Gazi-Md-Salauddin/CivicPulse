import express, {
  type ErrorRequestHandler,
  type Express,
  type Request,
  type Response,
} from 'express';

import cors from "cors";
import multer from "multer";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import issueRoutes from './routes/reportIssue.route.js';
import issueImageRoutes from "./routes/issue-image.route.js";
import publicIssueRoutes from "./routes/publicIssue.route.js";
import maintenanceRoutes from "./routes/maintenance.route.js";
import departmentRoutes from "./routes/admin.route.js";
import managerDashboardRoutes from "./routes/manager.route.js";
import adminUserRoutes from "./routes/adminUser.route.js";

const app: Express = express();

app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());


// Public Issues API
app.use("/api/public/issues", publicIssueRoutes);


app.use("/api/issue", issueRoutes);

app.use("/api/issues", issueImageRoutes);

app.use("/api/maintenance", maintenanceRoutes);

app.use("/api/manager", managerDashboardRoutes);

app.use("/api/admin/users", adminUserRoutes);

app.use("/api/admin/departments", departmentRoutes);

// BetterAuth route
app.all("/api/*splat", toNodeHandler(auth));

const apiErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5 MB or smaller."
        : error.code === "LIMIT_FILE_COUNT"
          ? "You can upload at most 5 images."
          : "Invalid image upload request.";

    res.status(400).json({ success: false, message });
    return;
  }

  if (
    error instanceof Error &&
    error.message === "Only JPEG, PNG and WEBP images are allowed"
  ) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
    return;
  }

  console.error("Unhandled API error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world")
})

app.use(apiErrorHandler);

export default app;