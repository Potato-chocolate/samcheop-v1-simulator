import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  consultationReports,
  InsertConsultationReport,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }
  return db;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createConsultationReport(values: InsertConsultationReport) {
  const db = await requireDb();
  await db.insert(consultationReports).values(values);

  const result = await db
    .select()
    .from(consultationReports)
    .where(eq(consultationReports.shareSlug, values.shareSlug))
    .limit(1);

  return result[0];
}

export async function listConsultationReportsByOwner(ownerId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(consultationReports)
    .where(eq(consultationReports.ownerId, ownerId))
    .orderBy(desc(consultationReports.createdAt));
}

export async function getConsultationReportBySlug(shareSlug: string) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(consultationReports)
    .where(eq(consultationReports.shareSlug, shareSlug))
    .limit(1);

  return result[0];
}

export async function getConsultationReportById(id: number, ownerId: number) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(consultationReports)
    .where(and(eq(consultationReports.id, id), eq(consultationReports.ownerId, ownerId)))
    .limit(1);

  return result[0];
}

export async function updateConsultationReportFileInfo(
  id: number,
  ownerId: number,
  reportHtmlKey: string,
  reportHtmlUrl: string,
) {
  const db = await requireDb();
  await db
    .update(consultationReports)
    .set({ reportHtmlKey, reportHtmlUrl, updatedAt: new Date() })
    .where(and(eq(consultationReports.id, id), eq(consultationReports.ownerId, ownerId)));

  return getConsultationReportById(id, ownerId);
}

export async function deleteConsultationReport(id: number, ownerId: number) {
  const db = await requireDb();
  await db
    .delete(consultationReports)
    .where(and(eq(consultationReports.id, id), eq(consultationReports.ownerId, ownerId)));

  return { success: true } as const;
}
