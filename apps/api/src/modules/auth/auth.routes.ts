import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../../factory";
import {
  githubCallbackHandler,
  githubOAuthHandler,
  wakatimeConnectHandler,
} from "./auth.handlers";

const router = createRouter();

export const githubOAuthRoute = createRoute({
  method: "get",
  path: "/auth/github",
  tags: ["Auth"],
  responses: {
    302: {
      description: "Redirect to GitHub OAuth",
    },
  },
});

export const githubCallbackRoute = createRoute({
  method: "get",
  path: "/auth/github/callback",
  tags: ["Auth"],
  request: {
    query: z.object({
      code: z.string().min(1),
    }),
  },
  responses: {
    200: {
      description: "JWT issued",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string(),
            user: z.object({
              id: z.string(),
              username: z.string(),
              avatarUrl: z.string().url(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Invalid callback payload",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const wakatimeConnectRoute = createRoute({
  method: "post",
  path: "/auth/wakatime/connect",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            username: z.string().min(1),
            apiKey: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "WakaTime connected",
      content: {
        "application/json": {
          schema: z.object({
            connected: z.boolean(),
            eligibleForScoring: z.boolean(),
            totalSeconds7d: z.number(),
          }),
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

router.openapi(githubOAuthRoute, githubOAuthHandler);
router.openapi(githubCallbackRoute, githubCallbackHandler);
router.openapi(wakatimeConnectRoute, wakatimeConnectHandler);

export { router as authRoutes };
