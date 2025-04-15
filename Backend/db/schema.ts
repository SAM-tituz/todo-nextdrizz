// Updated schema (db/schema.js)
import {
  boolean,
  integer,
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const todolist = pgTable("todolist", {
  id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
  todo: varchar("todo", { length: 255 }).notNull(),
  todo_completed: boolean("todo_completed").default(false),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date",}).notNull(),
  duration_hours: integer("duration_hours"),
  last_reminded_at: timestamp("last_reminded_at", {
    withTimezone: true,
    mode: "date",
  }),
});
