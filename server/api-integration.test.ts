import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import request from "supertest";
import { nanoid } from "nanoid";

/**
 * Integration tests for MeNova REST API endpoints.
 * Creates a real Express app with mocked DB layer and tests actual HTTP routes.
 */

// ─── Mock DB Layer ──────────────────────────────────────────────────────────

const mockDb = {
  quizSubmissions: [] as any[],
  followUpRequests: [] as any[],
  waitlistEntries: [] as any[],
  pageviews: [] as any[],
};

const mockSaveQuizSubmission = vi.fn(async (data: any) => {
  mockDb.quizSubmissions.push({ id: mockDb.quizSubmissions.length + 1, ...data, createdAt: new Date() });
});

const mockCreateFollowUpRequest = vi.fn(async (data: any) => {
  mockDb.followUpRequests.push({
    id: mockDb.followUpRequests.length + 1,
    ...data,
    status: "pending",
    qualified: null,
    resultMessage: null,
    resolvedAt: null,
    createdAt: new Date(),
  });
});

const mockGetFollowUpRequest = vi.fn(async (sessionId: string) => {
  return mockDb.followUpRequests.find(r => r.sessionId === sessionId) || undefined;
});

const mockResolveFollowUpRequest = vi.fn(async (sessionId: string, qualified: boolean) => {
  const req = mockDb.followUpRequests.find(r => r.sessionId === sessionId);
  if (req) {
    req.qualified = qualified;
    req.status = qualified ? "qualified" : "not_qualified";
    req.resultMessage = qualified
      ? "You are eligible for a follow-up consultation."
      : "Based on our review, a follow-up consultation is not recommended at this time.";
    req.resolvedAt = new Date();
  }
});

const mockAddToWaitlist = vi.fn(async (data: any) => {
  const existing = mockDb.waitlistEntries.find(e => e.email === data.email);
  if (existing) return { alreadyExists: true };
  mockDb.waitlistEntries.push({ id: mockDb.waitlistEntries.length + 1, ...data, createdAt: new Date() });
  return { alreadyExists: false };
});

const mockGetAllQuizSubmissions = vi.fn(async () => mockDb.quizSubmissions);
const mockGetAllFollowUpRequests = vi.fn(async () => mockDb.followUpRequests);
const mockGetAllWaitlist = vi.fn(async () => mockDb.waitlistEntries);
const mockGetAdminStats = vi.fn(async () => ({
  totalQuiz: mockDb.quizSubmissions.length,
  totalFollowUp: mockDb.followUpRequests.length,
  totalWaitlist: mockDb.waitlistEntries.length,
  qualifiedCount: mockDb.followUpRequests.filter(r => r.status === "qualified").length,
  pendingCount: mockDb.followUpRequests.filter(r => r.status === "pending").length,
}));
const mockRecordPageview = vi.fn(async (data: any) => {
  mockDb.pageviews.push(data);
});

// ─── Build Express App (mirrors server/_core/index.ts routes) ───────────────

const ADMIN_PASSWORD = "test-admin-password";

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

function createTestApp() {
  const app = express();
  app.use(express.json());

  // Quiz Submission
  app.post("/api/quiz/submit", async (req: Request, res: Response) => {
    try {
      const { name, email, score, maxScore, tier, answers, recommendation, source, utmSource, utmMedium, utmCampaign } = req.body;
      if (!name || !email || score === undefined || maxScore === undefined || !tier) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }
      await mockSaveQuizSubmission({
        name, email, score: Number(score), maxScore: Number(maxScore), severityTier: tier,
        recommendation: recommendation || null, answers: answers ? JSON.stringify(answers) : null,
        source: source || null, utmSource: utmSource || null, utmMedium: utmMedium || null, utmCampaign: utmCampaign || null,
      });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to save quiz submission" });
    }
  });

  // Follow-Up Request
  app.post("/api/followup/request", async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email } = req.body;
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }
      const sessionId = nanoid(24);
      await mockCreateFollowUpRequest({ sessionId, firstName, lastName, email });
      return res.json({ success: true, sessionId });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to create follow-up request" });
    }
  });

  // Follow-Up Status
  app.get("/api/followup/status/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const result = await mockGetFollowUpRequest(sessionId);
      if (!result) {
        return res.status(404).json({ error: "Session not found" });
      }
      return res.json({ status: result.status, qualified: result.qualified, resultMessage: result.resultMessage });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Make.com Webhook
  app.post("/api/followup-result", async (req: Request, res: Response) => {
    try {
      const { sessionId, qualified } = req.body;
      if (!sessionId || qualified === undefined) {
        return res.status(400).json({ error: "Missing sessionId or qualified field" });
      }
      await mockResolveFollowUpRequest(sessionId, Boolean(qualified));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Waitlist
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      const { name, email, interest } = req.body;
      if (!name || !email) {
        return res.status(400).json({ success: false, error: "Name and email are required" });
      }
      const result = await mockAddToWaitlist({ name, email, interest: interest || null });
      if (result.alreadyExists) {
        return res.json({ success: true, message: "You're already on the waitlist!" });
      }
      return res.json({ success: true, message: "You've been added to the waitlist!" });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to join waitlist" });
    }
  });

  // Admin Login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      return res.json({ success: true, token: ADMIN_PASSWORD });
    }
    return res.status(401).json({ success: false, error: "Invalid password" });
  });

  // Admin Stats (protected)
  app.get("/api/admin/stats", adminAuth, async (_req: Request, res: Response) => {
    const stats = await mockGetAdminStats();
    return res.json(stats);
  });

  // Admin Quiz Submissions (protected)
  app.get("/api/admin/quiz-submissions", adminAuth, async (_req: Request, res: Response) => {
    const submissions = await mockGetAllQuizSubmissions();
    return res.json(submissions);
  });

  // Admin Follow-Up Requests (protected)
  app.get("/api/admin/followup-requests", adminAuth, async (_req: Request, res: Response) => {
    const requests = await mockGetAllFollowUpRequests();
    return res.json(requests);
  });

  // Admin Waitlist (protected)
  app.get("/api/admin/waitlist", adminAuth, async (_req: Request, res: Response) => {
    const entries = await mockGetAllWaitlist();
    return res.json(entries);
  });

  // Admin CSV Export (protected)
  app.get("/api/admin/export/:type", adminAuth, async (req: Request, res: Response) => {
    const { type } = req.params;
    let data: Record<string, any>[] = [];
    let filename = "";
    switch (type) {
      case "quiz": data = await mockGetAllQuizSubmissions(); filename = "quiz-submissions.csv"; break;
      case "followup": data = await mockGetAllFollowUpRequests(); filename = "followup-requests.csv"; break;
      case "waitlist": data = await mockGetAllWaitlist(); filename = "waitlist.csv"; break;
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
  });

  // Analytics Pageview
  app.post("/api/analytics/pageview", async (req: Request, res: Response) => {
    const { page } = req.body;
    if (!page) return res.status(400).json({ error: "Page is required" });
    await mockRecordPageview(req.body);
    return res.json({ success: true });
  });

  return app;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("MeNova REST API Integration Tests", () => {
  const app = createTestApp();

  beforeAll(() => {
    // Reset mock DB
    mockDb.quizSubmissions = [];
    mockDb.followUpRequests = [];
    mockDb.waitlistEntries = [];
    mockDb.pageviews = [];
  });

  // ─── Quiz Submission ────────────────────────────────────────────────────

  describe("POST /api/quiz/submit", () => {
    it("should save a valid quiz submission and return success", async () => {
      const res = await request(app)
        .post("/api/quiz/submit")
        .send({
          name: "Jane Doe",
          email: "jane@example.com",
          score: 15,
          maxScore: 24,
          tier: "Moderate",
          answers: { q1: 3, q2: 2 },
          utmSource: "google",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockSaveQuizSubmission).toHaveBeenCalledTimes(1);
      expect(mockDb.quizSubmissions).toHaveLength(1);
      expect(mockDb.quizSubmissions[0].name).toBe("Jane Doe");
      expect(mockDb.quizSubmissions[0].utmSource).toBe("google");
    });

    it("should reject submission with missing required fields", async () => {
      const res = await request(app)
        .post("/api/quiz/submit")
        .send({ name: "Jane Doe" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Follow-Up Full Flow ──────────────────────────────────────────────

  describe("Follow-Up Request → Poll → Webhook Resolution", () => {
    let sessionId: string;

    it("POST /api/followup/request should create a request and return sessionId", async () => {
      const res = await request(app)
        .post("/api/followup/request")
        .send({ firstName: "Sarah", lastName: "Chen", email: "sarah@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.sessionId).toBeTruthy();
      sessionId = res.body.sessionId;
      expect(mockCreateFollowUpRequest).toHaveBeenCalledTimes(1);
    });

    it("GET /api/followup/status/:sessionId should return pending status", async () => {
      const res = await request(app).get(`/api/followup/status/${sessionId}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("pending");
      expect(res.body.qualified).toBeNull();
    });

    it("POST /api/followup-result (webhook) should resolve the request as qualified", async () => {
      const res = await request(app)
        .post("/api/followup-result")
        .send({ sessionId, qualified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockResolveFollowUpRequest).toHaveBeenCalledWith(sessionId, true);
    });

    it("GET /api/followup/status/:sessionId should now return qualified status", async () => {
      const res = await request(app).get(`/api/followup/status/${sessionId}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("qualified");
      expect(res.body.qualified).toBe(true);
      expect(res.body.resultMessage).toContain("eligible");
    });

    it("should return 404 for non-existent session", async () => {
      const res = await request(app).get("/api/followup/status/nonexistent123");
      expect(res.status).toBe(404);
    });

    it("webhook should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/followup-result")
        .send({ qualified: true });
      expect(res.status).toBe(400);
    });
  });

  // ─── Waitlist ─────────────────────────────────────────────────────────

  describe("POST /api/waitlist", () => {
    it("should add a new waitlist entry", async () => {
      const res = await request(app)
        .post("/api/waitlist")
        .send({ name: "Lisa T", email: "lisa@example.com", interest: "BHRT" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("added");
      expect(mockDb.waitlistEntries).toHaveLength(1);
    });

    it("should handle duplicate email gracefully", async () => {
      const res = await request(app)
        .post("/api/waitlist")
        .send({ name: "Lisa T", email: "lisa@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("already");
    });

    it("should reject missing required fields", async () => {
      const res = await request(app)
        .post("/api/waitlist")
        .send({ name: "Lisa T" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Admin Login ──────────────────────────────────────────────────────

  describe("POST /api/admin/login", () => {
    it("should accept correct password and return token", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({ password: ADMIN_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe(ADMIN_PASSWORD);
    });

    it("should reject incorrect password", async () => {
      const res = await request(app)
        .post("/api/admin/login")
        .send({ password: "wrong-password" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Admin Protected Endpoints ────────────────────────────────────────

  describe("Admin Protected Endpoints", () => {
    it("GET /api/admin/stats should return stats with valid auth", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${ADMIN_PASSWORD}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalQuiz");
      expect(res.body).toHaveProperty("totalFollowUp");
      expect(res.body).toHaveProperty("totalWaitlist");
      expect(typeof res.body.totalQuiz).toBe("number");
    });

    it("GET /api/admin/stats should reject without auth", async () => {
      const res = await request(app).get("/api/admin/stats");
      expect(res.status).toBe(401);
    });

    it("GET /api/admin/stats should reject with wrong token", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", "Bearer wrong-token");
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/quiz-submissions should return submissions", async () => {
      const res = await request(app)
        .get("/api/admin/quiz-submissions")
        .set("Authorization", `Bearer ${ADMIN_PASSWORD}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBe("Jane Doe");
    });

    it("GET /api/admin/followup-requests should return requests", async () => {
      const res = await request(app)
        .get("/api/admin/followup-requests")
        .set("Authorization", `Bearer ${ADMIN_PASSWORD}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /api/admin/waitlist should return entries", async () => {
      const res = await request(app)
        .get("/api/admin/waitlist")
        .set("Authorization", `Bearer ${ADMIN_PASSWORD}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // ─── Admin CSV Export ─────────────────────────────────────────────────

  describe("GET /api/admin/export/:type", () => {
    it("should export quiz submissions as CSV", async () => {
      const res = await request(app)
        .get("/api/admin/export/quiz")
        .set("Authorization", `Bearer ${ADMIN_PASSWORD}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain("name");
      expect(res.text).toContain("Jane Doe");
    });

    it("should export waitlist as CSV", async () => {
      const res = await request(app)
        .get("/api/admin/export/waitlist")
        .set("Authorization", `Bearer ${ADMIN_PASSWORD}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
    });

    it("should reject invalid export type", async () => {
      const res = await request(app)
        .get("/api/admin/export/invalid")
        .set("Authorization", `Bearer ${ADMIN_PASSWORD}`);

      expect(res.status).toBe(400);
    });
  });

  // ─── Analytics Pageview ───────────────────────────────────────────────

  describe("POST /api/analytics/pageview", () => {
    it("should record a pageview", async () => {
      const res = await request(app)
        .post("/api/analytics/pageview")
        .send({ page: "/", referrer: "https://google.com", utmSource: "google" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockRecordPageview).toHaveBeenCalled();
      expect(mockDb.pageviews).toHaveLength(1);
      expect(mockDb.pageviews[0].page).toBe("/");
    });

    it("should reject missing page field", async () => {
      const res = await request(app)
        .post("/api/analytics/pageview")
        .send({ referrer: "https://google.com" });

      expect(res.status).toBe(400);
    });
  });
});
