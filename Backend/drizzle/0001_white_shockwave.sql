ALTER TABLE "todolist" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "todolist" ADD COLUMN "duration_days" integer;