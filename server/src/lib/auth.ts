import { betterAuth } from "better-auth";
import pool from "../config/db.js";


export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [
    process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  ],

  database: pool,

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
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
