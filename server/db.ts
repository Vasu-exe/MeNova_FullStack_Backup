import { eq, sql, desc, and, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertQuizSubmission,
  InsertFollowUpRequest,
  InsertWaitlist,
  InsertPageview,
  InsertPortalUser,
  InsertTreatmentPlan,
  InsertAppointment,
  InsertDocument,
  InsertMessage,
  InsertPatientAssignment,
  InsertClinicalNote,
  followUpRequests,
  quizSubmissions,
  users,
  waitlist,
  pageviews,
  portalUsers,
  treatmentPlans,
  appointments,
  documents,
  messages,
  patientAssignments,
  clinicalNotes,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// ─── Manus OAuth Users ───────────────────────────────────────────────────────

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
    const values: InsertUser = { openId: user.openId };
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
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Portal Users (Patients & NPs) ──────────────────────────────────────────

export async function createPortalUser(data: InsertPortalUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(portalUsers).values(data);
}

export async function getPortalUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(portalUsers).where(eq(portalUsers.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPortalUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(portalUsers).where(eq(portalUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePortalUserLastLogin(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(portalUsers).set({ lastLogin: new Date() }).where(eq(portalUsers.id, id));
}

export async function getAllNPs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portalUsers).where(eq(portalUsers.role, "np")).orderBy(portalUsers.firstName);
}

export async function getAllPatients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portalUsers).where(eq(portalUsers.role, "patient")).orderBy(desc(portalUsers.createdAt));
}

// ─── Quiz Submissions ────────────────────────────────────────────────────────

export async function saveQuizSubmission(data: InsertQuizSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(quizSubmissions).values(data);
}

export async function getAllQuizSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizSubmissions).orderBy(desc(quizSubmissions.createdAt));
}

export async function getQuizSubmissionsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizSubmissions).where(eq(quizSubmissions.email, email)).orderBy(desc(quizSubmissions.createdAt));
}

export async function getQuizSubmissionsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizSubmissions).where(eq(quizSubmissions.portalUserId, patientId)).orderBy(desc(quizSubmissions.createdAt));
}

// ─── Follow-Up Requests ──────────────────────────────────────────────────────

export async function createFollowUpRequest(data: InsertFollowUpRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(followUpRequests).values(data);
}

export async function getFollowUpRequest(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(followUpRequests).where(eq(followUpRequests.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function resolveFollowUpRequest(sessionId: string, qualified: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const resultMessage = qualified
    ? "You are eligible for a follow-up consultation. Please book your appointment below."
    : "Based on our review, a follow-up consultation is not recommended at this time. Please consult your primary care provider.";
  await db.update(followUpRequests).set({
    qualified,
    status: qualified ? "qualified" : "not_qualified",
    resultMessage,
    resolvedAt: new Date(),
  }).where(eq(followUpRequests.sessionId, sessionId));
}

export async function getAllFollowUpRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(followUpRequests).orderBy(desc(followUpRequests.createdAt));
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

export async function addToWaitlist(data: InsertWaitlist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(waitlist).where(eq(waitlist.email, data.email)).limit(1);
  if (existing.length > 0) return { alreadyExists: true };
  await db.insert(waitlist).values(data);
  return { alreadyExists: false };
}

export async function getAllWaitlist() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
}

// ─── Pageview Analytics ──────────────────────────────────────────────────────

export async function recordPageview(data: InsertPageview) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(pageviews).values(data);
  } catch (err) {
    console.warn("[Analytics] Failed to record pageview:", err);
  }
}

// ─── Admin Stats ─────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalQuiz: 0, totalFollowUp: 0, totalWaitlist: 0, qualifiedCount: 0, pendingCount: 0, totalPatients: 0, totalNPs: 0 };

  const [quizCount] = await db.select({ count: sql<number>`count(*)` }).from(quizSubmissions);
  const [followUpCount] = await db.select({ count: sql<number>`count(*)` }).from(followUpRequests);
  const [waitlistCount] = await db.select({ count: sql<number>`count(*)` }).from(waitlist);
  const [qualifiedCount] = await db.select({ count: sql<number>`count(*)` }).from(followUpRequests).where(eq(followUpRequests.status, "qualified"));
  const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(followUpRequests).where(eq(followUpRequests.status, "pending"));
  const [patientCount] = await db.select({ count: sql<number>`count(*)` }).from(portalUsers).where(eq(portalUsers.role, "patient"));
  const [npCount] = await db.select({ count: sql<number>`count(*)` }).from(portalUsers).where(eq(portalUsers.role, "np"));

  return {
    totalQuiz: Number(quizCount?.count ?? 0),
    totalFollowUp: Number(followUpCount?.count ?? 0),
    totalWaitlist: Number(waitlistCount?.count ?? 0),
    qualifiedCount: Number(qualifiedCount?.count ?? 0),
    pendingCount: Number(pendingCount?.count ?? 0),
    totalPatients: Number(patientCount?.count ?? 0),
    totalNPs: Number(npCount?.count ?? 0),
  };
}

// ─── Treatment Plans ─────────────────────────────────────────────────────────

export async function createTreatmentPlan(data: InsertTreatmentPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(treatmentPlans).values(data);
}

export async function getTreatmentPlansByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(treatmentPlans).where(eq(treatmentPlans.patientId, patientId)).orderBy(desc(treatmentPlans.createdAt));
}

export async function getTreatmentPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTreatmentPlan(id: number, data: Partial<InsertTreatmentPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(treatmentPlans).set(data).where(eq(treatmentPlans.id, id));
}

export async function getActiveTreatmentPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(treatmentPlans).where(eq(treatmentPlans.status, "active")).orderBy(desc(treatmentPlans.createdAt));
}

// ─── Appointments ────────────────────────────────────────────────────────────

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appointments).values(data);
}

export async function getAppointmentsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.patientId, patientId)).orderBy(desc(appointments.scheduledAt));
}

export async function getAppointmentsByNP(npId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.npId, npId)).orderBy(desc(appointments.scheduledAt));
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(appointments).set(data).where(eq(appointments.id, id));
}

export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).orderBy(desc(appointments.scheduledAt));
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(documents).values(data);
}

export async function getDocumentsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.patientId, patientId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markDocumentReviewed(id: number, reviewedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documents).set({ reviewed: true, reviewedBy, reviewedAt: new Date() }).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(messages).values(data);
}

export async function getMessagesBetweenUsers(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(
    or(
      and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
      and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
    )
  ).orderBy(messages.createdAt);
}

export async function getConversationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Get unique conversation partners
  const sent = await db.select({ partnerId: messages.receiverId }).from(messages).where(eq(messages.senderId, userId));
  const received = await db.select({ partnerId: messages.senderId }).from(messages).where(eq(messages.receiverId, userId));
  const partnerIds = Array.from(new Set([...sent.map(s => s.partnerId), ...received.map(r => r.partnerId)]));
  if (partnerIds.length === 0) return [];
  const partners = await db.select().from(portalUsers).where(inArray(portalUsers.id, partnerIds));
  return partners;
}

export async function markMessagesAsRead(senderId: number, receiverId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true }).where(
    and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId), eq(messages.isRead, false))
  );
}

export async function getUnreadCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(messages).where(
    and(eq(messages.receiverId, userId), eq(messages.isRead, false))
  );
  return Number(result?.count ?? 0);
}

// ─── Patient Assignments ─────────────────────────────────────────────────────

export async function assignPatientToNP(patientId: number, npId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Deactivate existing assignments for this patient
  await db.update(patientAssignments).set({ isActive: false }).where(eq(patientAssignments.patientId, patientId));
  await db.insert(patientAssignments).values({ patientId, npId });
}

export async function getAssignedPatients(npId: number) {
  const db = await getDb();
  if (!db) return [];
  const activeAssignments = await db.select().from(patientAssignments).where(
    and(eq(patientAssignments.npId, npId), eq(patientAssignments.isActive, true))
  );
  if (activeAssignments.length === 0) return [];
  const patientIds = activeAssignments.map(a => a.patientId);
  return db.select().from(portalUsers).where(inArray(portalUsers.id, patientIds));
}

export async function getAssignedNP(patientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patientAssignments).where(
    and(eq(patientAssignments.patientId, patientId), eq(patientAssignments.isActive, true))
  ).limit(1);
  if (result.length === 0) return undefined;
  return getPortalUserById(result[0].npId);
}

// ─── Clinical Notes ──────────────────────────────────────────────────────────

export async function createClinicalNote(data: InsertClinicalNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clinicalNotes).values(data);
}

export async function getClinicalNotes(patientId: number, npId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clinicalNotes).where(
    and(eq(clinicalNotes.patientId, patientId), eq(clinicalNotes.npId, npId))
  ).orderBy(desc(clinicalNotes.createdAt));
}

export async function updateClinicalNote(id: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clinicalNotes).set({ content }).where(eq(clinicalNotes.id, id));
}

// ─── NP Analytics ────────────────────────────────────────────────────────────

export async function getNPAnalytics(npId: number) {
  const db = await getDb();
  if (!db) return { totalPatients: 0, activeTreatments: 0, completedTreatments: 0, upcomingAppointments: 0 };

  const assignedPatients = await getAssignedPatients(npId);
  const patientIds = assignedPatients.map(p => p.id);

  let activeTreatments = 0;
  let completedTreatments = 0;
  let upcomingAppointments = 0;

  if (patientIds.length > 0) {
    const [active] = await db.select({ count: sql<number>`count(*)` }).from(treatmentPlans).where(
      and(eq(treatmentPlans.npId, npId), eq(treatmentPlans.status, "active"))
    );
    const [completed] = await db.select({ count: sql<number>`count(*)` }).from(treatmentPlans).where(
      and(eq(treatmentPlans.npId, npId), eq(treatmentPlans.status, "completed"))
    );
    const [upcoming] = await db.select({ count: sql<number>`count(*)` }).from(appointments).where(
      and(eq(appointments.npId, npId), eq(appointments.status, "scheduled"))
    );
    activeTreatments = Number(active?.count ?? 0);
    completedTreatments = Number(completed?.count ?? 0);
    upcomingAppointments = Number(upcoming?.count ?? 0);
  }

  return {
    totalPatients: assignedPatients.length,
    activeTreatments,
    completedTreatments,
    upcomingAppointments,
  };
}
