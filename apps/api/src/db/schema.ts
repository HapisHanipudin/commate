import {
  boolean,
  pgTable,
  real,
  text,
  timestamp,
  vector,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  username: text("username").notNull().unique(),
  avatarUrl: text("avatar_url").notNull(),
  bio: text("bio"),
  wakatimeConnected: boolean("wakatime_connected").notNull().default(false),
  wakatimeConnectedAt: timestamp("wakatime_connected_at", {
    withTimezone: true,
  }),
  apprenticeMode: boolean("apprentice_mode").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const skillVectors = pgTable(
  "skill_vectors",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    embedding: vector("embedding", { dimensions: 768 }).notNull(), // ← native vector type
    topSkills: text("top_skills").array().notNull().default([]),
    githubScore: real("github_score").notNull(),
    wakatimeScore: real("wakatime_score"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // IVFFlat index untuk cosine similarity
    index("embedding_cosine_idx").using(
      "ivfflat",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SkillVector = typeof skillVectors.$inferSelect;
export type NewSkillVector = typeof skillVectors.$inferInsert;
