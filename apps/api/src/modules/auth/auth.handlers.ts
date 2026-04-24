import type { RouteHandler } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { createDb, schema } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import {
  githubCallbackRoute,
  githubOAuthRoute,
  wakatimeConnectRoute,
} from "./auth.routes";

type WakatimeSummary = {
  totalSeconds: number;
};

const buildGithubOAuthUrl = (origin: string, clientId: string) => {
  const redirectUri = `${origin}/auth/github/callback`;
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  return url.toString();
};

const fetchGithubToken = async (
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<string> => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange GitHub token");
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("GitHub access token missing");
  }

  return payload.access_token;
};

const fetchGithubProfile = async (accessToken: string) => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "commate-api",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub profile");
  }

  const payload = (await response.json()) as {
    id: number;
    login: string;
    avatar_url: string;
    bio: string | null;
  };

  return {
    id: String(payload.id),
    githubId: String(payload.id),
    username: payload.login,
    avatarUrl: payload.avatar_url,
    bio: payload.bio,
  };
};

const fetchWakatimeSummary = async (
  apiKey: string,
): Promise<WakatimeSummary> => {
  const endDate = new Date();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const summaryUrl = new URL(
    "https://wakatime.com/api/v1/users/current/summaries",
  );
  summaryUrl.searchParams.set("start", startDate.toISOString().slice(0, 10));
  summaryUrl.searchParams.set("end", endDate.toISOString().slice(0, 10));

  const response = await fetch(summaryUrl.toString(), {
    headers: {
      Authorization: `Basic ${btoa(`${apiKey}:`)}`,
    },
  });

  if (!response.ok) {
    return { totalSeconds: 0 };
  }

  const payload = (await response.json()) as {
    data?: Array<{ grand_total?: { total_seconds?: number } }>;
  };

  const totalSeconds = (payload.data ?? []).reduce((accumulator, item) => {
    return accumulator + (item.grand_total?.total_seconds ?? 0);
  }, 0);

  return { totalSeconds };
};

const isWakatimeEligible = (totalSeconds: number) => totalSeconds >= 10 * 3600;

export const githubOAuthHandler: RouteHandler<
  typeof githubOAuthRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const origin = new URL(c.req.url).origin;
  const redirectUrl = buildGithubOAuthUrl(origin, env.GITHUB_CLIENT_ID);

  return c.redirect(redirectUrl, 302);
};

export const githubCallbackHandler: RouteHandler<
  typeof githubCallbackRoute,
  AppEnv
> = async (c) => {
  try {
    const env = getValidatedEnv(c.env);
    const { code } = c.req.valid("query");
    const accessToken = await fetchGithubToken(
      code,
      env.GITHUB_CLIENT_ID,
      env.GITHUB_CLIENT_SECRET,
    );
    const githubProfile = await fetchGithubProfile(accessToken);

    const db = createDb(env);
    await db
      .insert(schema.users)
      .values({
        id: githubProfile.id,
        githubId: githubProfile.githubId,
        username: githubProfile.username,
        avatarUrl: githubProfile.avatarUrl,
        bio: githubProfile.bio,
      })
      .onConflictDoUpdate({
        target: schema.users.githubId,
        set: {
          username: githubProfile.username,
          avatarUrl: githubProfile.avatarUrl,
          bio: githubProfile.bio,
          updatedAt: new Date(),
        },
      });

    const token = await sign(
      {
        sub: githubProfile.id,
        username: githubProfile.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    return c.json(
      {
        token,
        user: {
          id: githubProfile.id,
          username: githubProfile.username,
          avatarUrl: githubProfile.avatarUrl,
        },
      },
      200,
    );
  } catch {
    return c.json({ message: "OAuth callback failed" }, 400);
  }
};

export const wakatimeConnectHandler: RouteHandler<
  typeof wakatimeConnectRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const db = createDb(env);
  const { username, apiKey } = c.req.valid("json");

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  const summary = await fetchWakatimeSummary(apiKey);
  const eligibleForScoring = isWakatimeEligible(summary.totalSeconds);

  await db
    .update(schema.users)
    .set({
      wakatimeConnected: true,
      wakatimeConnectedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  return c.json(
    {
      connected: true,
      eligibleForScoring,
      totalSeconds7d: summary.totalSeconds,
    },
    200,
  );
};
