import { useEffect, useRef, useState } from "react";
import { ChevronLeft, CheckCircle2, Mail, Clock, XCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

type VerificationStatus = "idle" | "submitting" | "polling" | "qualified" | "not_qualified" | "timeout";

export default function ScheduleFollowup() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const startPolling = (sid: string) => {
    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current++;

      // Stop after 90 polls (3 minutes at 2s intervals)
      if (pollCountRef.current > 90) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus("timeout");
        return;
      }

      try {
        const res = await fetch(`/api/followup/status/${sid}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "qualified") {
          if (pollRef.current) clearInterval(pollRef.current);
          setResultMessage(data.resultMessage || "You're eligible for a follow-up appointment!");
          setStatus("qualified");
        } else if (data.status === "not_qualified") {
          if (pollRef.current) clearInterval(pollRef.current);
          setResultMessage(data.resultMessage || "We couldn't find a matching record.");
          setStatus("not_qualified");
        }
        // If still "pending", keep polling
      } catch {
        // Ignore network errors, keep polling
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/followup/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setStatus("polling");
        startPolling(data.sessionId);
      } else {
        // Fallback: still show polling state
        setStatus("polling");
      }
    } catch {
      // Fallback: show the old confirmation (email-based)
      setStatus("timeout");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.015 90)" }}>
      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: "oklch(0.88 0.01 90)",
          backgroundColor: "white",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 3C16 3 8 8 8 17C8 21.4 11.6 25 16 25C20.4 25 24 21.4 24 17C24 8 16 3 16 3Z"
                fill="oklch(0.24 0.07 155)"
                opacity="0.9"
              />
              <path
                d="M16 10C16 10 12 13 12 17.5C12 19.9 13.8 22 16 22C18.2 22 20 19.9 20 17.5C20 13 16 10 16 10Z"
                fill="white"
                opacity="0.3"
              />
            </svg>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              MeNova
            </span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "oklch(0.24 0.07 155)", fontFamily: "'DM Sans', sans-serif" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-16">

        {/* ─── FORM STATE ─── */}
        {status === "idle" && (
          <>
            <div className="text-center mb-10">
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-5"
                style={{
                  backgroundColor: "oklch(0.24 0.07 155 / 0.08)",
                  color: "oklch(0.24 0.07 155)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Existing Patients
              </span>
              <h1
                className="text-4xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
              >
                Schedule Your{" "}
                <em className="not-italic" style={{ color: "oklch(0.24 0.07 155)" }}>
                  Follow-up
                </em>
              </h1>
              <p
                className="text-base"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
              >
                Enter the details you used during your first visit. We'll verify your records and show you the result right here on screen.
              </p>
            </div>

            <div
              className="rounded-3xl p-8 shadow-sm"
              style={{
                backgroundColor: "white",
                border: "2px solid oklch(0.88 0.01 90)",
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Sarah"
                    className="w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none"
                    style={{
                      borderColor: errors.firstName ? "oklch(0.60 0.20 25)" : "oklch(0.88 0.01 90)",
                      fontFamily: "'DM Sans', sans-serif",
                      color: "oklch(0.22 0.005 65)",
                      fontSize: "0.95rem",
                    }}
                  />
                  {errors.firstName && (
                    <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.20 25)", fontFamily: "'DM Sans', sans-serif" }}>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Johnson"
                    className="w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none"
                    style={{
                      borderColor: errors.lastName ? "oklch(0.60 0.20 25)" : "oklch(0.88 0.01 90)",
                      fontFamily: "'DM Sans', sans-serif",
                      color: "oklch(0.22 0.005 65)",
                      fontSize: "0.95rem",
                    }}
                  />
                  {errors.lastName && (
                    <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.20 25)", fontFamily: "'DM Sans', sans-serif" }}>
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}
                  >
                    Email Address Used During First Visit
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. sarah@email.com"
                    className="w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none"
                    style={{
                      borderColor: errors.email ? "oklch(0.60 0.20 25)" : "oklch(0.88 0.01 90)",
                      fontFamily: "'DM Sans', sans-serif",
                      color: "oklch(0.22 0.005 65)",
                      fontSize: "0.95rem",
                    }}
                  />
                  {errors.email && (
                    <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.20 25)", fontFamily: "'DM Sans', sans-serif" }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-all mt-2"
                  style={{
                    backgroundColor: "oklch(0.24 0.07 155)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.95rem",
                    letterSpacing: "0.01em",
                  }}
                >
                  Check for Follow-up
                </button>
              </form>
            </div>
          </>
        )}

        {/* ─── SUBMITTING STATE ─── */}
        {status === "submitting" && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6" style={{ color: "oklch(0.24 0.07 155)" }} />
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Submitting your request...
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}>
              Please wait while we send your details for verification.
            </p>
          </div>
        )}

        {/* ─── POLLING STATE (waiting for Make.com result) ─── */}
        {status === "polling" && (
          <div className="text-center py-16">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
              />
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.10)" }}
              >
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "oklch(0.24 0.07 155)" }} />
              </div>
            </div>

            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Checking your records, {formData.firstName}...
            </h2>
            <p
              className="text-base mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              We're verifying your information with our system. This usually takes under a minute.
            </p>

            {/* Progress indicator */}
            <div
              className="rounded-2xl p-6 shadow-sm max-w-sm mx-auto"
              style={{ backgroundColor: "white", border: "2px solid oklch(0.88 0.01 90)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "oklch(0.24 0.07 155)" }} />
                <span
                  className="text-sm font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.35 0.005 65)" }}
                >
                  Verification in progress
                </span>
              </div>
              <p
                className="text-xs"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}
              >
                Your result will appear here automatically. No need to refresh.
              </p>
            </div>
          </div>
        )}

        {/* ─── QUALIFIED RESULT ─── */}
        {status === "qualified" && (
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.10)" }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: "oklch(0.24 0.07 155)" }} />
            </div>

            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              You're Eligible, {formData.firstName}!
            </h2>
            <p
              className="text-base mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              {resultMessage}
            </p>

            <div
              className="rounded-3xl p-8 shadow-sm mb-8"
              style={{ backgroundColor: "white", border: "2px solid oklch(0.88 0.01 90)" }}
            >
              <div className="flex items-start gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid oklch(0.92 0.01 90)" }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.08)" }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: "oklch(0.24 0.07 155)" }} />
                </div>
                <div className="text-left">
                  <p className="font-semibold mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}>
                    Records verified
                  </p>
                  <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}>
                    Your account has been confirmed in our system.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "oklch(0.60 0.12 42 / 0.08)" }}
                >
                  <Mail className="w-5 h-5" style={{ color: "oklch(0.60 0.12 42)" }} />
                </div>
                <div className="text-left">
                  <p className="font-semibold mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}>
                    Book your follow-up now
                  </p>
                  <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}>
                    Click below to schedule your follow-up appointment with your NP.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://cal.com/menova/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-terracotta inline-flex items-center gap-2 text-base mb-4"
              style={{ padding: "1rem 2.5rem" }}
            >
              Book Follow-up Appointment
            </a>

            <br />
            <button
              onClick={() => navigate("/")}
              className="text-sm font-medium underline underline-offset-4 mt-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.24 0.07 155)" }}
            >
              Return to Home
            </button>
          </div>
        )}

        {/* ─── NOT QUALIFIED RESULT ─── */}
        {status === "not_qualified" && (
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "oklch(0.60 0.12 42 / 0.10)" }}
            >
              <XCircle className="w-10 h-10" style={{ color: "oklch(0.60 0.12 42)" }} />
            </div>

            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              No Matching Record Found
            </h2>
            <p
              className="text-base mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              {resultMessage}
            </p>

            <div
              className="rounded-3xl p-8 shadow-sm mb-8"
              style={{ backgroundColor: "white", border: "2px solid oklch(0.88 0.01 90)" }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
              >
                This could mean you haven't had an initial consultation yet, or the details you entered don't match our records. You can book an initial consultation to get started with MeNova Health.
              </p>
            </div>

            <a
              href="https://cal.com/menova/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-forest inline-flex items-center gap-2 text-base mb-4"
              style={{ padding: "1rem 2.5rem" }}
            >
              Book Initial Consultation — $175 CAD
            </a>

            <br />
            <button
              onClick={() => { setStatus("idle"); setSessionId(null); }}
              className="text-sm font-medium underline underline-offset-4 mt-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.24 0.07 155)" }}
            >
              Try Again with Different Details
            </button>
          </div>
        )}

        {/* ─── TIMEOUT STATE (fallback to email) ─── */}
        {status === "timeout" && (
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.10)" }}
            >
              <Clock className="w-10 h-10" style={{ color: "oklch(0.24 0.07 155)" }} />
            </div>

            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Verification Taking Longer Than Expected
            </h2>
            <p
              className="text-base mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              Don't worry, {formData.firstName}. Your request has been received. We'll send the result to your email instead.
            </p>

            <div
              className="rounded-3xl p-8 shadow-sm text-left mb-8"
              style={{ backgroundColor: "white", border: "2px solid oklch(0.88 0.01 90)" }}
            >
              <div className="flex items-start gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid oklch(0.92 0.01 90)" }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.08)" }}
                >
                  <Mail className="w-5 h-5" style={{ color: "oklch(0.24 0.07 155)" }} />
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}>
                    Check your inbox
                  </p>
                  <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}>
                    A follow-up booking link will be sent to{" "}
                    <strong style={{ color: "oklch(0.24 0.07 155)" }}>{formData.email}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "oklch(0.60 0.12 42 / 0.08)" }}
                >
                  <Clock className="w-5 h-5" style={{ color: "oklch(0.60 0.12 42)" }} />
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.22 0.005 65)" }}>
                    Within 5 minutes
                  </p>
                  <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.005 65)" }}>
                    You'll receive an email with your personalised follow-up scheduling link. Please also check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="text-sm font-medium underline underline-offset-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.24 0.07 155)" }}
            >
              Return to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
