import express, { type Express, type Request, type Response } from 'express';

import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import issueRoutes from './routes/reportIssue.route.js';
import issueImageRoutes from "./routes/issue-image.route.js";
import publicIssueRoutes from "./routes/publicIssue.route.js";
import maintenanceRoutes from "./routes/maintenance.route.js";
import departmentRoutes from "./routes/admin.route.js";
import managerDashboardRoutes from "./routes/manager.route.js";

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

app.use("/api/admin/departments", departmentRoutes);

app.use("/api/manager", managerDashboardRoutes);

// BetterAuth route
app.all("/api/*splat", toNodeHandler(auth));



app.get("/", (req: Request, res: Response) => {
    res.send("Hello world")
})



export default app;