import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  resolveFollowUpRequest,
  saveQuizSubmission,
  createFollowUpRequest,
  getFollowUpRequest,
  addToWaitlist,
  getAllQuizSubmissions,
  getAllFollowUpRequests,
  getAllWaitlist,
  getAdminStats,
  recordPageview,
  createPortalUser,
  getPortalUserByEmail,
  getPortalUserById,
  updatePortalUserLastLogin,
  getAllNPs,
  getAllPatients,
  getQuizSubmissionsByEmail,
  getQuizSubmissionsByPatientId,
  createTreatmentPlan,
  getTreatmentPlansByPatient,
  getTreatmentPlanById,
  updateTreatmentPlan,
  getActiveTreatmentPlans,
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsByNP,
  updateAppointment,
  getAllAppointments,
  createDocument,
  getDocumentsByPatient,
  getDocumentById,
  markDocumentReviewed,
  deleteDocument,
  createMessage,
  getMessagesBetweenUsers,
  getConversationsForUser,
  markMessagesAsRead,
  getUnreadCount,
  assignPatientToNP,
  getAssignedPatients,
  getAssignedNP,
  createClinicalNote,
  getClinicalNotes,
  updateClinicalNote,
  getNPAnalytics,
} from "../db";
import { invokeLLM } from "./llm";
import { notifyOwner } from "./notification";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import multer from "multer";

// ─── Admin Auth Middleware ─────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.MENOVA_ADMIN_PASSWORD || "menova2026";

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");
  if (token !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Invalid admin token" });
  }
  next();
}

// ─── Portal Auth Middleware ────────────────────────────────────────────────────
// Simple JWT-like token: base64 encoded JSON { id, email, role, exp }
function createPortalToken(user: { id: number; email: string; role: string }): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodePortalToken(token: string): { id: number; email: string; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.exp < Date.now()) return null;
    return { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

function portalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please log in to continue" });
  }
  const token = authHeader.replace("Bearer ", "");
  const user = decodePortalToken(token);
  if (!user) {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
  (req as any).portalUser = user;
  next();
}

function npOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).portalUser;
  if (!user || user.role !== "np") {
    return res.status(403).json({ error: "Access restricted to Nurse Practitioners" });
  }
  next();
}

function patientOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).portalUser;
  if (!user || user.role !== "patient") {
    return res.status(403).json({ error: "Access restricted to patients" });
  }
  next();
}

// ─── Multer for file uploads ──────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Accepted: PDF, JPG, PNG, WEBP, GIF, DOC, DOCX"));
    }
  },
});

// ─── Server Setup ─────────────────────────────────────────────────────────────

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback
  registerOAuthRoutes(app);

  // ═══════════════════════════════════════════════════════════════════════════
  // EXISTING REST API ROUTES (from previous build)
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. Quiz Submission
  app.post("/api/quiz/submit", async (req: Request, res: Response) => {
    try {
      const { name, email, score, maxScore, tier, answers, recommendation, source, utmSource, utmMedium, utmCampaign } = req.body;
      if (!name || !email || score === undefined || maxScore === undefined || !tier) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }
      await saveQuizSubmission({
        name, email,
        score: Number(score),
        maxScore: Number(maxScore),
        severityTier: tier,
        recommendation: recommendation || null,
        answers: answers ? JSON.stringify(answers) : null,
        source: source || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
      });
      try {
        await notifyOwner({
          title: `New Quiz Submission: ${name}`,
          content: `${name} (${email}) completed the symptom quiz.\nScore: ${score}/${maxScore} — ${tier}`,
        });
      } catch (e) { console.warn("[Notification] Failed:", e); }
      return res.json({ success: true });
    } catch (err) {
      console.error("[Quiz] Failed:", err);
      return res.status(500).json({ success: false, error: "Failed to save quiz submission" });
    }
  });

  // 2. Follow-Up Request
  app.post("/api/followup/request", async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email } = req.body;
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }
      const sessionId = nanoid(24);
      await createFollowUpRequest({ sessionId, firstName, lastName, email });
      try {
        await notifyOwner({
          title: `New Follow-Up Request: ${firstName} ${lastName}`,
          content: `${firstName} ${lastName} (${email}) requested a follow-up verification.\nSession ID: ${sessionId}`,
        });
      } catch (e) { console.warn("[Notification] Failed:", e); }
      return res.json({ success: true, sessionId });
    } catch (err) {
      console.error("[FollowUp] Failed:", err);
      return res.status(500).json({ success: false, error: "Failed to create follow-up request" });
    }
  });

  // 3. Follow-Up Status Check (polling)
  app.get("/api/followup/status/:sessionId", async (req: Request, res: Response) => {
    try {
      const request = await getFollowUpRequest(req.params.sessionId);
      if (!request) return res.status(404).json({ error: "Session not found" });
      return res.json({ status: request.status, qualified: request.qualified, resultMessage: request.resultMessage || null });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 4. Make.com Webhook Receiver
  app.post("/api/followup-result", async (req: Request, res: Response) => {
    try {
      const { sessionId, qualified } = req.body;
      if (!sessionId || qualified === undefined) {
        return res.status(400).json({ error: "Missing sessionId or qualified field" });
      }
      await resolveFollowUpRequest(sessionId, Boolean(qualified));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 5. Waitlist
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      const { name, email, interest } = req.body;
      if (!name || !email) return res.status(400).json({ success: false, error: "Name and email are required" });
      const result = await addToWaitlist({ name, email, interest: interest || null });
      if (result.alreadyExists) return res.json({ success: true, message: "You're already on the waitlist!" });
      try {
        await notifyOwner({ title: `New Waitlist Signup: ${name}`, content: `${name} (${email}) joined the waitlist.${interest ? ` Interest: ${interest}` : ""}` });
      } catch (e) { console.warn("[Notification] Failed:", e); }
      return res.json({ success: true, message: "You've been added to the waitlist!" });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to join waitlist" });
    }
  });

  // 6. AI Chat
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;
      if (!message) return res.status(400).json({ error: "Message is required" });

      const systemPrompt = `You are MeNova Health's AI assistant, specializing in menopause education and support for women in British Columbia, Canada.

IMPORTANT RULES:
- You provide general educational information about menopause, perimenopause, and Bioidentical Hormone Replacement Therapy (BHRT)
- You NEVER diagnose conditions or prescribe treatments
- You always recommend consulting with a licensed healthcare provider for medical decisions
- You are warm, empathetic, and supportive
- You keep answers concise (2-3 paragraphs max)
- When relevant, mention that MeNova Health offers virtual consultations with BC-licensed Nurse Practitioners
- If asked about pricing: Initial consult is $175 CAD, Monthly care bundle is $199/month
- If asked about booking: Direct them to book at cal.com/menova/30min
- You know about common menopause symptoms: hot flashes, night sweats, brain fog, sleep issues, mood changes, weight gain, low libido, vaginal dryness, fatigue, hair thinning
- You know BHRT uses plant-derived hormones molecularly identical to human hormones
- You know MeNova serves all of BC via telehealth

If someone asks something completely unrelated to women's health or menopause, politely redirect them.`;

      const msgs: Array<{ role: string; content: string }> = [{ role: "system", content: systemPrompt }];
      if (history && Array.isArray(history)) {
        for (const msg of history.slice(-10)) {
          if (msg.role && msg.content) msgs.push({ role: msg.role, content: msg.content });
        }
      }
      msgs.push({ role: "user", content: message });

      const result = await invokeLLM({ messages: msgs as any });
      const reply = typeof result.choices?.[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "I'm sorry, I couldn't generate a response right now. Please try again.";
      return res.json({ reply });
    } catch (err) {
      console.error("[Chat] AI chat error:", err);
      return res.json({ reply: "I'm having trouble connecting right now. Please try again in a moment." });
    }
  });

  // 7. Admin Login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) return res.json({ success: true, token: ADMIN_PASSWORD });
    return res.status(401).json({ success: false, error: "Invalid password" });
  });

  // 8. Admin Stats
  app.get("/api/admin/stats", adminAuth, async (_req: Request, res: Response) => {
    try {
      const stats = await getAdminStats();
      return res.json(stats);
    } catch (err) {
      return res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // 9. Admin Quiz Submissions
  app.get("/api/admin/quiz-submissions", adminAuth, async (_req: Request, res: Response) => {
    try { return res.json(await getAllQuizSubmissions()); }
    catch (err) { return res.status(500).json({ error: "Failed to get quiz submissions" }); }
  });

  // 10. Admin Follow-Up Requests
  app.get("/api/admin/followup-requests", adminAuth, async (_req: Request, res: Response) => {
    try { return res.json(await getAllFollowUpRequests()); }
    catch (err) { return res.status(500).json({ error: "Failed to get follow-up requests" }); }
  });

  // 11. Admin Waitlist
  app.get("/api/admin/waitlist", adminAuth, async (_req: Request, res: Response) => {
    try { return res.json(await getAllWaitlist()); }
    catch (err) { return res.status(500).json({ error: "Failed to get waitlist" }); }
  });

  // 12. Admin CSV Export
  app.get("/api/admin/export/:type", adminAuth, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      let data: Record<string, any>[] = [];
      let filename = "";
      switch (type) {
        case "quiz": data = await getAllQuizSubmissions(); filename = "quiz-submissions.csv"; break;
        case "followup": data = await getAllFollowUpRequests(); filename = "followup-requests.csv"; break;
        case "waitlist": data = await getAllWaitlist(); filename = "waitlist.csv"; break;
        default: return res.status(400).json({ error: "Invalid export type" });
      }
      if (data.length === 0) return res.status(404).json({ error: "No data to export" });
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];
      for (const row of data) {
        const values = headers.map(h => {
          const val = (row as any)[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`;
          return str;
        });
        csvRows.push(values.join(","));
      }
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(csvRows.join("\n"));
    } catch (err) {
      return res.status(500).json({ error: "Failed to export data" });
    }
  });

  // 13. Analytics Pageview
  app.post("/api/analytics/pageview", async (req: Request, res: Response) => {
    try {
      const { page, referrer, utmSource, utmMedium, utmCampaign } = req.body;
      if (!page) return res.status(400).json({ error: "Page is required" });
      await recordPageview({ page, referrer: referrer || null, utmSource: utmSource || null, utmMedium: utmMedium || null, utmCampaign: utmCampaign || null });
      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: true });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PORTAL AUTH ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // Portal Registration
  app.post("/api/portal/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, password, first name, and last name are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      const validRole = role === "np" ? "np" : "patient";
      const existing = await getPortalUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await createPortalUser({ email, passwordHash, firstName, lastName, phone: phone || null, role: validRole });
      const user = await getPortalUserByEmail(email);
      if (!user) return res.status(500).json({ error: "Failed to create account" });
      await updatePortalUserLastLogin(user.id);
      const token = createPortalToken({ id: user.id, email: user.email, role: user.role });
      return res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      });
    } catch (err) {
      console.error("[Portal] Registration failed:", err);
      return res.status(500).json({ error: "Registration failed. Please try again." });
    }
  });

  // Portal Login
  app.post("/api/portal/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await getPortalUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (!user.isActive) {
        return res.status(403).json({ error: "Your account has been deactivated. Please contact support." });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      await updatePortalUserLastLogin(user.id);
      const token = createPortalToken({ id: user.id, email: user.email, role: user.role });
      return res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      });
    } catch (err) {
      console.error("[Portal] Login failed:", err);
      return res.status(500).json({ error: "Login failed. Please try again." });
    }
  });

  // Portal Get Current User
  app.get("/api/portal/me", portalAuth, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const user = await getPortalUserById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json({
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        phone: user.phone, role: user.role, createdAt: user.createdAt,
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PATIENT PORTAL ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // Patient Dashboard Stats
  app.get("/api/patient/dashboard", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { id, email } = (req as any).portalUser;
      const quizHistory = await getQuizSubmissionsByEmail(email);
      const treatmentPlansList = await getTreatmentPlansByPatient(id);
      const appointmentsList = await getAppointmentsByPatient(id);
      const documentsList = await getDocumentsByPatient(id);
      const assignedNP = await getAssignedNP(id);
      const unread = await getUnreadCount(id);

      return res.json({
        quizHistory,
        treatmentPlans: treatmentPlansList,
        appointments: appointmentsList,
        documents: documentsList,
        assignedNP: assignedNP ? { id: assignedNP.id, firstName: assignedNP.firstName, lastName: assignedNP.lastName, email: assignedNP.email } : null,
        unreadMessages: unread,
      });
    } catch (err) {
      console.error("[Patient] Dashboard failed:", err);
      return res.status(500).json({ error: "Failed to load dashboard" });
    }
  });

  // Patient Quiz History
  app.get("/api/patient/quiz-history", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { email } = (req as any).portalUser;
      return res.json(await getQuizSubmissionsByEmail(email));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load quiz history" });
    }
  });

  // Patient Treatment Plans
  app.get("/api/patient/treatment-plans", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      return res.json(await getTreatmentPlansByPatient(id));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load treatment plans" });
    }
  });

  // Patient Appointments
  app.get("/api/patient/appointments", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      return res.json(await getAppointmentsByPatient(id));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load appointments" });
    }
  });

  // Patient Documents
  app.get("/api/patient/documents", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      return res.json(await getDocumentsByPatient(id));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load documents" });
    }
  });

  // Patient Upload Document
  app.post("/api/patient/documents/upload", portalAuth, patientOnly, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const category = req.body.category || "other";
      const notes = req.body.notes || null;
      const suffix = nanoid(8);
      const fileKey = `patient-docs/${id}/${suffix}-${file.originalname}`;

      const { url } = await storagePut(fileKey, file.buffer, file.mimetype);

      await createDocument({
        patientId: id,
        uploadedBy: id,
        fileName: file.originalname,
        fileKey,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.mimetype,
        category: category as any,
        notes,
      });

      return res.json({ success: true, message: "Document uploaded successfully" });
    } catch (err) {
      console.error("[Patient] Document upload failed:", err);
      return res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Patient Delete Document
  app.delete("/api/patient/documents/:id", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).portalUser.id;
      const docId = parseInt(req.params.id);
      const doc = await getDocumentById(docId);
      if (!doc || doc.patientId !== userId) return res.status(404).json({ error: "Document not found" });
      await deleteDocument(docId);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Patient Messages — Get Conversations
  app.get("/api/patient/messages/conversations", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const conversations = await getConversationsForUser(id);
      return res.json(conversations.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, role: c.role })));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load conversations" });
    }
  });

  // Patient Messages — Get Messages with a specific user
  app.get("/api/patient/messages/:partnerId", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const partnerId = parseInt(req.params.partnerId);
      await markMessagesAsRead(partnerId, id);
      const msgs = await getMessagesBetweenUsers(id, partnerId);
      return res.json(msgs);
    } catch (err) {
      return res.status(500).json({ error: "Failed to load messages" });
    }
  });

  // Patient Messages — Send Message
  app.post("/api/patient/messages/send", portalAuth, patientOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const { receiverId, content } = req.body;
      if (!receiverId || !content) return res.status(400).json({ error: "Receiver and content are required" });
      await createMessage({ senderId: id, receiverId, senderRole: "patient", content });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NP PORTAL ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // NP Dashboard
  app.get("/api/np/dashboard", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const analytics = await getNPAnalytics(id);
      const patients = await getAssignedPatients(id);
      const appointmentsList = await getAppointmentsByNP(id);
      const unread = await getUnreadCount(id);

      // Get active treatment plans count
      const allPlans: any[] = [];
      const allDocs: any[] = [];
      for (const p of patients) {
        const plans = await getTreatmentPlansByPatient(p.id);
        allPlans.push(...plans.filter((pl: any) => pl.status === "active"));
        const docs = await getDocumentsByPatient(p.id);
        allDocs.push(...docs);
      }
      // Filter appointments
      const now = new Date();
      const upcoming = appointmentsList.filter((a: any) => new Date(a.scheduledAt) > now);
      const completed = appointmentsList.filter((a: any) => a.status === "completed");
      const pendingDocs = allDocs.filter((d: any) => !d.isReviewed);
      return res.json({
        analytics,
        patients: patients.map(p => ({
          id: p.id, firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, createdAt: p.createdAt,
        })),
        activePlans: allPlans.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        pendingDocuments: pendingDocs.length,
        appointments: appointmentsList,
        unreadMessages: unread,
      });
    } catch (err) {
      console.error("[NP] Dashboard failed:", err);
      return res.status(500).json({ error: "Failed to load dashboard" });
    }
  });

  // NP — Get All Patients (for assignment)
  app.get("/api/np/all-patients", portalAuth, npOnly, async (_req: Request, res: Response) => {
    try {
      const patients = await getAllPatients();
      return res.json(patients.map(p => ({
        id: p.id, firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, createdAt: p.createdAt,
      })));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load patients" });
    }
  });

  // NP — Assign Patient
  app.post("/api/np/assign-patient", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const { patientId } = req.body;
      if (!patientId) return res.status(400).json({ error: "Patient ID is required" });
      await assignPatientToNP(patientId, id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to assign patient" });
    }
  });

  // NP — Get Patient Profile
  app.get("/api/np/patient/:patientId", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const patient = await getPortalUserById(patientId);
      if (!patient || patient.role !== "patient") return res.status(404).json({ error: "Patient not found" });

      const quizHistory = await getQuizSubmissionsByEmail(patient.email);
      const plans = await getTreatmentPlansByPatient(patientId);
      const appts = await getAppointmentsByPatient(patientId);
      const docs = await getDocumentsByPatient(patientId);

      const notes = await getClinicalNotes(patientId, (req as any).portalUser.id);
      return res.json({
        patient: { id: patient.id, firstName: patient.firstName, lastName: patient.lastName, email: patient.email, phone: patient.phone, createdAt: patient.createdAt },
        quizHistory,
        treatmentPlans: plans,
        appointments: appts,
        documents: docs,
        clinicalNotes: notes,
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to load patient profile" });
    }
  });

  // NP — List Treatment Plans for NP
  app.get("/api/np/treatment-plans", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const patients = await getAssignedPatients(npId);
      const allPlans: any[] = [];
      for (const p of patients) {
        const plans = await getTreatmentPlansByPatient(p.id);
        allPlans.push(...plans);
      }
      return res.json(allPlans);
    } catch (err) {
      return res.status(500).json({ error: "Failed to load treatment plans" });
    }
  });

  // NP — Create Treatment Plan
  app.post("/api/np/treatment-plans", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const { patientId, hormoneType, dosage, frequency, duration, instructions, startDate, endDate, followUpDate, notes } = req.body;
      if (!patientId || !hormoneType || !dosage || !frequency || !duration || !startDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await createTreatmentPlan({
        patientId, npId, hormoneType, dosage, frequency, duration,
        instructions: instructions || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
      });
      return res.json({ success: true });
    } catch (err) {
      console.error("[NP] Create treatment plan failed:", err);
      return res.status(500).json({ error: "Failed to create treatment plan" });
    }
  });

  // NP — Update Treatment Plan
  app.put("/api/np/treatment-plans/:id", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await getTreatmentPlanById(planId);
      if (!plan) return res.status(404).json({ error: "Treatment plan not found" });
      const updates: any = {};
      const fields = ["hormoneType", "dosage", "frequency", "duration", "instructions", "status", "notes"];
      for (const f of fields) {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      }
      if (req.body.endDate) updates.endDate = new Date(req.body.endDate);
      if (req.body.followUpDate) updates.followUpDate = new Date(req.body.followUpDate);
      await updateTreatmentPlan(planId, updates);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update treatment plan" });
    }
  });

  // NP — Update Treatment Plan Status (PATCH)
  app.patch("/api/np/treatment-plans/:id/status", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "Status is required" });
      await updateTreatmentPlan(planId, { status });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update treatment plan status" });
    }
  });

  // NP — Update Appointment Status (PATCH)
  app.patch("/api/np/appointments/:id/status", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const apptId = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "Status is required" });
      await updateAppointment(apptId, { status });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update appointment status" });
    }
  });

  // NP — List Appointments for NP
  app.get("/api/np/appointments", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const appts = await getAppointmentsByNP(npId);
      return res.json(appts);
    } catch (err) {
      return res.status(500).json({ error: "Failed to load appointments" });
    }
  });

  // NP — Create Appointment
  app.post("/api/np/appointments", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const { patientId, title, description, scheduledAt, duration, meetingLink } = req.body;
      if (!patientId || !title || !scheduledAt) {
        return res.status(400).json({ error: "Patient, title, and scheduled time are required" });
      }
      await createAppointment({
        patientId, npId, title,
        description: description || null,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        meetingLink: meetingLink || null,
      });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  // NP — Update Appointment
  app.put("/api/np/appointments/:id", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const apptId = parseInt(req.params.id);
      const updates: any = {};
      if (req.body.status) updates.status = req.body.status;
      if (req.body.npNotes) updates.npNotes = req.body.npNotes;
      if (req.body.meetingLink) updates.meetingLink = req.body.meetingLink;
      if (req.body.scheduledAt) updates.scheduledAt = new Date(req.body.scheduledAt);
      await updateAppointment(apptId, updates);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  // NP — List All Patient Documents
  app.get("/api/np/documents", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const patients = await getAssignedPatients(npId);
      const allDocs: any[] = [];
      for (const p of patients) {
        const docs = await getDocumentsByPatient(p.id);
        allDocs.push(...docs.map((d: any) => ({ ...d, patientFirstName: p.firstName, patientLastName: p.lastName })));
      }
      allDocs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json(allDocs);
    } catch (err) {
      return res.status(500).json({ error: "Failed to load documents" });
    }
  });

  // NP — Mark Document as Reviewed (PUT and POST)
  app.put("/api/np/documents/:id/review", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const docId = parseInt(req.params.id);
      await markDocumentReviewed(docId, npId);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to mark document as reviewed" });
    }
  });

  app.post("/api/np/documents/:id/review", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const docId = parseInt(req.params.id);
      await markDocumentReviewed(docId, npId);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to mark document as reviewed" });
    }
  });

  // NP — Clinical Notes
  app.get("/api/np/clinical-notes/:patientId", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const patientId = parseInt(req.params.patientId);
      return res.json(await getClinicalNotes(patientId, npId));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load clinical notes" });
    }
  });

  app.post("/api/np/clinical-notes", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const npId = (req as any).portalUser.id;
      const { patientId, content } = req.body;
      if (!patientId || !content) return res.status(400).json({ error: "Patient ID and content are required" });
      await createClinicalNote({ patientId, npId, content });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to create clinical note" });
    }
  });

  app.put("/api/np/clinical-notes/:id", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.id);
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content is required" });
      await updateClinicalNote(noteId, content);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update clinical note" });
    }
  });

  // NP — Messages — Get Conversations
  app.get("/api/np/messages/conversations", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const conversations = await getConversationsForUser(id);
      return res.json(conversations.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, role: c.role })));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load conversations" });
    }
  });

  // NP — Messages — Get Messages with a specific user
  app.get("/api/np/messages/:partnerId", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const partnerId = parseInt(req.params.partnerId);
      await markMessagesAsRead(partnerId, id);
      return res.json(await getMessagesBetweenUsers(id, partnerId));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load messages" });
    }
  });

  // NP — Messages — Send Message
  app.post("/api/np/messages/send", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      const { receiverId, content } = req.body;
      if (!receiverId || !content) return res.status(400).json({ error: "Receiver and content are required" });
      await createMessage({ senderId: id, receiverId, senderRole: "np", content });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to send message" });
    }
  });

  // NP — Analytics
  app.get("/api/np/analytics", portalAuth, npOnly, async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).portalUser;
      return res.json(await getNPAnalytics(id));
    } catch (err) {
      return res.status(500).json({ error: "Failed to load analytics" });
    }
  });

  // ─── tRPC API ─────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // ─── Static / Vite ────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
