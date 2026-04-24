import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../../factory";
import { matchHandler } from "./match.handlers";

const router = createRouter();

export const matchRoute = createRoute({
  method: "post",
  path: "/match",
  tags: ["Match"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            prompt: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Top match results",
      content: {
        "application/json": {
          schema: z.object({
            prompt: z.string(),
            results: z.array(
              z.object({
                username: z.string(),
                avatarUrl: z.string().url(),
                matchScore: z.number(),
                topSkills: z.array(z.string()),
              }),
            ),
          }),
        },
      },
    },
  },
});

router.openapi(matchRoute, matchHandler);

export { router as matchRoutes };
