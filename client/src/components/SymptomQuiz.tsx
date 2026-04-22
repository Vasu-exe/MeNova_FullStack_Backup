/**
 * MeNova Health — Symptom Assessment Quiz
 * Design: Biophilic Wellness Modernism
 * Colors: Forest green (#1a4a35 approx), terracotta, cream
 * Fonts: Playfair Display (headings), DM Sans (body)
 *
 * Flow:
 *  1. Welcome screen
 *  2. 8 symptom questions (single/multi-select)
 *  3. Contact capture (name + email)
 *  4. Personalised results screen with severity score + booking CTA
 */

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Leaf, X } from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = "single" | "multi" | "scale";

interface Option {
  id: string;
  label: string;
  weight: number; // 0–3: contribution to severity score
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  subtitle?: string;
  options: Option[];
}

interface ContactInfo {
  name: string;
  email: string;
}

// ─── Quiz Data ────────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: "stage",
    type: "single",
    question: "Where are you in your menopause journey?",
    subtitle: "This helps us personalise your care plan.",
    options: [
      { id: "peri_early", label: "Perimenopause — just starting to notice changes", weight: 1 },
      { id: "peri_mid", label: "Perimenopause — symptoms are affecting my daily life", weight: 2 },
      { id: "meno", label: "Menopause — my periods have stopped", weight: 2 },
      { id: "post", label: "Post-menopause — it's been over a year since my last period", weight: 1 },
      { id: "unsure", label: "I'm not sure — I just know something feels off", weight: 1 },
    ],
  },
  {
    id: "hot_flashes",
    type: "single",
    question: "How often do you experience hot flashes or night sweats?",
    options: [
      { id: "never", label: "Rarely or never", weight: 0 },
      { id: "mild", label: "A few times a week — manageable", weight: 1 },
      { id: "moderate", label: "Daily — noticeable but I push through", weight: 2 },
      { id: "severe", label: "Multiple times a day — significantly disruptive", weight: 3 },
    ],
  },
  {
    id: "sleep",
    type: "single",
    question: "How is your sleep quality?",
    options: [
      { id: "good", label: "I sleep well most nights", weight: 0 },
      { id: "mild", label: "Occasionally disrupted — I wake up sometimes", weight: 1 },
      { id: "moderate", label: "Often disrupted — I feel tired most mornings", weight: 2 },
      { id: "severe", label: "Severely disrupted — I rarely get a full night's sleep", weight: 3 },
    ],
  },
  {
    id: "mood",
    type: "single",
    question: "Have you noticed changes in your mood or mental wellbeing?",
    options: [
      { id: "none", label: "No significant changes", weight: 0 },
      { id: "mild", label: "Mild irritability or occasional anxiety", weight: 1 },
      { id: "moderate", label: "Noticeable mood swings, anxiety, or low mood", weight: 2 },
      { id: "severe", label: "Significant depression, anxiety, or emotional instability", weight: 3 },
    ],
  },
  {
    id: "brain_fog",
    type: "single",
    question: "Do you experience brain fog or memory issues?",
    options: [
      { id: "none", label: "My thinking feels sharp", weight: 0 },
      { id: "mild", label: "Occasionally forgetful or unfocused", weight: 1 },
      { id: "moderate", label: "Regularly struggle to concentrate or recall things", weight: 2 },
      { id: "severe", label: "Brain fog is affecting my work or daily life significantly", weight: 3 },
    ],
  },
  {
    id: "symptoms_multi",
    type: "multi",
    question: "Which of these symptoms are you experiencing? (Select all that apply)",
    subtitle: "This helps us understand the full picture.",
    options: [
      { id: "fatigue", label: "Persistent fatigue or low energy", weight: 2 },
      { id: "weight", label: "Unexplained weight gain (especially around the abdomen)", weight: 2 },
      { id: "libido", label: "Low libido or changes in sexual health", weight: 2 },
      { id: "vaginal", label: "Vaginal dryness or discomfort", weight: 2 },
      { id: "hair", label: "Hair thinning or skin changes", weight: 1 },
      { id: "joints", label: "Joint pain or muscle aches", weight: 1 },
      { id: "heart", label: "Heart palpitations", weight: 2 },
      { id: "none_multi", label: "None of the above", weight: 0 },
    ],
  },
  {
    id: "impact",
    type: "single",
    question: "How much are your symptoms impacting your quality of life?",
    options: [
      { id: "none", label: "Minimal — I'm managing fine", weight: 0 },
      { id: "mild", label: "Mild — I notice them but they don't stop me", weight: 1 },
      { id: "moderate", label: "Moderate — they're affecting my work, relationships, or sleep", weight: 2 },
      { id: "severe", label: "Significant — I feel like a different person", weight: 3 },
    ],
  },
  {
    id: "treatment_history",
    type: "single",
    question: "Have you tried any hormone therapy or menopause treatment before?",
    options: [
      { id: "no", label: "No, this would be my first time", weight: 0 },
      { id: "otc", label: "Only over-the-counter supplements or herbal remedies", weight: 1 },
      { id: "conventional", label: "Yes — conventional HRT prescribed by a doctor", weight: 1 },
      { id: "bhrt", label: "Yes — Bioidentical Hormone Replacement Therapy (BHRT)", weight: 1 },
      { id: "stopped", label: "I tried something but stopped due to side effects or concerns", weight: 2 },
    ],
  },
];

// ─── Result Tiers ─────────────────────────────────────────────────────────────
function getResult(score: number, maxScore: number) {
  const pct = score / maxScore;
  if (pct < 0.25) {
    return {
      tier: "Early Stage",
      color: "oklch(0.55 0.12 155)",
      bg: "oklch(0.96 0.03 155)",
      headline: "Your symptoms are mild — but early action matters.",
      body: "Your responses suggest you're in the early stages of hormonal change. Many women in this phase benefit from a proactive consultation to establish a baseline and a personalised plan before symptoms progress.",
      urgency: "Recommended",
    };
  } else if (pct < 0.55) {
    return {
      tier: "Moderate Symptoms",
      color: "oklch(0.60 0.13 60)",
      bg: "oklch(0.97 0.04 60)",
      headline: "Your symptoms are affecting your daily life.",
      body: "Your responses indicate moderate menopause symptoms that are impacting your sleep, mood, or energy. A personalised Bioidentical Hormone Replacement Therapy (BHRT) plan could significantly improve how you feel within 4–8 weeks.",
      urgency: "Strongly Recommended",
    };
  } else {
    return {
      tier: "Significant Symptoms",
      color: "oklch(0.52 0.18 30)",
      bg: "oklch(0.97 0.04 30)",
      headline: "Your symptoms are significantly impacting your wellbeing.",
      body: "Your responses suggest you're experiencing significant hormonal disruption. You deserve relief — and you shouldn't have to wait 6–12 months for a specialist referral. A BC-licensed Nurse Practitioner can see you this week and build a personalised care plan.",
      urgency: "Urgent — See an NP This Week",
    };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span
          className="text-xs font-medium"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
        >
          Question {current} of {total}
        </span>
        <span
          className="text-xs font-medium"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.24 0.07 155)" }}
        >
          {pct}% complete
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "oklch(0.90 0.02 155)" }}>
        <motion.div
          className="h-1.5 rounded-full"
          style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Main Quiz Component ──────────────────────────────────────────────────────
interface SymptomQuizProps {
  onClose: () => void;
}

export default function SymptomQuiz({ onClose }: SymptomQuizProps) {
  const [step, setStep] = useState<"welcome" | "questions" | "contact" | "results">("welcome");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [contact, setContact] = useState<ContactInfo>({ name: "", email: "" });
  const [direction, setDirection] = useState(1);

  const currentQ = QUESTIONS[questionIdx];

  // ── Score calculation ──
  const totalScore = QUESTIONS.reduce((acc, q) => {
    const selected = answers[q.id] ?? [];
    const qScore = q.options
      .filter((o) => selected.includes(o.id))
      .reduce((s, o) => s + o.weight, 0);
    return acc + qScore;
  }, 0);

  const maxScore = QUESTIONS.reduce((acc, q) => {
    const max = Math.max(...q.options.map((o) => o.weight));
    return acc + (q.type === "multi" ? q.options.filter((o) => o.id !== "none_multi").reduce((s, o) => s + o.weight, 0) : max);
  }, 0);

  const result = getResult(totalScore, maxScore);

  // ── Handlers ──
  function selectOption(qId: string, optId: string, type: QuestionType) {
    setAnswers((prev) => {
      if (type === "single") {
        return { ...prev, [qId]: [optId] };
      }
      // multi
      const current = prev[qId] ?? [];
      if (optId === "none_multi") return { ...prev, [qId]: ["none_multi"] };
      const withoutNone = current.filter((id) => id !== "none_multi");
      if (withoutNone.includes(optId)) {
        return { ...prev, [qId]: withoutNone.filter((id) => id !== optId) };
      }
      return { ...prev, [qId]: [...withoutNone, optId] };
    });
  }

  function nextQuestion() {
    setDirection(1);
    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx((i) => i + 1);
    } else {
      setStep("contact");
    }
  }

  function prevQuestion() {
    setDirection(-1);
    if (questionIdx > 0) {
      setQuestionIdx((i) => i - 1);
    } else {
      setStep("welcome");
    }
  }
function formatAnswers() {
  const formatted: Record<string, { id: string; label: string }[]> = {};

  QUESTIONS.forEach((q) => {
    const selectedIds = answers[q.id] ?? [];

    const selectedOptions = q.options
      .filter((opt) => selectedIds.includes(opt.id))
      .map((opt) => ({
        id: opt.id,
        label: opt.label,
      }));

    formatted[q.id] = selectedOptions;
  });

  return formatted;
}
function submitContact(e: React.FormEvent) {
  e.preventDefault();

  const formattedAnswers = formatAnswers();
    // Send quiz data to Make.com webhook
  const quizData = {
    name: contact.name,
    email: contact.email,
    timestamp: new Date().toISOString(),
    score: totalScore,
    maxScore: maxScore,
    tier: result.tier,
    answers: formattedAnswers, // ✅ now includes label + id
    recommendation: result.body,
  };

  // Save to backend database
  fetch('/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...quizData,
      source: sessionStorage.getItem('menova_source') || '',
      utmSource: sessionStorage.getItem('menova_utm_source') || '',
      utmMedium: sessionStorage.getItem('menova_utm_medium') || '',
      utmCampaign: sessionStorage.getItem('menova_utm_campaign') || '',
    }),
  }).catch((err) => console.error('Backend save error:', err));

  // Also send to Make.com webhook (existing flow)
  fetch('https://hook.us2.make.com/q2vzlc48xdjdmchngqbi3j1u0ilq0n4d', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quizData),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Webhook failed');
      }
    })
    .catch((err) => {
      console.error('Webhook error:', err);
    });

  setStep("results");
}
  const isAnswered =
    step === "questions" &&
    (answers[currentQ?.id] ?? []).length > 0;

  // ── Slide variants ──
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,30,20,0.75)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "white", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
          aria-label="Close quiz"
        >
          <X className="w-5 h-5" style={{ color: "oklch(0.45 0.005 65)" }} />
        </button>

        {/* ── Welcome Screen ── */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.10)" }}
            >
              <Leaf className="w-6 h-6" style={{ color: "oklch(0.24 0.07 155)" }} />
            </div>
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                backgroundColor: "oklch(0.24 0.07 155 / 0.08)",
                color: "oklch(0.24 0.07 155)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Free Symptom Assessment
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Let's understand{" "}
              <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
                your symptoms
              </em>
            </h2>
            <p
              className="text-base mb-8 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              Answer 8 quick questions about how you've been feeling. We'll generate a personalised
              symptom report and recommend the right care path for you — in under 3 minutes.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              {["Takes 3 minutes", "100% confidential", "No obligation"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.24 0.07 155)" }} />
                  <span
                    className="text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setStep("questions"); setQuestionIdx(0); }}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: "oklch(0.24 0.07 155)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Start My Assessment <ArrowRight className="inline w-4 h-4 ml-2" />
            </button>
          </motion.div>
        )}

        {/* ── Questions Screen ── */}
        {step === "questions" && (
          <div className="p-8 sm:p-12">
            <ProgressBar current={questionIdx + 1} total={QUESTIONS.length} />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQ.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <h3
                  className="text-xl sm:text-2xl font-bold mb-2 leading-snug"
                  style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
                >
                  {currentQ.question}
                </h3>
                {currentQ.subtitle && (
                  <p
                    className="text-sm mb-6"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
                  >
                    {currentQ.subtitle}
                  </p>
                )}
                {!currentQ.subtitle && <div className="mb-6" />}

                <div className="space-y-3">
                  {currentQ.options.map((opt) => {
                    const selected = (answers[currentQ.id] ?? []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectOption(currentQ.id, opt.id, currentQ.type)}
                        className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 flex items-center gap-3"
                        style={{
                          borderColor: selected ? "oklch(0.24 0.07 155)" : "oklch(0.88 0.01 90)",
                          backgroundColor: selected ? "oklch(0.24 0.07 155 / 0.06)" : "white",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                          style={{
                            borderColor: selected ? "oklch(0.24 0.07 155)" : "oklch(0.75 0.01 90)",
                            backgroundColor: selected ? "oklch(0.24 0.07 155)" : "transparent",
                          }}
                        >
                          {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: selected ? "oklch(0.22 0.07 155)" : "oklch(0.35 0.005 65)" }}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevQuestion}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={nextQuestion}
                disabled={!isAnswered}
                className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "oklch(0.24 0.07 155)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {questionIdx < QUESTIONS.length - 1 ? "Next" : "See My Results"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Contact Capture ── */}
        {step === "contact" && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.10)" }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: "oklch(0.24 0.07 155)" }} />
            </div>
            <h3
              className="text-2xl sm:text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Almost there — where should we send your results?
            </h3>
            <p
              className="text-sm mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
            >
              Your personalised symptom report will be shown instantly. We'll also send a copy to your email.
            </p>
            <form onSubmit={submitContact} className="space-y-4">
              <div>
                <label
                  htmlFor="quiz-name"
                  className="block text-sm font-medium mb-1.5"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
                >
                  Full Name
                </label>
                <input
                  id="quiz-name"
                  type="text"
                  required
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="e.g. Sarah"
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
                  style={{
                    borderColor: "oklch(0.88 0.01 90)",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "oklch(0.22 0.005 65)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "oklch(0.24 0.07 155)")}
                  onBlur={(e) => (e.target.style.borderColor = "oklch(0.88 0.01 90)")}
                />
              </div>
              <div>
                <label
                  htmlFor="quiz-email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
                >
                  Email address
                </label>
                <input
                  id="quiz-email"
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
                  style={{
                    borderColor: "oklch(0.88 0.01 90)",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "oklch(0.22 0.005 65)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "oklch(0.24 0.07 155)")}
                  onBlur={(e) => (e.target.style.borderColor = "oklch(0.88 0.01 90)")}
                />
              </div>
              <p
                className="text-xs"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.65 0.005 65)" }}
              >
                Your information is protected under PIPEDA. We never share your data with third parties.
              </p>
              <button
                type="submit"
                className="w-full py-4 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: "oklch(0.24 0.07 155)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                View My Results <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Results Screen ── */}
        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12"
          >
            {/* Result tier badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                backgroundColor: result.bg,
                color: result.color,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: result.color }}
              />
              {result.tier}
            </div>

            <h3
              className="text-2xl sm:text-3xl font-bold mb-4 leading-snug"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              {contact.name ? `${contact.name}, ` : ""}{result.headline}
            </h3>
            <p
              className="text-base mb-8 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              {result.body}
            </p>

            {/* Score visual */}
            <div
              className="rounded-2xl p-6 mb-8"
              style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
              >
                Your Symptom Burden Score
              </p>
              <div className="flex items-end gap-3 mb-3">
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif", color: result.color }}
                >
                  {totalScore}
                </span>
                <span
                  className="text-lg mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.65 0.005 65)" }}
                >
                  / {maxScore}
                </span>
              </div>
              <div className="w-full h-3 rounded-full" style={{ backgroundColor: "oklch(0.88 0.02 90)" }}>
                <motion.div
                  className="h-3 rounded-full"
                  style={{ backgroundColor: result.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalScore / maxScore) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.65 0.005 65)" }}>Mild</span>
                <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.65 0.005 65)" }}>Significant</span>
              </div>
            </div>

            {/* Symptom summary */}
            {(() => {
              const multiAnswers = answers["symptoms_multi"] ?? [];
              const namedSymptoms = QUESTIONS.find((q) => q.id === "symptoms_multi")
                ?.options.filter((o) => multiAnswers.includes(o.id) && o.id !== "none_multi") ?? [];
              return namedSymptoms.length > 0 ? (
                <div className="mb-8">
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
                  >
                    Symptoms you reported
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {namedSymptoms.map((s) => (
                      <span
                        key={s.id}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: "oklch(0.24 0.07 155 / 0.08)",
                          color: "oklch(0.24 0.07 155)",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Recommendation urgency */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-8"
              style={{ backgroundColor: result.bg }}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: result.color }} />
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: result.color }}
              >
                Care recommendation: {result.urgency}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://cal.com/menova/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-4 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: "oklch(0.24 0.07 155)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Book My Consultation — $175 CAD
              </a>
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-full font-semibold text-base border-2 transition-all hover:bg-gray-50"
                style={{
                  borderColor: "oklch(0.88 0.01 90)",
                  color: "oklch(0.35 0.005 65)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Close
              </button>
            </div>
            <p
              className="text-xs mt-4 text-center"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.65 0.005 65)" }}
            >
              No referral needed · BC-licensed Nurse Practitioners · Cancel anytime
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
