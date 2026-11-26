
import { betterAuth } from "better-auth";
import pool from "../config/db.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  basePath: "/api/auth",

  trustedOrigins: [
    "https://civicpulse-teal-nine.vercel.app",
    "http://localhost:3000",
  ],

  database: pool,

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    useSecureCookies: true,

    defaultCookieAttributes: {
      sameSite: "lax",
      secure: true,
      httpOnly: true,
      path: "/",
    },
  },

  user: {
    additionalFields: {
      address: {
        type: "string",
        required: true,
      },

      role: {
        type: [
          "admin",
          "citizen",
          "department_manager",
          "maintenance_staff",
        ],
        required: true,
        defaultValue: "citizen",
        input: false,
      },
    },
  },
});
