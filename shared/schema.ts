import { pgTable, text, serial, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  queryText: text("query_text").notNull(),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hits = pgTable("hits", {
  id: serial("id").primaryKey(),
  queryId: integer("query_id").references(() => queries.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  rank: integer("rank").notNull(),
});

export const insertQuerySchema = createInsertSchema(queries).omit({ id: true, createdAt: true });
export const insertHitSchema = createInsertSchema(hits).omit({ id: true });

export type Query = typeof queries.$inferSelect;
export type Hit = typeof hits.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type InsertHit = z.infer<typeof insertHitSchema>;
