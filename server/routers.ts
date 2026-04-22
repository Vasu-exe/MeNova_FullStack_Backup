import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import {
  saveQuizSubmission,
  getAllQuizSubmissions,
  createFollowUpRequest,
  getFollowUpRequest,
  resolveFollowUpRequest,
  getAllFollowUpRequests,
  addToWaitlist,
  getAllWaitlist,
} from "./db";
import { z } from "zod";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Quiz procedures
  quiz: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        score: z.number(),
        maxScore: z.number(),
        severityTier: z.string(),
        recommendation: z.string().optional(),
        answers: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await saveQuizSubmission({
          name: input.name,
          email: input.email,
          score: input.score,
          maxScore: input.maxScore,
          severityTier: input.severityTier,
          recommendation: input.recommendation ?? null,
          answers: input.answers ?? null,
          source: input.source ?? null,
        });
        await notifyOwner({
          title: "New Quiz Submission",
          content: `${input.name} (${input.email}) completed the symptom quiz. Severity: ${input.severityTier}, Score: ${input.score}/${input.maxScore}`,
        }).catch(() => {});
        return { success: true };
      }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      return getAllQuizSubmissions();
    }),
  }),

  // Follow-up verification procedures
  followUp: router({
    submit: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const sessionId = nanoid(32);
        await createFollowUpRequest({
          sessionId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          status: "pending",
        });
        try {
          await fetch("https://hook.us2.make.com/dhizujs8dmj9v1255tklx92ehmgxg3uu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email,
              sessionId,
            }),
          });
        } catch (e) {
          console.warn("[Make.com] Follow-up webhook failed:", e);
        }
        return { sessionId };
      }),
    getResult: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const record = await getFollowUpRequest(input.sessionId);
        if (!record) return { status: "not_found" as const };
        return { status: record.status, qualified: record.qualified };
      }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      return getAllFollowUpRequests();
    }),
  }),

  // Waitlist procedures
  waitlist: router({
    join: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        city: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await addToWaitlist({
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          city: input.city ?? null,
        });
        if (result?.alreadyExists) return { success: true, alreadyExists: true };
        await notifyOwner({
          title: "New Waitlist Signup",
          content: `${input.name} (${input.email}) joined the waitlist. City: ${input.city ?? "not specified"}`,
        }).catch(() => {});
        return { success: true, alreadyExists: false };
      }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      return getAllWaitlist();
    }),
  }),

  // AI Chat procedure
  chat: router({
    message: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a compassionate menopause health assistant for MeNova Health, a telehealth clinic in Vancouver, BC, Canada. Help women understand perimenopause and menopause symptoms, explain Bioidentical Hormone Replacement Therapy (BHRT), and guide them toward booking a consultation with a BC-licensed Nurse Practitioner. Key facts: No referral needed, 100% virtual care, Initial consultation $175 CAD (45 min), Monthly bundle $199 CAD/month, Book at https://cal.com/menova/30min. Be warm and empathetic. Do not diagnose or prescribe. Keep responses concise. Always recommend booking a consultation for personalized advice.`,
            },
            ...input.messages,
          ],
        });
        const content = response.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";
        return { content };
      }),
  }),

  // Admin dashboard procedures
  admin: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      const [quizList, followUpList, waitlistList] = await Promise.all([
        getAllQuizSubmissions(),
        getAllFollowUpRequests(),
        getAllWaitlist(),
      ]);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        quiz: {
          total: quizList.length,
          last7Days: quizList.filter(q => q.createdAt > sevenDaysAgo).length,
          last30Days: quizList.filter(q => q.createdAt > thirtyDaysAgo).length,
          bySeverity: {
            early: quizList.filter(q => q.severityTier?.toLowerCase().includes("early")).length,
            moderate: quizList.filter(q => q.severityTier?.toLowerCase().includes("moderate")).length,
            significant: quizList.filter(q => q.severityTier?.toLowerCase().includes("significant")).length,
          },
        },
        followUp: {
          total: followUpList.length,
          pending: followUpList.filter(f => f.status === "pending").length,
          qualified: followUpList.filter(f => f.status === "qualified").length,
          notQualified: followUpList.filter(f => f.status === "not_qualified").length,
        },
        waitlist: {
          total: waitlistList.length,
          last7Days: waitlistList.filter(w => w.createdAt > sevenDaysAgo).length,
        },
      };
    }),
    quizSubmissions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      return getAllQuizSubmissions();
    }),
    followUpRequests: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      return getAllFollowUpRequests();
    }),
    waitlist: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      return getAllWaitlist();
    }),
  }),
});

export type AppRouter = typeof appRouter;
