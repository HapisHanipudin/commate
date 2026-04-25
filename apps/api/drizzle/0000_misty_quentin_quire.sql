CREATE TABLE "skill_vectors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vector" jsonb NOT NULL,
	"top_skills" text[] DEFAULT '{}' NOT NULL,
	"github_score" real NOT NULL,
	"wakatime_score" real,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"github_id" text NOT NULL,
	"username" text NOT NULL,
	"avatar_url" text NOT NULL,
	"bio" text,
	"wakatime_connected" boolean DEFAULT false NOT NULL,
	"wakatime_connected_at" timestamp with time zone,
	"apprentice_mode" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "skill_vectors" ADD CONSTRAINT "skill_vectors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;