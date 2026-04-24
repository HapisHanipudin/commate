import type { RouteHandler } from "@hono/zod-openapi";
import { sql } from "drizzle-orm";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { matchRoute } from "./match.routes";

type EmbeddingResult = { data?: number[][] };

type MatchRow = {
  username: string;
  avatar_url: string;
  top_skills: string[];
  similarity: number;
};

const createEmbedding = async (ai: Ai, input: string): Promise<number[]> => {
  const response = (await ai.run("@cf/baai/bge-base-en-v1.5", {
    text: [input],
  })) as EmbeddingResult;

  return response.data?.[0] ?? [];
};

const shouldIncludeNonApprentice = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();
  return lowerPrompt.includes("junior") || lowerPrompt.includes("intern");
};

const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export const matchHandler: RouteHandler<typeof matchRoute, AppEnv> = async (
  c,
) => {
  const env = getValidatedEnv(c.env);
  const db = createDb(env);
  const { prompt } = c.req.valid("json");

  const promptVector = await createEmbedding(env.AI, prompt);
  const vectorLiteral = toVectorLiteral(promptVector);
  const includeNonApprentice = shouldIncludeNonApprentice(prompt);

  const apprenticeFilter = includeNonApprentice
    ? sql``
    : sql`and u.apprentice_mode = true`;

  const rawResult = await db.execute(sql`
    select
      u.username,
      u.avatar_url,
      sv.top_skills,
      (1 - (sv.vector::text::vector <=> ${sql.raw(`'${vectorLiteral}'::vector`)})) as similarity
    from skill_vectors sv
    join users u on u.id = sv.user_id
    where 1=1
    ${apprenticeFilter}
    order by similarity desc
    limit 3
  `);

  const rows = (rawResult as unknown as { rows: MatchRow[] }).rows ?? [];

  return c.json(
    {
      prompt,
      results: rows.map((row) => ({
        username: row.username,
        avatarUrl: row.avatar_url,
        matchScore: Math.max(
          0,
          Math.min(100, Number((row.similarity * 100).toFixed(2))),
        ),
        topSkills: row.top_skills ?? [],
      })),
    },
    200,
  );
};
