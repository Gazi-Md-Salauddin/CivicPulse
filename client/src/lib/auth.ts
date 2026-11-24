import { betterAuth } from "better-auth";
import pool from "pg";


export const auth = betterAuth({
  basePath: process.env.NEXT_PUBLIC_API_URL,

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  ],

  database: pool,

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      address: {
        type: "string",
        required: true,
      },

      role: {
        type: [
          "citizen",
          "department_manager",
          "maintenance_staff",
        ],
        required: true,
        defaultValue: "citizen",
        input: true,
      },
    },
  },
});
