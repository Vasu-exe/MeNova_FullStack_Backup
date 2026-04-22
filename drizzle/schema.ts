import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing Manus OAuth auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Portal users — patients and NPs who log in with email + password.
 * Separate from the Manus OAuth users table.
 */
export const portalUsers = mysqlTable("portal_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 512 }).notNull(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  role: mysqlEnum("role", ["patient", "np"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortalUser = typeof portalUsers.$inferSelect;
export type InsertPortalUser = typeof portalUsers.$inferInsert;

/**
 * Quiz submissions — stores every symptom assessment completed on the site.
 */
export const quizSubmissions = mysqlTable("quiz_submissions", {
  id: int("id").autoincrement().primaryKey(),
  portalUserId: int("portalUserId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  score: int("score").notNull(),
  maxScore: int("maxScore").notNull(),
  severityTier: varchar("severityTier", { length: 64 }).notNull(),
  recommendation: text("recommendation"),
  answers: text("answers"),
  source: varchar("source", { length: 255 }),
  utmSource: varchar("utmSource", { length: 255 }),
  utmMedium: varchar("utmMedium", { length: 255 }),
  utmCampaign: varchar("utmCampaign", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizSubmission = typeof quizSubmissions.$inferSelect;
export type InsertQuizSubmission = typeof quizSubmissions.$inferInsert;

/**
 * Follow-up verification requests — tracks who requested a follow-up and the result.
 */
export const followUpRequests = mysqlTable("follow_up_requests", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  qualified: boolean("qualified"),
  status: mysqlEnum("status", ["pending", "qualified", "not_qualified"]).default("pending").notNull(),
  resultMessage: text("resultMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type FollowUpRequest = typeof followUpRequests.$inferSelect;
export type InsertFollowUpRequest = typeof followUpRequests.$inferInsert;

/**
 * Waitlist — people who want to be notified when slots open.
 */
export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 32 }),
  city: varchar("city", { length: 128 }),
  interest: varchar("interest", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;

/**
 * Pageview analytics — tracks page visits and referral sources.
 */
export const pageviews = mysqlTable("pageviews", {
  id: int("id").autoincrement().primaryKey(),
  page: varchar("page", { length: 512 }).notNull(),
  referrer: varchar("referrer", { length: 512 }),
  utmSource: varchar("utmSource", { length: 255 }),
  utmMedium: varchar("utmMedium", { length: 255 }),
  utmCampaign: varchar("utmCampaign", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Pageview = typeof pageviews.$inferSelect;
export type InsertPageview = typeof pageviews.$inferInsert;

// ─── Portal-Specific Tables ──────────────────────────────────────────────────

/**
 * Treatment plans — created by NPs for patients.
 */
export const treatmentPlans = mysqlTable("treatment_plans", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  npId: int("npId").notNull(),
  hormoneType: varchar("hormoneType", { length: 128 }).notNull(),
  dosage: varchar("dosage", { length: 128 }).notNull(),
  frequency: varchar("frequency", { length: 128 }).notNull(),
  duration: varchar("duration", { length: 128 }).notNull(),
  instructions: text("instructions"),
  status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  followUpDate: timestamp("followUpDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InsertTreatmentPlan = typeof treatmentPlans.$inferInsert;

/**
 * Appointments — scheduled between patients and NPs.
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  npId: int("npId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration").default(30).notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  meetingLink: varchar("meetingLink", { length: 512 }),
  npNotes: text("npNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Documents — uploaded by patients, viewable by NPs.
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  fileName: varchar("fileName", { length: 512 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  category: mysqlEnum("category", ["lab_results", "medical_records", "prescription", "insurance", "id_document", "symptom_diary", "other"]).default("other").notNull(),
  reviewed: boolean("reviewed").default(false).notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Messages — between patients and NPs/clinic.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  senderRole: mysqlEnum("senderRole", ["patient", "np"]).notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Patient-NP assignments — which NP is assigned to which patient.
 */
export const patientAssignments = mysqlTable("patient_assignments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  npId: int("npId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export type PatientAssignment = typeof patientAssignments.$inferSelect;
export type InsertPatientAssignment = typeof patientAssignments.$inferInsert;

/**
 * Clinical notes — private notes by NPs about patients.
 */
export const clinicalNotes = mysqlTable("clinical_notes", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  npId: int("npId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClinicalNote = typeof clinicalNotes.$inferSelect;
export type InsertClinicalNote = typeof clinicalNotes.$inferInsert;
