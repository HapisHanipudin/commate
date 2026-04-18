import { Hono } from "hono";
import { cors } from "hono/cors";

export type Env = {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  WAKATIME_CLIENT_ID: string;
  WAKATIME_CLIENT_SECRET: string;
  NEON_DATABASE_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (c) => c.json({ status: "ok", service: "commate-api" }));

// Routes akan ditambah di sprint selanjutnya:
// - /auth/github
// - /auth/github/callback
// - /auth/wakatime/connect
// - /match
// - /profile/:username

export default app;
