import type { RouteHandler } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createDb, schema } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { getProfileRoute, refreshProfileRoute } from "./profile.routes";

type EmbeddingResult = { data?: number[][] };

const createEmbedding = async (ai: Ai, input: string): Promise<number[]> => {
  const response = (await ai.run("@cf/baai/bge-base-en-v1.5", {
    text: [input],
  })) as EmbeddingResult;

  return response.data?.[0] ?? [];
};

const inferTopSkills = (bio: string | null): string[] => {
  if (!bio) {
    return ["General Programming"];
  }

  const skills = [
    "TypeScript",
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Go",
    "Cloudflare",
    "PostgreSQL",
  ];

  const lowerBio = bio.toLowerCase();
  const matched = skills.filter((skill) =>
    lowerBio.includes(skill.toLowerCase()),
  );
  return matched.length > 0 ? matched : ["General Programming"];
};

const computeGithubScore = (followers: number, publicRepos: number): number => {
  return Math.round((followers * 0.4 + publicRepos * 0.6) * 100) / 100;
};

const fetchGithubPublicProfile = async (username: string) => {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "commate-api",
    },
  });

  if (!response.ok) {
    throw new Error("GitHub user not found");
  }

  const payload = (await response.json()) as {
    id: number;
    login: string;
    avatar_url: string;
    bio: string | null;
    followers: number;
    public_repos: number;
  };

  return {
    id: String(payload.id),
    username: payload.login,
    avatarUrl: payload.avatar_url,
    bio: payload.bio,
    followers: payload.followers,
    publicRepos: payload.public_repos,
  };
};

export const profileByUsernameHandler: RouteHandler<
  typeof getProfileRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const db = createDb(env);
  const { username } = c.req.valid("param");

  const [row] = await db
    .select({
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      bio: schema.users.bio,
      apprenticeMode: schema.users.apprenticeMode,
      topSkills: schema.skillVectors.topSkills,
      githubScore: schema.skillVectors.githubScore,
      wakatimeScore: schema.skillVectors.wakatimeScore,
      updatedAt: schema.skillVectors.updatedAt,
    })
    .from(schema.users)
    .leftJoin(
      schema.skillVectors,
      eq(schema.users.id, schema.skillVectors.userId),
    )
    .where(eq(schema.users.username, username))
    .limit(1);

  if (!row) {
    return c.json({ message: "Profile not found" }, 404);
  }

  return c.json(
    {
      username: row.username,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      apprenticeMode: row.apprenticeMode,
      topSkills: row.topSkills ?? [],
      githubScore: row.githubScore ?? 0,
      wakatimeScore: row.wakatimeScore ?? null,
      updatedAt: (row.updatedAt ?? new Date()).toISOString(),
    },
    200,
  );
};

export const profileRefreshHandler: RouteHandler<
  typeof refreshProfileRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const db = createDb(env);
  const { username } = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);

  if (!existing) {
    return c.json({ message: "User not found" }, 404);
  }

  const github = await fetchGithubPublicProfile(username);
  const githubScore = computeGithubScore(github.followers, github.publicRepos);
  const topSkills = inferTopSkills(github.bio);
  const embedding = await createEmbedding(
    env.AI,
    `${github.username}. Bio: ${github.bio ?? ""}. Skills: ${topSkills.join(", ")}`,
  );

  const wakatimeScore = existing.wakatimeConnected ? 0 : null;

  await db
    .update(schema.users)
    .set({
      avatarUrl: github.avatarUrl,
      bio: github.bio,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, existing.id));

  const vectorId = `${existing.id}-vector`;
  await db
    .insert(schema.skillVectors)
    .values({
      id: vectorId,
      userId: existing.id,
      vector: embedding,
      topSkills,
      githubScore,
      wakatimeScore,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.skillVectors.id,
      set: {
        vector: embedding,
        topSkills,
        githubScore,
        wakatimeScore,
        updatedAt: new Date(),
      },
    });

  return c.json(
    {
      refreshed: true,
      githubScore,
      wakatimeScore,
      topSkills,
    },
    200,
  );
};
