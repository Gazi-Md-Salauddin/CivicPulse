
import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  jwtClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,

  plugins: [
    inferAdditionalFields({
      user: {
        address: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: false,
        },
      },
    }),

    jwtClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
