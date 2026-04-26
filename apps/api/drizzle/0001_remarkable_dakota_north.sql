ALTER TABLE "skill_vectors" ADD COLUMN "embedding" vector(768) NOT NULL;--> statement-breakpoint
CREATE INDEX "embedding_cosine_idx" ON "skill_vectors" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "skill_vectors" DROP COLUMN "vector";