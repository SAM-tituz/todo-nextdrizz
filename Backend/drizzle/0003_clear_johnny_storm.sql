ALTER TABLE "todolist" RENAME COLUMN "last_reminded_at" TO "timezone_offset";--> statement-breakpoint
ALTER TABLE "todolist" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;