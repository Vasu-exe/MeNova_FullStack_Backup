import { useState } from "react";
import { CheckCircle2, Bell, ArrowRight } from "lucide-react";

export default function WaitlistSection() {
  const [formData, setFormData] = useState({ name: "", email: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
  };

  if (submitted) {
    return (
      <section
        className="py-16 lg:py-20"
        style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "oklch(0.24 0.07 155 / 0.10)" }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: "oklch(0.24 0.07 155)" }} />
          </div>
          <h3
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
          >
            You're on the list!
          </h3>
          <p
            className="text-base"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
          >
            We'll notify you as soon as new appointment slots open up. Thank you for your interest in MeNova Health.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="waitlist"
      className="py-16 lg:py-20"
      style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 lg:p-12 shadow-sm"
          style={{
            backgroundColor: "white",
            border: "2px solid oklch(0.88 0.01 90)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "oklch(0.60 0.12 42 / 0.10)" }}
            >
              <Bell className="w-6 h-6" style={{ color: "oklch(0.60 0.12 42)" }} />
            </div>
            <h3
              className="text-2xl lg:text-3xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.22 0.005 65)" }}
            >
              Join the{" "}
              <em className="not-italic" style={{ color: "oklch(0.60 0.12 42)" }}>
                Waitlist
              </em>
            </h3>
            <p
              className="text-base max-w-md mx-auto"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.45 0.005 65)" }}
            >
              Appointment slots fill up quickly. Join our waitlist and be the first to know when new times open up.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
              <input
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                style={{
                  borderColor: "oklch(0.88 0.01 90)",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "oklch(0.22 0.005 65)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                style={{
                  borderColor: "oklch(0.88 0.01 90)",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "oklch(0.22 0.005 65)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
            <div>
              <select
                value={formData.interest}
                onChange={(e) => setFormData((prev) => ({ ...prev, interest: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                style={{
                  borderColor: "oklch(0.88 0.01 90)",
                  fontFamily: "'DM Sans', sans-serif",
                  color: formData.interest ? "oklch(0.22 0.005 65)" : "oklch(0.55 0.005 65)",
                  fontSize: "0.95rem",
                }}
              >
                <option value="">What are you most interested in? (optional)</option>
                <option value="bhrt">Bioidentical Hormone Therapy (BHRT)</option>
                <option value="consultation">Initial Consultation</option>
                <option value="followup">Follow-up Appointment</option>
                <option value="general">General Information</option>
              </select>
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: "oklch(0.60 0.20 25)", fontFamily: "'DM Sans', sans-serif" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                backgroundColor: "oklch(0.60 0.12 42)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.95rem",
              }}
            >
              Join Waitlist <ArrowRight className="w-4 h-4" />
            </button>

            <p
              className="text-xs text-center"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.60 0.005 65)" }}
            >
              We'll only email you when slots open. No spam, ever.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
