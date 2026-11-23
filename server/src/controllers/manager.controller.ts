import type { Request, Response } from "express";

import {
  getManagerDashboard,
} from "../models/manager.model.js";

export const managerDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const session = res.locals.session;

    const managerId = session.user.id;

    const dashboard = await getManagerDashboard(managerId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "No department assigned to this manager.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Manager dashboard retrieved successfully.",
      data: dashboard,
    });

  } catch (error) {
    console.error("Manager Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve manager dashboard.",
    });
  }
};