import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── JSON File-Based Data Store ──────────────────────────────────────────────
const DATA_DIR = path.resolve(__dirname, "..", "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore<T>(filename: string): T[] {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch {
    return [];
  }
}

function writeStore<T>(filename: string, data: T[]): void {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
}

function appendToStore<T>(filename: string, item: T): void {
  const data = readStore<T>(filename);
  data.push(item);
  writeStore(filename, data);
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface QuizSubmission {
  id: string;
  name: string;
  email: string;
  score: number;
  maxScore: number;
  tier: string;
  answers: Record<string, { id: string; label: string }[]>;
  recommendation: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
}

interface FollowUpRequest {
  id: string;
  sessionId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "pending" | "qualified" | "not_qualified";
  resultMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  interest: string;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Admin Auth ──────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.MENOVA_ADMIN_PASSWORD || "menova2026";

function checkAdminAuth(req: express.Request, res: express.Response): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  const token = authHeader.split(" ")[1];
  if (token !== ADMIN_PASSWORD) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

// ─── Server Setup ────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "1mb" }));

  // ── CORS for dev ──
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 1. Quiz Submission ──────────────────────────────────────────────────
  app.post("/api/quiz/submit", (req, res) => {
    try {
      const { name, email, score, maxScore, tier, answers, recommendation, source, utmSource, utmMedium, utmCampaign } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: "Name and email are required" });
        return;
      }

      const submission: QuizSubmission = {
        id: crypto.randomUUID(),
        name,
        email,
        score: score ?? 0,
        maxScore: maxScore ?? 0,
        tier: tier ?? "Unknown",
        answers: answers ?? {},
        recommendation: recommendation ?? "",
        source: source ?? "",
        utmSource: utmSource ?? "",
        utmMedium: utmMedium ?? "",
        utmCampaign: utmCampaign ?? "",
        createdAt: new Date().toISOString(),
      };

      appendToStore("quiz_submissions.json", submission);

      res.json({ success: true, id: submission.id });
    } catch (err) {
      console.error("[Quiz Submit Error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── 2. Follow-Up Request (with real-time polling) ───────────────────────
  app.post("/api/followup/request", (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;

      if (!firstName || !lastName || !email) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const sessionId = crypto.randomUUID();

      const request: FollowUpRequest = {
        id: crypto.randomUUID(),
        sessionId,
        firstName,
        lastName,
        email,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      appendToStore("followup_requests.json", request);

      // Also send to Make.com webhook (fire-and-forget)
      fetch("https://hook.us2.make.com/dhizujs8dmj9v1255tklx92ehmgxg3uu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          sessionId,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error("[Make.com Webhook Error]", err));

      res.json({ success: true, sessionId });
    } catch (err) {
      console.error("[Follow-Up Request Error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── 2b. Follow-Up Status Poll ──────────────────────────────────────────
  app.get("/api/followup/status/:sessionId", (req, res) => {
    try {
      const { sessionId } = req.params;
      const requests = readStore<FollowUpRequest>("followup_requests.json");
      const found = requests.find((r) => r.sessionId === sessionId);

      if (!found) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      res.json({
        status: found.status,
        firstName: found.firstName,
        resultMessage: found.resultMessage ?? null,
      });
    } catch (err) {
      console.error("[Follow-Up Status Error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── 2c. Make.com Webhook Receiver (updates follow-up status) ───────────
  app.post("/api/followup-result", (req, res) => {
    try {
      const { sessionId, email, qualified, message } = req.body;

      if (!sessionId && !email) {
        res.status(400).json({ error: "sessionId or email is required" });
        return;
      }

      const requests = readStore<FollowUpRequest>("followup_requests.json");
      const idx = requests.findIndex(
        (r) => (sessionId && r.sessionId === sessionId) || (email && r.email === email)
      );

      if (idx === -1) {
        res.status(404).json({ error: "Follow-up request not found" });
        return;
      }

      requests[idx].status = qualified ? "qualified" : "not_qualified";
      requests[idx].resultMessage = message ?? (qualified
        ? "Great news! You're eligible for a follow-up appointment."
        : "We couldn't find a matching record. Please book an initial consultation instead.");
      requests[idx].updatedAt = new Date().toISOString();

      writeStore("followup_requests.json", requests);

      res.json({ success: true });
    } catch (err) {
      console.error("[Follow-Up Result Error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── 3. Waitlist ────────────────────────────────────────────────────────
  app.post("/api/waitlist/join", (req, res) => {
    try {
      const { name, email, interest } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: "Name and email are required" });
        return;
      }

      // Check for duplicate
      const existing = readStore<WaitlistEntry>("waitlist.json");
      if (existing.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
        res.json({ success: true, message: "You're already on the waitlist!" });
        return;
      }

      const entry: WaitlistEntry = {
        id: crypto.randomUUID(),
        name,
        email,
        interest: interest ?? "",
        createdAt: new Date().toISOString(),
      };

      appendToStore("waitlist.json", entry);

      res.json({ success: true, message: "You've been added to the waitlist!" });
    } catch (err) {
      console.error("[Waitlist Error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── 4. AI Chat ─────────────────────────────────────────────────────────
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Messages array is required" });
        return;
      }

      const userMessage = messages[messages.length - 1]?.content ?? "";

      // Built-in menopause Q&A knowledge base
      const response = getMenopauseResponse(userMessage);

      res.json({
        role: "assistant",
        content: response,
      });
    } catch (err) {
      console.error("[Chat Error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── 5. Admin Routes ───────────────────────────────────────────────────
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    if (!checkAdminAuth(req, res)) return;

    const quizzes = readStore<QuizSubmission>("quiz_submissions.json");
    const followups = readStore<FollowUpRequest>("followup_requests.json");
    const waitlist = readStore<WaitlistEntry>("waitlist.json");

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    res.json({
      totalQuizSubmissions: quizzes.length,
      totalFollowUpRequests: followups.length,
      totalWaitlist: waitlist.length,
      quizThisWeek: quizzes.filter((q) => new Date(q.createdAt) >= weekAgo).length,
      followUpQualified: followups.filter((f) => f.status === "qualified").length,
      followUpPending: followups.filter((f) => f.status === "pending").length,
      averageQuizScore: quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, q) => sum + (q.score / q.maxScore) * 100, 0) / quizzes.length)
        : 0,
      tierBreakdown: {
        earlyStage: quizzes.filter((q) => q.tier === "Early Stage").length,
        moderate: quizzes.filter((q) => q.tier === "Moderate Symptoms").length,
        significant: quizzes.filter((q) => q.tier === "Significant Symptoms").length,
      },
      utmSources: getTopSources(quizzes),
    });
  });

  app.get("/api/admin/quiz-submissions", (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const quizzes = readStore<QuizSubmission>("quiz_submissions.json");
    res.json(quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.get("/api/admin/followup-requests", (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const followups = readStore<FollowUpRequest>("followup_requests.json");
    res.json(followups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.get("/api/admin/waitlist", (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const waitlist = readStore<WaitlistEntry>("waitlist.json");
    res.json(waitlist.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.get("/api/admin/export/:type", (req, res) => {
    if (!checkAdminAuth(req, res)) return;

    const { type } = req.params;
    let data: Record<string, unknown>[] = [];
    let filename = "";

    switch (type) {
      case "quiz":
        data = readStore<QuizSubmission>("quiz_submissions.json");
        filename = "quiz_submissions.csv";
        break;
      case "followup":
        data = readStore<FollowUpRequest>("followup_requests.json");
        filename = "followup_requests.csv";
        break;
      case "waitlist":
        data = readStore<WaitlistEntry>("waitlist.json");
        filename = "waitlist.csv";
        break;
      default:
        res.status(400).json({ error: "Invalid export type" });
        return;
    }

    if (data.length === 0) {
      res.status(404).json({ error: "No data to export" });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvRows.join("\n"));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MENOPAUSE AI KNOWLEDGE BASE
  // ═══════════════════════════════════════════════════════════════════════════
  function getMenopauseResponse(question: string): string {
    const q = question.toLowerCase();

    // Hot flashes
    if (q.includes("hot flash") || q.includes("hot flush") || q.includes("night sweat")) {
      return "**Hot flashes and night sweats** are among the most common menopause symptoms, affecting up to 80% of women. They're caused by declining estrogen levels affecting your body's temperature regulation.\n\n**What can help:**\n- Bioidentical Hormone Replacement Therapy (BHRT) is the most effective treatment\n- Dress in layers and keep your bedroom cool\n- Avoid triggers like spicy food, alcohol, and caffeine\n- Regular exercise can reduce frequency and severity\n\nMost MeNova patients see significant improvement within 4–8 weeks of starting BHRT. Would you like to book a consultation to discuss your options?";
    }

    // Sleep
    if (q.includes("sleep") || q.includes("insomnia") || q.includes("can't sleep") || q.includes("waking up")) {
      return "**Sleep disturbances** are extremely common during perimenopause and menopause. Fluctuating hormones — especially progesterone and estrogen — directly affect your sleep quality.\n\n**What can help:**\n- BHRT can significantly improve sleep quality by restoring hormone balance\n- Maintain a consistent sleep schedule\n- Keep your bedroom cool (18–20°C)\n- Limit screen time before bed\n- Consider magnesium supplementation (consult your NP first)\n\nMany of our patients report better sleep within 2–4 weeks of starting their personalized care plan.";
    }

    // Brain fog
    if (q.includes("brain fog") || q.includes("memory") || q.includes("concentration") || q.includes("focus") || q.includes("forget")) {
      return "**Brain fog and memory issues** during menopause are real and validated by research. Estrogen plays a key role in brain function, and declining levels can affect concentration, word recall, and mental clarity.\n\n**What can help:**\n- BHRT can improve cognitive function by restoring estrogen levels\n- Regular aerobic exercise (even 30 min walks)\n- Omega-3 fatty acids and B vitamins\n- Adequate sleep (7–9 hours)\n- Mental stimulation and social engagement\n\nThis is not \"just aging\" — it's a treatable hormonal symptom. Our NPs can help you get your clarity back.";
    }

    // Mood / anxiety / depression
    if (q.includes("mood") || q.includes("anxiety") || q.includes("depress") || q.includes("irritab") || q.includes("emotional")) {
      return "**Mood changes, anxiety, and depression** during menopause are directly linked to hormonal fluctuations. Estrogen and progesterone both influence serotonin and other neurotransmitters.\n\n**What can help:**\n- BHRT can stabilize mood by restoring hormonal balance\n- Regular physical activity (natural mood booster)\n- Mindfulness and stress reduction techniques\n- Adequate sleep and nutrition\n- Professional support when needed\n\nYou don't have to push through this alone. Our NPs understand the hormonal connection and can create a plan that addresses the root cause.";
    }

    // Weight
    if (q.includes("weight") || q.includes("belly fat") || q.includes("metabolism")) {
      return "**Weight gain during menopause** — especially around the abdomen — is linked to declining estrogen and changes in metabolism. Your body's fat distribution shifts, and muscle mass naturally decreases.\n\n**What can help:**\n- BHRT can help redistribute fat and support metabolism\n- Strength training to maintain muscle mass\n- Protein-rich diet (aim for 1.2g per kg body weight)\n- Reduce refined carbs and processed foods\n- Manage stress (cortisol promotes belly fat)\n\nOur NPs can assess whether hormonal imbalance is contributing to your weight changes and recommend a personalized approach.";
    }

    // BHRT
    if (q.includes("bhrt") || q.includes("bioidentical") || q.includes("hormone therapy") || q.includes("hrt")) {
      return "**Bioidentical Hormone Replacement Therapy (BHRT)** uses plant-derived hormones that are molecularly identical to those your body naturally produces. Unlike synthetic HRT, BHRT is custom-compounded to your specific needs.\n\n**Key facts:**\n- Derived from plant sources (yam, soy)\n- Molecularly identical to human estrogen, progesterone, and testosterone\n- Custom-compounded for your specific hormone levels\n- Available as creams, gels, patches, or capsules\n- Prescribed by BC-licensed Nurse Practitioners\n- Follows current NAMS and SOGC guidelines\n\n**At MeNova:**\n- Initial consultation: $175 CAD\n- Monthly care bundle: $199 CAD/month\n- Medications delivered to your door\n\nWould you like to take our free symptom quiz to see if BHRT might be right for you?";
    }

    // Cost / pricing / insurance
    if (q.includes("cost") || q.includes("price") || q.includes("insurance") || q.includes("cover") || q.includes("afford") || q.includes("pay")) {
      return "**MeNova Health Pricing:**\n\n| Service | Cost |\n|---|---|\n| Initial Consultation | $175 CAD (one-time) |\n| Monthly Care Bundle | $199 CAD/month |\n\nThe Monthly Care Bundle includes: follow-up appointments, custom BHRT medications, unlimited 24/7 messaging, symptom tracking, and discreet home delivery.\n\n**Insurance coverage:**\n- BC PharmaCare covers standard menopausal hormone therapy for eligible BC residents\n- Most private insurance plans (Sun Life, Manulife, Great-West Life) cover the medication portion\n- Our care team will help you navigate your benefits\n\nNo referral needed. Cancel anytime.";
    }

    // Appointment / booking
    if (q.includes("book") || q.includes("appointment") || q.includes("consult") || q.includes("schedule")) {
      return "**Booking with MeNova is simple:**\n\n1. **Take the free symptom quiz** — it takes about 3 minutes and helps us understand your needs\n2. **Book your video consultation** — choose a time that works for you\n3. **Meet your NP** — a 45-minute video call with a BC-licensed Nurse Practitioner\n\n**What to expect:**\n- Most patients are seen within 3–5 business days\n- No referral needed\n- 100% virtual — from anywhere in BC\n- Secure video call platform\n\nBook directly at [cal.com/menova/30min](https://cal.com/menova/30min) or take the symptom quiz first for a personalized recommendation.";
    }

    // Safety / side effects
    if (q.includes("safe") || q.includes("side effect") || q.includes("risk") || q.includes("danger")) {
      return "**BHRT safety is well-established** when prescribed and monitored by qualified healthcare providers.\n\n**Key safety points:**\n- BHRT follows current NAMS (North American Menopause Society) guidelines\n- All prescriptions are by BC-licensed Nurse Practitioners\n- Regular monitoring and follow-ups are included\n- Medications are from Health Canada–regulated pharmacies\n\n**Possible side effects** (usually temporary):\n- Breast tenderness\n- Spotting or breakthrough bleeding\n- Headaches\n- Bloating\n\nThese typically resolve within the first few weeks. Your NP will monitor your progress and adjust your plan as needed.\n\n**Important:** BHRT may not be suitable for everyone. Your NP will review your full health history during your consultation.";
    }

    // General / greeting
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.length < 10) {
      return "Hello! I'm MeNova's menopause health assistant. I can help you with questions about:\n\n- **Menopause symptoms** (hot flashes, sleep, brain fog, mood, weight)\n- **BHRT** (Bioidentical Hormone Replacement Therapy)\n- **Pricing and insurance** coverage\n- **Booking** a consultation\n- **Safety** and side effects\n\nWhat would you like to know about? Feel free to ask anything — I'm here to help!";
    }

    // Default
    return "That's a great question about menopause health. While I can provide general information, every woman's experience is unique.\n\n**Here's what I'd recommend:**\n1. **Take our free symptom quiz** — it takes 3 minutes and gives you a personalized assessment\n2. **Book a consultation** with one of our BC-licensed Nurse Practitioners for expert, personalized guidance\n\nOur NPs specialize in menopause care and can address your specific concerns in detail. The initial consultation is $175 CAD and most patients are seen within 3–5 business days.\n\nIs there a specific symptom or topic I can help you with?";
  }

  function getTopSources(quizzes: QuizSubmission[]): Record<string, number> {
    const sources: Record<string, number> = {};
    quizzes.forEach((q) => {
      const src = q.utmSource || q.source || "direct";
      sources[src] = (sources[src] || 0) + 1;
    });
    return sources;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATIC FILES & CLIENT-SIDE ROUTING
  // ═══════════════════════════════════════════════════════════════════════════
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 3001);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
