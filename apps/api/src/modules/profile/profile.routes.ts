import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../../factory";
import {
  profileByUsernameHandler,
  profileRefreshHandler,
} from "./profile.handlers";

const router = createRouter();

const profileResponseSchema = z.object({
  username: z.string(),
  avatarUrl: z.string().url(),
  bio: z.string().nullable(),
  apprenticeMode: z.boolean(),
  topSkills: z.array(z.string()),
  githubScore: z.number(),
  wakatimeScore: z.number().nullable(),
  updatedAt: z.string(),
});

export const getProfileRoute = createRoute({
  method: "get",
  path: "/profile/{username}",
  tags: ["Profile"],
  request: {
    params: z.object({
      username: z.string().min(1),
    }),
  },
  responses: {
    200: {
      description: "User profile",
      content: {
        "application/json": {
          schema: profileResponseSchema,
        },
      },
    },
    404: {
      description: "Profile not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const refreshProfileRoute = createRoute({
  method: "post",
  path: "/profile/refresh",
  tags: ["Profile"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            username: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Profile skill vector refreshed",
      content: {
        "application/json": {
          schema: z.object({
            refreshed: z.boolean(),
            githubScore: z.number(),
            wakatimeScore: z.number().nullable(),
            topSkills: z.array(z.string()),
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

router.openapi(getProfileRoute, profileByUsernameHandler);
router.openapi(refreshProfileRoute, profileRefreshHandler);

export { router as profileRoutes };
