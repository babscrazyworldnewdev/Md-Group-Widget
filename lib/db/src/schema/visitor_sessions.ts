import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visitorSessions = pgTable("visitor_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  ip: text("ip"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  timezone: text("timezone"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isp: text("isp"),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  os: text("os"),
  osVersion: text("os_version"),
  device: text("device"),
  screenWidth: text("screen_width"),
  screenHeight: text("screen_height"),
  language: text("language"),
  referrer: text("referrer"),
  pageUrl: text("page_url"),
  userAgent: text("user_agent"),
  extra: jsonb("extra"),
  visitedAt: timestamp("visited_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertVisitorSessionSchema = createInsertSchema(visitorSessions).omit({ id: true, visitedAt: true });
export type VisitorSession = typeof visitorSessions.$inferSelect;
export type InsertVisitorSession = z.infer<typeof insertVisitorSessionSchema>;
