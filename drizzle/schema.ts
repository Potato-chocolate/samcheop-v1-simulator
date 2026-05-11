import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const consultationReports = mysqlTable("consultationReports", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  shareSlug: varchar("shareSlug", { length: 32 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  candidateName: varchar("candidateName", { length: 120 }),
  memo: text("memo"),
  revenueInputsJson: text("revenueInputsJson").notNull(),
  costInputsJson: text("costInputsJson").notNull(),
  revenueSummaryJson: text("revenueSummaryJson").notNull(),
  openingSummaryJson: text("openingSummaryJson").notNull(),
  reportHtmlKey: varchar("reportHtmlKey", { length: 512 }),
  reportHtmlUrl: varchar("reportHtmlUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ConsultationReport = typeof consultationReports.$inferSelect;
export type InsertConsultationReport = typeof consultationReports.$inferInsert;
